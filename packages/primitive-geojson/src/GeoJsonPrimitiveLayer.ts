import {
  ArcType,
  BillboardCollection,
  BlendOption,
  BlendingState,
  CircleGeometry,
  Color,
  ColorGeometryInstanceAttribute,
  Credit,
  DeveloperError,
  Event,
  GeometryInstance,
  LabelCollection,
  PerInstanceColorAppearance,
  PinBuilder,
  PointPrimitiveCollection,
  PolygonGeometry,
  PolygonHierarchy,
  PolylineColorAppearance,
  PolylineGeometry,
  Primitive,
  PrimitiveCollection,
  Resource,
  RuntimeError,
  defined,
  getFilenameFromUri,
} from "cesium";
import { nanoid } from "nanoid";

import { BasicGraphicLayer } from "./BasicGraphicLayer";
import {
  crsLinkHrefs,
  crsLinkTypes,
  crsNames,
  defaultCrsFunction,
  geoJsonObjectTypes,
} from "./GeoJsonLayer-util";
import getPositionsCenter from "./getPositionsCenter";

import type Subscriber from "@cesium-extends/subscriber";
import type {
  BillboardPrimitiveItem,
  CirclePrimitiveItem,
  GeoJsonPrimitiveLayerOptions,
  LabelPrimitiveItem,
  PointPrimitiveItem,
  PolygonPrimitiveItem,
  PolylinePrimitiveItem,
  PrimitiveItem,
} from "./typings";

const DefaultColor = Color.fromCssColorString("#FC4C02");

const DefaultOptions: GeoJsonPrimitiveLayerOptions = {
  markerSize: 10,
  markerColor: DefaultColor,
  stroke: Color.WHITE,
  strokeWidth: 2,
  fill: DefaultColor,
  clampToGround: false,
};
export class GeoJsonPrimitiveLayer extends BasicGraphicLayer {
  private _name: string | undefined;
  private _isLoading: boolean;
  private _error: Event;
  private _loading: Event;
  private _primitiveCollection: PrimitiveCollection;
  readonly _promises: Promise<any>[];
  private _credit: Credit | undefined;
  private _featureItems: PrimitiveItem[] = [];
  private _pinBuilder: PinBuilder;
  private _circleInstances: GeometryInstance[] = [];
  private _polygonInstances: GeometryInstance[] = [];
  private _polylineInstances: GeometryInstance[] = [];
  private _billboardCollection: BillboardCollection;
  private _labelCollection: LabelCollection;
  private _pointCollection: PointPrimitiveCollection;
  private _circlePrimitive: Primitive | undefined;
  private _polygonPrimitive: Primitive | undefined;
  private _polylinePrimitive: Primitive | undefined;
  private _isDestroyed = false;
  private _options: GeoJsonPrimitiveLayerOptions;
  private _geojson: GeoJSON.GeoJSON | undefined;

  constructor(
    options: {
      name?: string;
      subscriber?: Subscriber;
      options?: Partial<GeoJsonPrimitiveLayerOptions>;
    } = {},
  ) {
    super(options);
    this._error = new Event();
    this._isLoading = false;
    this._loading = new Event();
    this._pinBuilder = new PinBuilder();
    this._primitiveCollection = new PrimitiveCollection();
    this._billboardCollection = new BillboardCollection();
    this._labelCollection = new LabelCollection();
    this._pointCollection = new PointPrimitiveCollection({
      blendOption: BlendOption.TRANSLUCENT,
    });
    this._options = { ...DefaultOptions, ...options.options };

    this._promises = [];
    this._credit = undefined;
  }

  get billboardCollection() {
    return this._billboardCollection;
  }

  get labelCollection() {
    return this._labelCollection;
  }

  get pointPrimitiveCollection() {
    return this._pointCollection;
  }

  get primitiveCollection() {
    return this._primitiveCollection;
  }

  get polygonPrimitive() {
    return this._polygonPrimitive;
  }

  get circlePrimitive() {
    return this._circlePrimitive;
  }

  get polylinePrimitive() {
    return this._polylinePrimitive;
  }

  get featureItems() {
    return this._featureItems;
  }

  get pinBuilder() {
    return this._pinBuilder;
  }

  /**
   * Gets or sets a human-readable name for this instance.
   * @type {String}
   */
  get name() {
    return this._name;
  }

  set name(value) {
    if (this._name !== value) {
      this._name = value;
      // @ts-ignore
      this._changed.raiseEvent(this);
    }
  }

  /**
   * Gets a value indicating if the data source is currently loading data.
   * @type {Boolean}
   */
  get loading() {
    return this._isLoading;
  }

  /**
   * Gets an event that will be raised when the underlying data changes.
   * @type {Event}
   */
  get changedEvent() {
    return this._changed;
  }

  get credit() {
    return this._credit;
  }

  /**
   * Gets an event that will be raised if an error is encountered during processing.
   * @type {Event}
   */
  get errorEvent() {
    return this._error;
  }
  /**
   * Gets an event that will be raised when the data source either starts or stops loading.
   * @type {Event}
   */
  get loadingEvent() {
    return this._loading;
  }
  /**
   * Gets whether or not this data source should be displayed.
   * @type {Boolean}
   */
  get show() {
    return this._primitiveCollection.show;
  }
  set show(value) {
    this._primitiveCollection.show = value;
  }
  /**
   * Gets an object that maps the name of a crs to a callback function which takes a GeoJSON coordinate
   * and transforms it into a WGS84 Earth-fixed Cartesian.  Older versions of GeoJSON which
   * supported the EPSG type can be added to this list as well, by specifying the complete EPSG name,
   * for example 'EPSG:4326'.
   * @type {Object}
   */
  get crsNames() {
    return crsNames;
  }

  /**
   * Gets an object that maps the href property of a crs link to a callback function
   * which takes the crs properties object and returns a Promise that resolves
   * to a function that takes a GeoJSON coordinate and transforms it into a WGS84 Earth-fixed Cartesian.
   * Items in this object take precedence over those defined in <code>crsLinkHrefs</code>, assuming
   * the link has a type specified.
   * @type {Object}
   */
  get crsLinkHrefs() {
    return crsLinkHrefs;
  }

  /**
   * Gets an object that maps the type property of a crs link to a callback function
   * which takes the crs properties object and returns a Promise that resolves
   * to a function that takes a GeoJSON coordinate and transforms it into a WGS84 Earth-fixed Cartesian.
   * Items in <code>crsLinkHrefs</code> take precedence over this object.
   * @type {Object}
   */
  get crsLinkTypes() {
    return crsLinkTypes;
  }

  get isDestroyed() {
    return this._isDestroyed;
  }

  get geojson() {
    return this._geojson;
  }

  private _generateId() {
    return nanoid();
  }

  addBillboard(item: BillboardPrimitiveItem) {
    const { position, style } = item;
    const id = this._generateId();
    const instance = this._billboardCollection.add({
      id,
      position,
      ...style,
    });
    this.addFeatureItem({
      ...item,
      id,
      instance,
      center: { cartesian3: position },
    });
    return instance;
  }

  addLabel(item: LabelPrimitiveItem) {
    const { position, style } = item;
    const id = this._generateId();
    const instance = this._labelCollection.add({
      id,
      position,
      ...style,
    });
    return instance;
  }

  addPoint(item: PointPrimitiveItem) {
    const { position, style } = item;
    const id = this._generateId();
    const instance = this._pointCollection.add({
      id,
      position,
      ...style,
    });
    this.addFeatureItem({
      ...item,
      id,
      instance,
      center: { cartesian3: position },
    });
    return instance;
  }

  addCircle(item: CirclePrimitiveItem) {
    const { position, style } = item;
    const id = this._generateId();

    const geometry = new CircleGeometry({
      center: position,
      extrudedHeight: style?.extrudedHeight,
      radius: style?.radius ?? 1000,
    });
    const instance = new GeometryInstance({
      geometry,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(
          style?.color ?? this._options.fill,
        ),
      },
      id,
    });

    this._circleInstances.push(instance);

    this.addFeatureItem({
      ...item,
      id,
      instance: geometry,
      center: { cartesian3: item.position },
    });

    return instance;
  }

  addPolygon(item: PolygonPrimitiveItem) {
    const { positions, style } = item;
    const id = this._generateId();

    const geometry = new PolygonGeometry({
      polygonHierarchy: new PolygonHierarchy(positions),
      vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      extrudedHeight: style?.extrudedHeight,
      arcType: ArcType.RHUMB,
    });
    const instance = new GeometryInstance({
      geometry,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(
          style?.material ?? this._options.fill,
        ),
      },
      id,
    });

    this._polygonInstances.push(instance);

    this.addFeatureItem({
      ...item,
      id,
      instance: geometry,
      center: getPositionsCenter(item.positions, style?.extrudedHeight),
    });
    this.addPolyline(
      {
        type: "Polyline",
        positions,
        style: {
          width: style?.outlineWidth,
          material: style?.outlineColor,
        },
      },
      false,
    );

    return instance;
  }

  addPolyline(item: PolylinePrimitiveItem, addFeature = true) {
    const { positions, style } = item;
    const id = this._generateId();

    const geometry = new PolylineGeometry({
      positions,
      vertexFormat: PolylineColorAppearance.VERTEX_FORMAT,
      width: style?.width,
      arcType: ArcType.RHUMB,
    });
    const instance = new GeometryInstance({
      geometry,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(
          style?.material ?? this._options.stroke,
        ),
      },
      id,
    });

    this._polylineInstances.push(instance);

    if (addFeature)
      this.addFeatureItem({
        ...item,
        id,
        instance: geometry,
        center: {
          cartesian3: item.positions[Math.floor(item.positions.length / 2)],
        },
      });

    return instance;
  }

  addFeatureItem(item: PrimitiveItem) {
    this._featureItems.push(item);
    return item;
  }

  /**
   * 根据id获取FeatureItem
   * @param {string} id
   * @returns {PrimitiveItem | undefined} FeatureItem
   */
  getFeatureItemById(id: string): PrimitiveItem | undefined {
    return this._featureItems.find((item) => item.id === id);
  }

  /**
   * remove featureItem from primitive collection
   * @param {string} id featureItem id
   */
  removeFeatureItemById(id: string) {
    const feature = this._featureItems.find((item) => item.id === id);
    if (feature && feature.instance) {
      switch (feature.type) {
        case "Point":
          this._pointCollection.remove(feature.instance);
          break;
        case "Billboard":
          this._billboardCollection.remove(feature.instance);
          break;
        case "Label":
          this._labelCollection.remove(feature.instance);
          break;
        default:
          break;
      }
    }
    this._featureItems = this._featureItems.filter((item) => item.id !== id);
    return false;
  }

  /**
   * Asynchronously loads the provided GeoJSON or TopoJSON data, replacing any existing data.
   *
   * @param {Resource|String|Object} data A url, GeoJSON object to be loaded.
   * @param {Object} [options] An object with the following properties:
   * @param {String} [options.sourceUri] Overrides the url to use for resolving relative links.
   * @returns {Promise.<GeoJsonPrimitiveLayer>} a promise that will resolve when the GeoJSON is loaded.
   */
  async load(
    url: string | Resource | GeoJSON.GeoJSON,
    options: Partial<GeoJsonPrimitiveLayerOptions> = {},
  ): Promise<GeoJsonPrimitiveLayer> {
    let data = url;
    //>>includeStart('debug', pragmas.debug)
    if (!defined(data)) {
      throw new DeveloperError("data is required.");
    }
    //>>includeEnd('debug')

    this._isLoading = true;

    // User specified credit
    let credit = options.credit;
    if (typeof credit === "string") {
      credit = new Credit(credit);
    }
    this._credit = credit;

    let promise: any = data;
    let sourceUri = options.sourceUri;
    if (typeof data === "string") {
      data = new Resource({ url: data });
    }
    if (data instanceof Resource) {
      promise = data.fetchJson();
      sourceUri = sourceUri ?? data.getUrlComponent();
    }

    try {
      const geoJson = await Promise.resolve(promise);
      this._geojson = geoJson;
      return await this.preload(geoJson, options, sourceUri, true);
    } catch (error: any) {
      this._isLoading = false;
      this._error.raiseEvent(error);
      throw error;
    }
  }

  async preload(
    geoJson: GeoJSON.GeoJSON,
    layerOptions: Partial<GeoJsonPrimitiveLayerOptions>,
    sourceUri: string | undefined,
    clear: boolean,
  ) {
    const options = { ...this._options, ...layerOptions };

    let name: string | undefined;
    if (sourceUri) {
      name = getFilenameFromUri(sourceUri);
    }

    if (name && this._name !== name) {
      this._name = name;
      // @ts-ignore
      this._changed.raiseEvent(this);
    }

    const typeHandler = geoJsonObjectTypes[geoJson.type];
    if (!defined(typeHandler)) {
      throw new RuntimeError(
        `Unsupported GeoJSON object type: ${geoJson.type}`,
      );
    }

    //Check for a Coordinate Reference System.
    const crs = (geoJson as any).crs;
    let crsFunction = crs !== null ? defaultCrsFunction : null;

    if (defined(crs)) {
      if (!defined(crs.properties)) {
        throw new RuntimeError("crs.properties is undefined.");
      }

      const properties = crs.properties;
      if (crs.type === "name") {
        crsFunction = crsNames[properties.name];
        if (!defined(crsFunction)) {
          throw new RuntimeError(`Unknown crs name: ${properties.name}`);
        }
      } else if (crs.type === "link") {
        let handler = crsLinkHrefs[properties.href];
        if (!defined(handler)) {
          handler = crsLinkTypes[properties.type];
        }

        if (!defined(handler)) {
          throw new RuntimeError(
            `Unable to resolve crs link: ${JSON.stringify(properties)}`,
          );
        }

        crsFunction = handler(properties);
      } else if (crs.type === "EPSG") {
        crsFunction = crsNames[`EPSG:${properties.code}`];
        if (!defined(crsFunction)) {
          throw new RuntimeError(`Unknown crs EPSG code: ${properties.code}`);
        }
      } else {
        throw new RuntimeError(`Unknown crs type: ${crs.type}`);
      }
    }

    return Promise.resolve(crsFunction).then(async (crsFunc) => {
      if (clear) {
        this._primitiveCollection.removeAll();
      }

      // null is a valid value for the crs, but means the entire load process becomes a no-op
      // because we can't assume anything about the coordinates.
      if (crsFunc !== null) {
        typeHandler(
          this,
          geoJson,
          geoJson,
          crsFunc,
          options as GeoJsonPrimitiveLayerOptions,
        );
      }

      await Promise.all(this._promises);
      this._promises.length = 0;
      this._isLoading = false;
      this.reloadPrimitive();
      return this;
    });
  }

  removeAllPrimitive() {
    this.primitiveCollection.removeAll();
    this._billboardCollection = new BillboardCollection();
    this._labelCollection = new LabelCollection();
    this._pointCollection = new PointPrimitiveCollection({
      blendOption: BlendOption.TRANSLUCENT,
    });
    this._featureItems = [];
    this._circleInstances = [];
    this._polygonInstances = [];
    this._polylineInstances = [];
  }

  reloadPrimitive(depthTest: boolean = this._options.depthTest ?? false) {
    const appearance = depthTest
      ? new PerInstanceColorAppearance({
          translucent: false,
          renderState: {
            depthTest: {
              enabled: true,
            },
            depthMask: true,
            blending: BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,
          },
        })
      : new PerInstanceColorAppearance({
          flat: true,
          translucent: false,
          closed: true,
          renderState: {
            depthTest: false,
            depthMask: false,
            blending: BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,
          },
        });

    this._circlePrimitive = new Primitive({
      geometryInstances: this._circleInstances,
      appearance,
      asynchronous: false,
    });
    this._polygonPrimitive = new Primitive({
      geometryInstances: this._polygonInstances,
      appearance,
      asynchronous: false,
    });
    this._polylinePrimitive = new Primitive({
      geometryInstances: this._polylineInstances,
      appearance: new PolylineColorAppearance({
        translucent: false,
      }),
      asynchronous: false,
    });
    this._primitiveCollection.add(this._circlePrimitive);
    this._primitiveCollection.add(this._polygonPrimitive);
    this._primitiveCollection.add(this._polylinePrimitive);
    this._primitiveCollection.add(this._billboardCollection);
    this._primitiveCollection.add(this._labelCollection);
    this._primitiveCollection.add(this._pointCollection);
  }

  destroy() {
    this.primitiveCollection.removeAll();
    this.removeSubscribers();
    this._featureItems = [];
    this._polygonInstances = [];
    this._polylineInstances = [];
    this._isDestroyed = true;
    return true;
  }
}

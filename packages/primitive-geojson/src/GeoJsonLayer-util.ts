import {
  Cartesian3,
  defined,
  HeightReference,
  RuntimeError,
  VerticalOrigin,
} from 'cesium';

import type { GeoJSON } from 'geojson';
import type { GeoJsonPrimitiveLayer } from './GeoJsonPrimitiveLayer';
import type { GeoJsonPrimitiveLayerOptions } from './typings';

export type CrsFunction = (coors: number[]) => Cartesian3;
export function defaultCrsFunction(coordinates: number[]) {
  return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]);
}

export const crsNames: Record<string, CrsFunction> = {
  'urn:ogc:def:crs:OGC:1.3:CRS84': defaultCrsFunction,
  'EPSG:4326': defaultCrsFunction,
  'urn:ogc:def:crs:EPSG::4326': defaultCrsFunction,
};

export const crsLinkHrefs: Record<string, (properties: any) => CrsFunction> =
  {};
export const crsLinkTypes: Record<string, (properties: any) => CrsFunction> =
  {};

export function coordinatesArrayToCartesianArray(
  coordinates: number[][],
  crsFunction: CrsFunction,
) {
  const positions: Cartesian3[] = new Array(coordinates.length);
  coordinates.map((coor, i) => {
    positions[i] = crsFunction(coor);
  });
  return positions;
}

type GetKey<T extends { type: string }> = {
  [K in T['type']]: (
    geoJsonLayer: GeoJsonPrimitiveLayer,
    geoJson: any,
    geometryCollection: any,
    crsFunction: CrsFunction,
    options: GeoJsonPrimitiveLayerOptions,
  ) => void;
};

export const geoJsonObjectTypes: GetKey<GeoJSON.GeoJSON> = {
  Feature: processFeature,
  FeatureCollection: processFeatureCollection,
  GeometryCollection: processGeometryCollection,
  LineString: processLineString,
  MultiLineString: processMultiLineString,
  MultiPoint: processMultiPoint,
  MultiPolygon: processMultiPolygon,
  Point: processPoint,
  Polygon: processPolygon,
};

export const geometryTypes: GetKey<GeoJSON.Geometry> = {
  GeometryCollection: processGeometryCollection,
  LineString: processLineString,
  MultiLineString: processMultiLineString,
  MultiPoint: processMultiPoint,
  MultiPolygon: processMultiPolygon,
  Point: processPoint,
  Polygon: processPolygon,
};

// GeoJSON processing functions
export function processFeature(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  feature: GeoJSON.Feature,
  notUsed: GeoJSON.Feature | undefined,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  if (feature.geometry === null) {
    return;
  }

  if (!defined(feature.geometry)) {
    throw new RuntimeError('feature.geometry is required.');
  }

  const geometryType = feature.geometry.type;
  const geometryHandler = geometryTypes[geometryType];
  if (!defined(geometryHandler)) {
    throw new RuntimeError(`Unknown geometry type: ${geometryType}`);
  }
  geometryHandler(
    geoJsonLayer,
    feature,
    feature.geometry,
    crsFunction,
    options,
  );
}

export function processFeatureCollection(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  featureCollection: GeoJSON.FeatureCollection,
  notUsed: GeoJSON.FeatureCollection,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  const features = featureCollection.features;
  features.map((feature) => {
    processFeature(geoJsonLayer, feature, undefined, crsFunction, options);
  });
}

export function processGeometryCollection(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON,
  geometryCollection: GeoJSON.GeometryCollection,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  const geometries = geometryCollection.geometries;
  geometries.map((geometry) => {
    const geometryType = geometry.type;
    const geometryHandler = geometryTypes[geometryType];
    if (!defined(geometryHandler)) {
      throw new RuntimeError(`Unknown geometry type: ${geometryType}`);
    }
    geometryHandler(geoJsonLayer, geoJson, geometry, crsFunction, options);
  });
}

export function createPoint(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: number[],
  options: GeoJsonPrimitiveLayerOptions,
) {
  const symbol = options.markerSymbol;
  const color = options.markerColor;
  const size = options.markerSize;
  const isCustom = options.customMarker;

  const properties = geoJson.properties ?? {};

  if (!symbol) {
    geoJsonLayer.addPoint({
      type: 'Point',
      position: crsFunction(coordinates),
      style: {
        color: color,
        pixelSize: size,
        outlineColor: options.stroke,
        outlineWidth: options.strokeWidth,
      },
      properties,
    });
  } else {
    /** add billboard */
    let canvasOrPromise: HTMLCanvasElement | Promise<HTMLCanvasElement>;
    if (symbol !== '' && defined(symbol)) {
      // 自定义图片
      if (isCustom) {
        canvasOrPromise = processImage(symbol, size, properties);
      } else {
        if (symbol.length === 1) {
          canvasOrPromise = geoJsonLayer.pinBuilder.fromText(
            symbol.toUpperCase(),
            color,
            size,
          );
        } else {
          canvasOrPromise = geoJsonLayer.pinBuilder.fromMakiIconId(
            symbol,
            color,
            size,
          );
        }
      }
    } else {
      canvasOrPromise = geoJsonLayer.pinBuilder.fromColor(color, size);
    }

    const billboard = geoJsonLayer.addBillboard({
      type: 'Billboard',
      position: crsFunction(coordinates),
      style: {
        verticalOrigin: VerticalOrigin.BOTTOM,
        heightReference:
          coordinates.length === 2 && options.clampToGround
            ? HeightReference.CLAMP_TO_GROUND
            : undefined,
      },
      properties,
    });

    const promise = Promise.resolve(canvasOrPromise)
      .then(function (image) {
        image instanceof Promise
          ? image.then((i) => {
              billboard.image = i;
            })
          : (billboard.image = image as unknown as string);
        // @ts-ignore
        billboard.image = image;
      })
      .catch(function () {
        // @ts-ignore
        billboard.image = geoJsonLayer.pinBuilder.fromColor(color, size);
      });

    geoJsonLayer._promises.push(promise);
  }
}

function processImage(
  url: string | ((arg0: any) => string),
  size: number | number[],
  properties: any,
) {
  let height = 24;
  let width = 24;
  if (Array.isArray(size)) {
    height = size[0];
    width = size[1];
  } else {
    height = size;
    width = size;
  }
  return new Promise<HTMLCanvasElement>((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.src = url instanceof Function ? url(properties) : url;
  });
}

export function processPoint(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.Point,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  createPoint(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options,
  );
}

export function processMultiPoint(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiPoint,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  geometry.coordinates.map((coor) =>
    createPoint(geoJsonLayer, geoJson, crsFunction, coor, options),
  );
}

export function createLineString(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: number[][],
  options: GeoJsonPrimitiveLayerOptions,
) {
  const properties = geoJson.properties ?? {};
  const positions = coordinatesArrayToCartesianArray(coordinates, crsFunction);
  geoJsonLayer.addPolyline({
    type: 'Polyline',
    positions,
    properties,
    style: {
      material: options.fill,
      width: options.strokeWidth,
    },
  });
}

export function processLineString(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.LineString,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  createLineString(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options,
  );
}

export function processMultiLineString(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiLineString,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  const lineStrings = geometry.coordinates;
  lineStrings.map((lineString) => {
    createLineString(geoJsonLayer, geoJson, crsFunction, lineString, options);
  });
}

export function createPolygon(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  crsFunction: CrsFunction,
  coordinates: GeoJSON.Position[][],
  options: GeoJsonPrimitiveLayerOptions,
) {
  if (coordinates.length === 0 || coordinates[0].length === 0) {
    return;
  }
  const properties = geoJson.properties ?? {};

  const cartesian3Coords = coordinates.map((it) =>
    coordinatesArrayToCartesianArray(it, crsFunction),
  );
  geoJsonLayer.addPolygon({
    type: 'Polygon',
    positions: cartesian3Coords[0],
    holes: cartesian3Coords.slice(1),
    style: {
      material: options.fill,
      outlineColor: options.stroke,
      outlineWidth: options.strokeWidth,
    },
    properties,
  });
}

export function processPolygon(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.Polygon,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  createPolygon(
    geoJsonLayer,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options,
  );
}

export function processMultiPolygon(
  geoJsonLayer: GeoJsonPrimitiveLayer,
  geoJson: GeoJSON.Feature,
  geometry: GeoJSON.MultiPolygon,
  crsFunction: CrsFunction,
  options: GeoJsonPrimitiveLayerOptions,
) {
  const polygons = geometry.coordinates;
  polygons.map((polygon) => {
    createPolygon(geoJsonLayer, geoJson, crsFunction, polygon, options);
  });
}

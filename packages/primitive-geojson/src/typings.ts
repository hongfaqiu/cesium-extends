import type {
  Billboard,
  BillboardGraphics,
  Cartesian3,
  CircleGeometry,
  Color,
  Credit,
  HeightReference,
  Label,
  LabelGraphics,
  PointPrimitive,
  PolygonGeometry,
  PolylineGeometry,
} from 'cesium';

export type GeoJSONType = 'point' | 'line' | 'polygon' | 'mix';

// Primitive相关
export type GeoJsonPrimitiveLayerOptions = {
  sourceUri?: string;
  markerSize: number;
  markerSymbol?: string;
  markerColor: Color;
  stroke: Color;
  strokeWidth: number;
  fill: Color;
  clampToGround: boolean;
  credit?: Credit | string;
};

export type PrimitiveItem =
  | PointPrimitiveItem
  | BillboardPrimitiveItem
  | PolygonPrimitiveItem
  | PolylinePrimitiveItem
  | LabelPrimitiveItem
  | CirclePrimitiveItem;

export type GeoJsonFeatureItem = {
  id?: string;
  properties?: Record<string, any>;
  center?: {
    cartesian3: Cartesian3;
    height?: number;
  };
};

export type PointPrimitiveItem = {
  type: 'Point';
  position: Cartesian3;
  style?: {
    pixelSize?: number;
    heightReference?: HeightReference;
    color?: Color;
    outlineColor?: Color;
    outlineWidth?: number;
  };
  instance?: PointPrimitive;
} & GeoJsonFeatureItem;

export type CirclePrimitiveItem = {
  type: 'Circle';
  position: Cartesian3;
  style?: {
    color?: Color;
    extrudedHeight?: number;
    radius?: number;
  };
  instance?: CircleGeometry;
} & GeoJsonFeatureItem;

export type BillboardPrimitiveItem = {
  type: 'Billboard';
  position: Cartesian3;
  style?: BillboardGraphics.ConstructorOptions;
  instance?: Billboard;
} & GeoJsonFeatureItem;

export type LabelPrimitiveItem = {
  type: 'Label';
  position?: Cartesian3;
  style?: LabelGraphics.ConstructorOptions;
  instance?: Label;
} & GeoJsonFeatureItem;

export type PolygonPrimitiveItem = {
  type: 'Polygon';
  positions: Cartesian3[];
  style?: {
    material?: Color;
    /**The distance in meters between the polygon and the ellipsoid surface. */
    height?: number;
    /**The distance in meters between the polygon's extruded face and the ellipsoid surface. */
    extrudedHeight?: number;
    outlineColor?: Color;
    outlineWidth?: number;
  };
  instance?: PolygonGeometry;
} & GeoJsonFeatureItem;

export type PolylinePrimitiveItem = {
  type: 'Polyline';
  positions: Cartesian3[];
  style?: {
    material?: Color;
    width?: number;
  };
  instance?: PolylineGeometry;
} & GeoJsonFeatureItem;

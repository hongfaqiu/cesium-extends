import { GeoJsonPrimitiveLayerOptions } from "@cesium-extends/primitive-geojson";
import { Property, PointGraphics, CylinderGraphics, PolylineGraphics, PolygonGraphics, BillboardGraphics, LabelGraphics } from "cesium";
import { ClusterOptions } from "./typing";

// Entity相关
export type ExcludeType<T> = Exclude<T, Property | undefined>;
export type HanelConstructor<T> = {
  [K in keyof T]?: ExcludeType<T[K]>;
};

export type PointEntityConstructor = HanelConstructor<PointGraphics.ConstructorOptions>;
export type CylinderEntityConstructor = HanelConstructor<CylinderGraphics.ConstructorOptions>;
export type PolylineEntityConstructor = HanelConstructor<PolylineGraphics.ConstructorOptions>;
export type PolygonEntityConstructor = HanelConstructor<PolygonGraphics.ConstructorOptions>;
export type BillboardEntityConstructor = HanelConstructor<BillboardGraphics.ConstructorOptions>;
export type LabelEntityConstructor = HanelConstructor<LabelGraphics.ConstructorOptions>;

export type BillboardStyle = BillboardEntityConstructor;

export type CustomPaintItem<T = any> = {
  field?: string;
  /**
   * 优先自定义配置
   */
  custom?: {
    label: string | number | [number, number];
    value: ExcludeType<T> | undefined;
  }[];
  normalization?: {
    valueRange: [number, number];
    normalRange: [number, number];
  };
  default?: ExcludeType<T>;
};

/**
 * 根据字段值对单个entity进行渲染
 */
export type customPaint<T> = {
  [K in keyof T]?: CustomPaintItem<T[K]>;
};

export type PointEntityStyle = {
  type: 'point';
  custom?: customPaint<
    PointEntityConstructor & BillboardEntityConstructor & CylinderEntityConstructor
  >;
  paint?: PointEntityConstructor;
  layout?: BillboardEntityConstructor;
  cylinder?: CylinderEntityConstructor;
  cluster?: ClusterOptions;
};

export type PolylineEntityStyle = {
  type: 'line';
  custom?: customPaint<PolylineEntityConstructor>;
  paint: PolylineEntityConstructor;
};

export type PolygonEntityStyle = {
  type: 'polygon';
  custom?: customPaint<PolygonEntityConstructor>;
  paint: PolygonEntityConstructor;
};

export type MixEntityStyle = {
  type: 'mix';
  custom?: customPaint<Partial<GeoJsonPrimitiveLayerOptions>>;
  paint: Partial<GeoJsonPrimitiveLayerOptions>
}

export type LabelEntityStyle = {
  type: 'label';
  paint: LabelEntityConstructor;
};

export type EntityStyle = {
  label?: LabelEntityStyle;
} & (PointEntityStyle | PolylineEntityStyle | PolygonEntityStyle | MixEntityStyle);

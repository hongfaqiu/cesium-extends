export interface RGBColor {
  a?: number | undefined;
  b: number;
  g: number;
  r: number;
}

export type GeoJsonCommonStyle = {
  /** 标签 */
  symbol?: SymbolStyle;
  /** 精灵图 **/
  sprite?: {
    url: string;
    params?: Record<string, any>;
  };
};

export type GeoJsonColor = RGBColor | string;

/**
 * geojson渲染方案
 */
export type GeoJsonStyle = GeoJsonCommonStyle &
  (
    | GeoJsonPointStyle
    | GeoJsonLineStyle
    | GeoJsonPolygonStyle
    | GeoJsonMixStyle
  );

/**
 * 标签渲染条件
 */
export type SymbolStyle = {
  "text-field"?: string;
  "text-font"?: string;
  "text-size"?: number;
  "text-color"?: GeoJsonColor;
  "text-halo-color"?: GeoJsonColor;
  "text-halo-width"?: number;
  "text-offsetX"?: number;
  "text-offsetY"?: number;
};

/**
 * 分段和单值渲染的用户自定义样式
 */
export type CustomStyle = {
  /**
   * 自定义区间/值
   */
  label: string | number | [number, number];
  /**
   * css颜色
   */
  value: string;
  /** 图标 */
  image?: string;
}[];

/**
 * 点渲染方案, 共计五种
 */
export type GeoJsonPointStyle =
  | ((
      | PointSingleStyle
      | PointSectionStyle
      | PointValueStyle
      | PointBubbleStyle
    ) & {
      cluster?: ClusterOptions;
    })
  | PointHeightStyle;

/**
 * 点通用渲染条件
 */
export type PointCommonOptions = {
  custom?: CustomStyle;
  "circle-stroke-color"?: GeoJsonColor | undefined;
  "circle-stroke-width"?: number | undefined;
  opacity?: number;
};

/**
 * 点聚类渲染条件
 */
export type ClusterOptions = {
  enable?: boolean;
  pixelRange?: number;
  minimumClusterSize?: number;
  alpha?: number;
  scale?: number;
  maxNum?: number;
  colorBar?: string[];
};

export type PointSingleStyle = {
  type: "single";
  config: {
    "label-type"?: "vector" | "icon";
    color?: GeoJsonColor;
    "icon-image"?: string;
    "label-size"?: number;
  } & PointCommonOptions;
};

export type PointSectionStyle = {
  type: "section";
  config: {
    field?: string;
    "section-type"?: "natural" | "average";
    color?: string[];
    "label-size"?: number;
  } & PointCommonOptions;
};

export type PointValueStyle = {
  type: "value";
  config: {
    field?: string;
    color?: string[];
    "label-size"?: number;
  } & PointCommonOptions;
};

export type PointBubbleStyle = {
  type: "bubble";
  config: {
    field?: string;
    "section-type": "natural" | "average" | "auto";
    "section-num"?: number;
    "label-size": number[];
    "fill-type": "single" | "multi";
    color?: GeoJsonColor;
    /** unvalid when section-type is auto  */
    colors?: string[];
  } & PointCommonOptions;
};

export type PointHeightStyle = {
  type: "height";
  config: {
    field?: string;
    "section-type"?: "natural" | "average";
    color?: string[];
    "radius-size"?: number;
    "height-range": [number, number];
  } & PointCommonOptions;
};

/**
 * 线渲染方案, 共计三种
 */
export type GeoJsonLineStyle =
  | LineSingleStyle
  | LineSectionStyle
  | LineValueStyle;

/**
 * 线通用渲染条件
 */
export type LineCommonOptions = {
  custom?: CustomStyle;
  "line-width"?: number;
  opacity?: number;
};

export type LineSingleStyle = {
  type: "single";
  config: {
    color?: GeoJsonColor;
  } & LineCommonOptions;
};

export type LineSectionStyle = {
  type: "section";
  config: {
    field?: string;
    "section-type"?: "natural" | "average";
    color?: string[];
  } & LineCommonOptions;
};

export type LineValueStyle = {
  type: "value";
  config: {
    field?: string;
    color?: string[];
  } & LineCommonOptions;
};

/**
 * 面渲染方案, 共计三种
 */
export type GeoJsonPolygonStyle =
  | PolygonSingleStyle
  | PolygonSectionStyle
  | PolygonValueStyle
  | PolygonHeightStyle;

/**
 * 面通用渲染条件
 */
export type PolygonCommonOptions = {
  custom?: CustomStyle;
  opacity?: number;
  "outline-color"?: GeoJsonColor;
  "outline-width"?: number;
};

export type PolygonSingleStyle = {
  type: "single";
  config: {
    color?: GeoJsonColor;
  } & PolygonCommonOptions;
};

export type PolygonSectionStyle = {
  type: "section";
  config: {
    field?: string;
    "section-type"?: "natural" | "average";
    color?: string[];
  } & PolygonCommonOptions;
};

export type PolygonValueStyle = {
  type: "value";
  config: {
    field?: string;
    color?: string[];
  } & PolygonCommonOptions;
};

export type PolygonHeightStyle = {
  type: "height";
  config: {
    field?: string;
    "section-type"?: "natural" | "average";
    color?: string[];
    "height-range": [number, number];
  } & PolygonCommonOptions;
};

/** 混合类型的geojson渲染条件 */
export type GeoJsonMixStyle = {
  type: "single";
  // 精灵图
  sprite?: {
    url: string;
    params?: Record<string, any>;
  };
  config: {
    "label-type": "vector" | "icon";
    markerSize?: number;
    markerSymbol?: string;
    markerColor?: GeoJsonColor;
    stroke?: GeoJsonColor;
    strokeWidth?: number;
    fill?: GeoJsonColor;
  };
};

export type GeoJsonRenderConfig =
  | {
      type: "point";
      style?: GeoJsonCommonStyle & GeoJsonPointStyle;
    }
  | {
      type: "line";
      style?: GeoJsonCommonStyle & GeoJsonLineStyle;
    }
  | {
      type: "polygon";
      style?: GeoJsonCommonStyle & GeoJsonPolygonStyle;
    }
  | {
      type: "mix";
      style?: GeoJsonCommonStyle & GeoJsonMixStyle;
    };

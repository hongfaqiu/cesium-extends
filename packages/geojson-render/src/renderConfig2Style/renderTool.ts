import { Color, JulianDate } from "cesium";

import geojsonStatisticQuery from "../geojsonStatisticQuery";
import { DefaultColor } from "../renderConfig";
import { NoDataColor } from "../renderConfig/ConstantEnum";

import type { SpriteConfig } from "./pbf";
import type { Entity } from "cesium";
import type { CustomPaintItem } from "../renderConfig/entityStyle";
import type { RGBColor } from "../renderConfig/typing";

export type CustomColorItem = {
  label: string | number | [number, number];
  value: string;
};

export type CustomNumberItem = {
  label: string | number | [number, number];
  value: number;
};

const DefaultItem = {
  label: "default",
  value: DefaultColor,
};

const DefaultItem2 = {
  label: "default",
  value: NoDataColor,
};

/**
 * 将颜色转换为Cesium color
 */
export const single2paintColor = (
  color?: RGBColor | string,
  opacity: number = 1,
) => {
  if (!color) return Color.fromCssColorString(DefaultColor).withAlpha(opacity);
  if (typeof color === "string")
    return Color.fromCssColorString(color).withAlpha(opacity);
  return Color.fromCssColorString(
    `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
  );
};

export const transCustomColorItem = (
  items: CustomColorItem[],
  opacity: number = 1,
) => {
  return items.map((item) => ({
    label: item.label,
    value: single2paintColor(item.value, opacity),
  }));
};

/**
 * 分段颜色
 */
export const section2CustomColor = async (
  data: Record<string, any>[],
  config: {
    field?: string;
    color?: string[];
    "section-type"?: "natural" | "average" | "auto";
  },
) => {
  const { field, color: colors } = config;
  const sectionType = config["section-type"];
  const result: CustomColorItem[] = [];
  const colorNum = colors?.length;
  if (!data || !colorNum || !field) return [DefaultItem];

  if (sectionType) {
    const res = await geojsonStatisticQuery(data, {
      hasMinMax: sectionType === "average",
      columnName: field,
      segNum: sectionType === "natural" ? colorNum : 0,
    });
    if (!res) return [DefaultItem];

    if (sectionType === "average") {
      const min = res.min;
      const max = res.max;
      if (typeof min !== "number" || typeof max !== "number")
        return [DefaultItem];
      const step = (max - min) / colorNum;
      for (let i = 0; i < colorNum; i += 1) {
        result.push({
          label: [min + step * i, min + step * (i + 1)],
          value: colors[i],
        });
      }
    }
    if (sectionType === "natural") {
      for (let i = 0; i < colorNum; i += 1) {
        const section0 = res.sections[i];
        const section1 = res.sections[i + 1];
        if (typeof section0 !== "number" || typeof section1 !== "number")
          return [DefaultItem];
        result.push({
          label: [section0, section1],
          value: colors[i],
        });
      }
    }
  }
  result.push(DefaultItem2);
  return result;
};

/**
 * 分段大小
 */
export const section2CustomSize = async (
  data: Record<string, any>[],
  config: {
    field?: string;
    num?: number;
    sizeRange?: number[];
    "section-type"?: "natural" | "average" | "auto";
  },
) => {
  const { field, num, sizeRange } = config;
  const sectionType = config["section-type"];
  const result: CustomNumberItem[] = [];

  const DefaultSectionItem = {
    label: "default",
    value: sizeRange?.[0] ?? 1,
  };

  if (!data || !num || !field || !sizeRange) return [DefaultSectionItem];

  if (sectionType) {
    const res = await geojsonStatisticQuery(data, {
      hasMinMax: sectionType === "average",
      columnName: field,
      segNum: sectionType === "natural" ? num : 0,
    });
    if (!res) return [DefaultSectionItem];

    const min = res.min;
    const max = res.max;

    const sizeStep = (sizeRange[1] - sizeRange[0]) / (num - 1);

    if (sectionType === "average") {
      if (typeof min !== "number" || typeof max !== "number")
        return [DefaultSectionItem];
      const step = (max - min) / num;
      for (let i = 0; i < num; i += 1) {
        result.push({
          label: [min + step * i, min + step * (i + 1)],
          value: sizeRange[0] + sizeStep * i,
        });
      }
    }
    if (sectionType === "natural") {
      for (let i = 0; i < num; i += 1) {
        const section0 = res.sections[i];
        const section1 = res.sections[i + 1];
        if (typeof section0 !== "number" || typeof section1 !== "number")
          return [DefaultSectionItem];
        result.push({
          label: [section0, section1],
          value: sizeRange[0] + sizeStep * i,
        });
      }
    }
    if (sectionType === "auto") {
      result.push(
        {
          label: min,
          value: sizeRange[0],
        },
        {
          label: max,
          value: sizeRange[1],
        },
      );
    }
  }
  result.push(DefaultSectionItem);
  return result;
};

/**
 * 单值自定义
 */
export const value2Custom = async (
  data: Record<string, any>[],
  config: {
    field?: string;
    color?: string[];
  },
) => {
  const { field, color: colors } = config;
  const result: CustomColorItem[] = [];

  const length = colors?.length ?? 0;
  if (field && colors && length > 0) {
    const res = await geojsonStatisticQuery(data, {
      hasMinMax: false,
      columnName: field,
      maxLen: 1000,
    });
    if (!res) return [DefaultItem];
    const { values = [] } = res;
    for (let i = 0; i < values.length; i += 1) {
      result.push({
        label: values[i],
        value: colors[i % length],
      });
    }
    result.push(DefaultItem2);
    return result;
  }
  return [DefaultItem];
};

/**
 * 值映射
 */
export function custom2value(value: any, customConfig: CustomPaintItem) {
  const { custom, normalization, default: defaultValue } = customConfig;

  if (!value) return defaultValue;

  // 优先处理
  if (normalization) {
    const { valueRange, normalRange } = normalization;

    const valueRangeSize = valueRange[1] - valueRange[0];
    const normalRangeSize = normalRange[1] - normalRange[0];
    const newValue =
      ((value - valueRange[0]) / valueRangeSize) * normalRangeSize +
      normalRange[0];
    return typeof newValue !== "number" ? defaultValue : newValue;
  }

  if (custom) {
    for (const item of custom) {
      const { label, value: val } = item;
      if (label instanceof Array && label[0] <= value && label[1] >= value) {
        return val;
      }
      if (label === value) return val;
    }
  }

  return defaultValue;
}

/**
 * 获取entity属性值
 */
export function getEntityValue(entity: Entity, field?: string) {
  if (!field) return undefined;
  const property = entity.properties?.getValue(JulianDate.now());
  return property[field] ? String(property[field]) : "";
}

export function loadImage(url: string, params?: Record<string, any>) {
  let png = url;
  if (params) {
    const entries = Object.entries(params);
    png = url + "?";
    for (let i = 0; i < entries.length; i += 1) {
      if (i > 0) png += "&";
      png += entries[i][0] + "=" + entries[i][1];
    }
  }
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = png;
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      resolve(img);
    };
  });
}

export const image2canvas = (
  image: CanvasImageSource,
  config?: SpriteConfig,
) => {
  if (!config || !image) return undefined;

  const newCanvas = document.createElement("canvas");
  newCanvas.height = config.height;
  newCanvas.width = config.width;
  const context = newCanvas.getContext("2d");
  context?.drawImage(
    image,
    config.x,
    config.y,
    config.width,
    config.height,
    0,
    0,
    config.width,
    config.height,
  );
  return newCanvas;
};

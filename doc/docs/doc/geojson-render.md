---
title: geojson-render
nav: 指南
group: 扩展
order: 3
---

# @cesium-extends/geojson-render

这个 npm 库提供了两个方法用于渲染 GeoJSON 数据，分别是 `renderGeoJson` 和 `renderPrimitiveGeoJson`。

## 安装

使用 npm 安装此库：

```
npm install @cesium-extends/geojson-render
```

## 用法

### renderGeoJson(dataSource, config)

将 GeoJSON 数据渲染为 Cesium 实体，并添加到指定的数据源。

参数：

- `dataSource`：Cesium 数据源对象。
- `config`：对象，包含以下属性：
  - `type`：字符串，表示 GeoJSON 数据的类型。目前支持 `Point`、`LineString`、`Polygon`、`MultiPoint`、`MultiLineString` 和 `MultiPolygon` 六种类型。
  - `style`：对象，包含表示样式的属性值。有关可用样式，请参见 [GeoJsonStyle 配置说明](#geojsonstyle配置说明)。

返回值：

- 如果参数不完整，则返回 `undefined`。
- 如果渲染成功，则返回渲染后的实体样式对象。

示例代码：

```typescript
import { renderGeoJson } from '@cesium-extends/geojson-render';
import { GeoJsonDataSource } from 'cesium';

const geoJsonData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [114.123, 22.321],
      },
    },
  ],
};

const dataSource: DataSource = await GeoJsonDataSource.load(geoJsonData);

const config = {
  type: 'Point',
  style: {
    type: 'single',
    config: {
      'circle-stroke-color': 'red',
      'label-size': 10,
    },
  },
};

renderGeoJson(dataSource, config).then((entityStyle) => {
  console.log(entityStyle);
});
```

### renderPrimitiveGeoJson(primitiveLayer, config)

将 GeoJSON 数据渲染为 Cesium 原始几何体，并添加到指定的图元图层。

参数：

- `primitiveLayer`：GeoJsonPrimitiveLayer 对象。
- `config`：对象，包含以下属性：
  - `type`：字符串，表示 GeoJSON 数据的类型。目前支持 `Point`、`LineString`、`Polygon`、`MultiPoint`、`MultiLineString` 和 `MultiPolygon` 六种类型。
  - `style`：对象，包含表示样式的属性值。有关可用样式，请参见 [GeoJsonStyle 配置说明](#geojsonstyle配置说明)。

返回值：

- 如果参数不完整，则返回 `undefined`。
- 如果渲染成功，则返回渲染后的实体样式对象。

示例代码：

```typescript
import { renderPrimitiveGeoJson } from '@cesium-extends/geojson-render';
import { GeoJsonPrimitiveLayer } from '@cesium-extends/primitive-geojson';

const viewer = new Cesium.Viewer('cesiumContainer');

const geoJsonData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [114.123, 22.321],
      },
    },
  ],
};

const primitiveObj = new GeoJsonPrimitiveLayer();
const primitiveLayer = await primitiveObj.load(geoJsonData);

const config = {
  type: 'Point',
  style: {
    type: 'single',
    config: {
      'circle-stroke-color': 'red',
      'label-size': 10,
    },
  },
};

renderPrimitiveGeoJson(primitiveLayer, config).then((entityStyle) => {
  console.log(entityStyle);
});
```

## 示例

### 点 bubble

下面的示例中添加了一个地震数据的 geojson，并按照地震层级对点进行不同大小的渲染

<code src="@/components/Map/geojson-render/bubble-auto.tsx"></code>

### 面 height

下面的示例中添加了一个大约有 4w 个面的美国加利福尼亚州地热数据的 geojson，并按照 est 字段对每个方格进行高度和颜色渲染

<code src="@/components/Map/geojson-render/polygon-height.tsx"></code>

## GeoJsonStyle 配置说明

`GeoJsonStyle` 用于控制 `geojson` 数据在地图上的渲染样式，包括点、线、面等多种类型。以下表格将描述每一个属性及其用途。

### GeoJsonColor

`GeoJsonColor` 为颜色类型，可以是 `RGBColor` 对象或者 CSS 颜色字符串。

### RGBColor

RGB 颜色对象，包含红、绿、蓝三个通道的值。

| 属性 | 类型              | 说明                   |
| ---- | ----------------- | ---------------------- |
| r    | number            | 红色通道值，范围 0-255 |
| g    | number            | 绿色通道值，范围 0-255 |
| b    | number            | 蓝色通道值，范围 0-255 |
| a    | number\|undefined | 透明度，范围 0-1       |

### CustomStyle

`CustomStyle` 为用户自定义样式，包含自定义区间/值以及颜色等参数。

| 属性   | 类型                             | 说明          |
| ------ | -------------------------------- | ------------- |
| label  | string\|number\|[number, number] | 自定义区间/值 |
| value  | string                           | css 颜色      |
| image? | string                           | 图标          |

### GeoJsonStyle

`GeoJsonStyle`可以用于控制不同数据类型 `geojson` 数据在地图上的渲染样式。除 [GeoJsonCommonStyle](#geojsoncommonstyle) 为通用渲染属性外，包括以下五种渲染方案：

- [SymbolStyle](#symbolstyle) 标签渲染条件
- [GeoJsonPointStyle](#geojsonpointstyle) 点渲染方案
- [GeoJsonLineStyle](#geojsonlinestyle) 线渲染方案
- [GeoJsonPolygonStyle](#geojsonpolygonstyle) 面渲染方案
- [GeoJsonMixStyle](#geojsonmixstyle) 混合类型的渲染方案

### GeoJsonCommonStyle

`GeoJsonCommonStyle` 为 `GeoJsonStyle` 的基础属性，包括标签和精灵图两部分。

| 属性    | 类型        | 说明         |
| ------- | ----------- | ------------ |
| symbol? | SymbolStyle | 标签渲染条件 |
| sprite? | object      | 精灵图参数   |

其中 `sprite` 参数具体如下：

| 属性    | 类型   | 说明            |
| ------- | ------ | --------------- |
| url     | string | 精灵图 URL 地址 |
| params? | object | 精灵图参数对象  |

### SymbolStyle

`SymbolStyle` 为标签渲染条件，可以控制标签的文本、字体、大小、颜色等。

| 属性             | 类型                          | 说明         |
| ---------------- | ----------------------------- | ------------ |
| text-field?      | string                        | 标签文本     |
| text-font?       | string                        | 标签字体     |
| text-size?       | number                        | 标签大小     |
| text-color?      | [GeoJsonColor](#geojsoncolor) | 标签颜色     |
| text-halo-color? | [GeoJsonColor](#geojsoncolor) | 标签描边颜色 |
| text-halo-width? | number                        | 标签描边宽度 |
| text-offsetX?    | number                        | 标签横向偏移 |
| text-offsetY?    | number                        | 标签纵向偏移 |

### GeoJsonPointStyle

`GeoJsonPointStyle` 为点的渲染配置，包含多种类型。

```typescript
type GeoJsonPointStyle =
  | ((
      | PointSingleStyle
      | PointSectionStyle
      | PointValueStyle
      | PointBubbleStyle
    ) & {
      cluster?: ClusterOptions;
    })
  | PointHeightStyle;
```

#### ClusterOptions

`ClusterOptions` 为点的聚类渲染条件，可以控制点聚合的显示、像素范围、最小聚合数量等参数。

| 属性                | 类型     | 说明               |
| ------------------- | -------- | ------------------ |
| enable?             | boolean  | 是否启用点聚合     |
| pixelRange?         | number   | 聚合范围，单位像素 |
| minimumClusterSize? | number   | 最小聚合数量       |
| alpha?              | number   | 透明度             |
| scale?              | number   | 聚合图标缩放比例   |
| maxNum?             | number   | 单个聚合中最大点数 |
| colorBar?           | string[] | 渐变色             |

#### PointCommonOptions

`PointCommonOptions` 为点的通用渲染条件，可以控制点的轮廓颜色、轮廓宽度、透明度等参数。

| 属性                 | 类型                          | 说明           |
| -------------------- | ----------------------------- | -------------- |
| custom?              | [CustomStyle](#customstyle)   | 用户自定义样式 |
| circle-stroke-color? | [GeoJsonColor](#geojsoncolor) | 点轮廓颜色     |
| circle-stroke-width? | number                        | 点轮廓宽度     |
| opacity?             | number                        | 点透明度       |

#### PointSingleStyle

`PointSingleStyle` 为单一点的渲染配置，可以控制点的颜色、字体、大小等参数。

| 属性                                | 类型                                      | 说明                            |
| ----------------------------------- | ----------------------------------------- | ------------------------------- |
| type                                | string                                    | 固定为 'single'                 |
| config                              | object                                    | 配置对象，包含以下属性：        |
| &nbsp;&nbsp;&nbsp;&nbsp;color?      | [GeoJsonColor](#geojsoncolor)             | 点颜色                          |
| &nbsp;&nbsp;&nbsp;&nbsp;label-type? | string                                    | 标签类型，可选 'vector', 'icon' |
| &nbsp;&nbsp;&nbsp;&nbsp;icon-image? | string                                    | icon 图片地址                   |
| &nbsp;&nbsp;&nbsp;&nbsp;label-size? | number                                    | 标签大小                        |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest     | [PointCommonOptions](#pointcommonoptions) | 点的通用渲染条件                |

#### PointSectionStyle

`PointSectionStyle` 为分段点的渲染配置，可以根据字段值进行分段渲染，控制点的颜色、字体、大小等参数。

| 属性                                  | 类型                                      | 说明                                |
| ------------------------------------- | ----------------------------------------- | ----------------------------------- |
| type                                  | string                                    | 固定为 'section'                    |
| config                                | object                                    | 配置对象，包含以下属性：            |
| &nbsp;&nbsp;&nbsp;&nbsp;field?        | string                                    | 字段名称                            |
| &nbsp;&nbsp;&nbsp;&nbsp;section-type? | string                                    | 分段类型，可选 'natural', 'average' |
| &nbsp;&nbsp;&nbsp;&nbsp;color?        | string[]                                  | 点颜色数组                          |
| &nbsp;&nbsp;&nbsp;&nbsp;label-size?   | number                                    | 标签大小                            |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest       | [PointCommonOptions](#pointcommonoptions) | 点的通用渲染条件                    |

#### PointValueStyle

`PointValueStyle` 为单值点的渲染配置，可以根据字段值进行单值渲染，控制点的颜色、字体、大小等参数。

| 属性                                | 类型                                      | 说明                     |
| ----------------------------------- | ----------------------------------------- | ------------------------ |
| type                                | string                                    | 固定为 'value'           |
| config                              | object                                    | 配置对象，包含以下属性： |
| &nbsp;&nbsp;&nbsp;&nbsp;field?      | string                                    | 字段名称                 |
| &nbsp;&nbsp;&nbsp;&nbsp;color?      | string[]                                  | 点颜色数组               |
| &nbsp;&nbsp;&nbsp;&nbsp;label-size? | number                                    | 标签大小                 |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest     | [PointCommonOptions](#pointcommonoptions) | 点的通用渲染条件         |

#### PointBubbleStyle

`PointBubbleStyle` 为气泡点的渲染配置，可以控制点的颜色、字体、大小等参数，并且可以将值分为多个自定义区间。

| 属性                                 | 类型                                      | 说明                                        |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------- |
| type                                 | string                                    | 固定为 'bubble'                             |
| config                               | object                                    | 配置对象，包含以下属性：                    |
| &nbsp;&nbsp;&nbsp;&nbsp;field?       | string                                    | 字段名称                                    |
| &nbsp;&nbsp;&nbsp;&nbsp;section-type | string                                    | 分段类型，可选 'natural', 'average', 'auto' |
| &nbsp;&nbsp;&nbsp;&nbsp;section-num? | number                                    | 区间数量                                    |
| &nbsp;&nbsp;&nbsp;&nbsp;label-size   | number[]                                  | 标签大小数组                                |
| &nbsp;&nbsp;&nbsp;&nbsp;fill-type    | string                                    | 填充类型，可选 'single', 'multi'            |
| &nbsp;&nbsp;&nbsp;&nbsp;color?       | [GeoJsonColor](#geojsoncolor)             | 点颜色                                      |
| &nbsp;&nbsp;&nbsp;&nbsp;colors?      | string[]                                  | 颜色数组，在 section-type 为'auto'时无效    |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest      | [PointCommonOptions](#pointcommonoptions) | 点的通用渲染条件                            |

#### PointHeightStyle

`PointHeightStyle` 为高度点的渲染配置，可以根据字段值进行高度渲染，控制点的颜色、字体、大小等参数。

| 属性                                  | 类型                                      | 说明                                |
| ------------------------------------- | ----------------------------------------- | ----------------------------------- |
| type                                  | string                                    | 固定为 'height'                     |
| config                                | object                                    | 配置对象，包含以下属性：            |
| &nbsp;&nbsp;&nbsp;&nbsp;field?        | string                                    | 字段名称                            |
| &nbsp;&nbsp;&nbsp;&nbsp;section-type? | string                                    | 分段类型，可选 'natural', 'average' |
| &nbsp;&nbsp;&nbsp;&nbsp;height-range? | number[]                                  | 高度范围数组                        |
| &nbsp;&nbsp;&nbsp;&nbsp;color         | string                                    | 颜色                                |
| &nbsp;&nbsp;&nbsp;&nbsp;label-size    | number                                    | 标签大小                            |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest       | [PointCommonOptions](#pointcommonoptions) | 点的通用渲染条件                    |

### GeoJsonLineStyle

`GeoJsonLineStyle` 为线的渲染配置，可以控制线的颜色、宽度、透明度等参数。

#### LineCommonOptions

`LineCommonOptions` 为线的通用渲染条件，可以控制线的轮廓颜色、轮廓宽度、透明度等参数。

| 属性               | 类型                          | 说明           |
| ------------------ | ----------------------------- | -------------- |
| custom?            | [CustomStyle](#customstyle)   | 用户自定义样式 |
| line-stroke-color? | [GeoJsonColor](#geojsoncolor) | 线颜色         |
| line-stroke-width? | number                        | 线宽度         |
| opacity?           | number                        | 线透明度       |

#### LineSingleStyle

`LineSingleStyle` 为单一线的渲染配置，可以控制点的颜色、字体、大小等参数。

| 属性                            | 类型                                    | 说明                     |
| ------------------------------- | --------------------------------------- | ------------------------ |
| type                            | string                                  | 固定为 'single'          |
| config                          | object                                  | 配置对象，包含以下属性： |
| &nbsp;&nbsp;&nbsp;&nbsp;color?  | [GeoJsonColor](#geojsoncolor)           | 线颜色                   |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest | [LineCommonOptions](#linecommonoptions) | 线的通用渲染条件         |

#### LineSectionStyle

`LineSectionStyle` 为分段线的渲染配置，可以根据字段值进行分段渲染，控制线的颜色、字体、大小等参数。

| 属性                                  | 类型                                    | 说明                                |
| ------------------------------------- | --------------------------------------- | ----------------------------------- |
| type                                  | string                                  | 固定为 'section'                    |
| config                                | object                                  | 配置对象，包含以下属性：            |
| &nbsp;&nbsp;&nbsp;&nbsp;field?        | string                                  | 字段名称                            |
| &nbsp;&nbsp;&nbsp;&nbsp;section-type? | string                                  | 分段类型，可选 'natural', 'average' |
| &nbsp;&nbsp;&nbsp;&nbsp;color?        | string[]                                | 线颜色数组                          |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest       | [LineCommonOptions](#linecommonoptions) | 线的通用渲染条件                    |

#### LineValueStyle

`LineValueStyle` 为单值线的渲染配置，可以根据字段值进行单值渲染，控制线的颜色、字体、大小等参数。

| 属性                            | 类型                                    | 说明                     |
| ------------------------------- | --------------------------------------- | ------------------------ |
| type                            | string                                  | 固定为 'value'           |
| config                          | object                                  | 配置对象，包含以下属性： |
| &nbsp;&nbsp;&nbsp;&nbsp;field?  | string                                  | 字段名称                 |
| &nbsp;&nbsp;&nbsp;&nbsp;color?  | string[]                                | 线颜色数组               |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest | [LineCommonOptions](#linecommonoptions) | 线的通用渲染条件         |

### GeoJsonPolygonStyle

`GeoJsonPolygonStyle` 为面的渲染配置，可以控制面的颜色、边框、透明度等参数。

#### PolygonCommonOptions

`PolygonCommonOptions` 为面的通用渲染条件，可以控制面的填充颜色、轮廓颜色、轮廓宽度、透明度等参数。

| 属性               | 类型                          | 说明           |
| ------------------ | ----------------------------- | -------------- |
| custom?            | [CustomStyle](#customstyle)   | 用户自定义样式 |
| fill-color?        | [GeoJsonColor](#geojsoncolor) | 填充颜色       |
| line-stroke-color? | [GeoJsonColor](#geojsoncolor) | 轮廓颜色       |
| line-stroke-width? | number                        | 轮廓宽度       |
| opacity?           | number                        | 面透明度       |

#### PolygonSingleStyle

`PolygonSingleStyle` 为单一面的渲染配置，可以控制面的颜色、字体、大小等参数。

| 属性                            | 类型                                          | 说明                     |
| ------------------------------- | --------------------------------------------- | ------------------------ |
| type                            | string                                        | 固定为 'single'          |
| config                          | object                                        | 配置对象，包含以下属性： |
| &nbsp;&nbsp;&nbsp;&nbsp;color?  | [GeoJsonColor](#geojsoncolor)                 | 面颜色                   |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest | [PolygonCommonOptions](#polygoncommonoptions) | 面的通用渲渲条件         |

#### PolygonSectionStyle

`PolygonSectionStyle` 为分段面的渲染配置，可以根据字段值进行分段渲染，控制面的颜色、字体、大小等参数。

| 属性                                  | 类型                                          | 说明                                |
| ------------------------------------- | --------------------------------------------- | ----------------------------------- |
| type                                  | string                                        | 固定为 'section'                    |
| config                                | object                                        | 配置对象，包含以下属性：            |
| &nbsp;&nbsp;&nbsp;&nbsp;field?        | string                                        | 字段名称                            |
| &nbsp;&nbsp;&nbsp;&nbsp;section-type? | string                                        | 分段类型，可选 'natural', 'average' |
| &nbsp;&nbsp;&nbsp;&nbsp;color?        | string[]                                      | 面颜色数组                          |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest       | [PolygonCommonOptions](#polygoncommonoptions) | 面的通用渲染条件                    |

#### PolygonValueStyle

`PolygonValueStyle` 为单值面的渲染配置，可以根据字段值进行单值渲染，控制面的颜色、字体、大小等参数。

| 属性                            | 类型                                          | 说明                     |
| ------------------------------- | --------------------------------------------- | ------------------------ |
| type                            | string                                        | 固定为 'value'           |
| config                          | object                                        | 配置对象，包含以下属性： |
| &nbsp;&nbsp;&nbsp;&nbsp;field?  | string                                        | 字段名称                 |
| &nbsp;&nbsp;&nbsp;&nbsp;color?  | string[]                                      | 面颜色数组               |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest | [PolygonCommonOptions](#polygoncommonoptions) | 面的通用渲染条件         |

#### PolygonPatternStyle

`PolygonPatternStyle` 为面的图案填充的渲染配置，可以控制面的图案、透明度等参数。

| 属性                                   | 类型                                          | 说明                     |
| -------------------------------------- | --------------------------------------------- | ------------------------ |
| type                                   | string                                        | 固定为 'pattern'         |
| config                                 | object                                        | 配置对象，包含以下属性： |
| &nbsp;&nbsp;&nbsp;&nbsp;pattern-image? | string                                        | 图案图片地址             |
| &nbsp;&nbsp;&nbsp;&nbsp;pattern-size?  | number[]                                      | 图案大小数组             |
| &nbsp;&nbsp;&nbsp;&nbsp;...rest        | [PolygonCommonOptions](#polygoncommonoptions) | 面的通用渲染条件         |

### GeoJsonMixStyle

`GeoJsonMixStyle` 为混合类型 geojson 的渲染配置，提供与 cesium 渲染 geojson 一致的配置。

以下是转换后的二级目录表格：

| 属性                                  | 类型         | 说明                                    |
| ------------------------------------- | ------------ | --------------------------------------- |
| type                                  | string       | 固定为 'single'                         |
| config                                | object       | 配置对象，包含以下属性：                |
| &nbsp;&nbsp;&nbsp;&nbsp;label-type    | string       | 标签类型，可选值为 'vector' 或 'icon'。 |
| &nbsp;&nbsp;&nbsp;&nbsp;markerSize?   | number       | 点标记的大小。                          |
| &nbsp;&nbsp;&nbsp;&nbsp;markerSymbol? | string       | 点标记的符号名称。                      |
| &nbsp;&nbsp;&nbsp;&nbsp;markerColor?  | GeoJsonColor | 点标记的颜色。                          |
| &nbsp;&nbsp;&nbsp;&nbsp;stroke?       | GeoJsonColor | 描边颜色。                              |
| &nbsp;&nbsp;&nbsp;&nbsp;strokeWidth?  | number       | 描边宽度。                              |
| &nbsp;&nbsp;&nbsp;&nbsp;fill?         | GeoJsonColor | 填充颜色。                              |
| sprite?                               | object       | 精灵图配置对象，包含以下属性：          |
| &nbsp;&nbsp;&nbsp;&nbsp;url           | string       | 精灵图的 URL 地址。                     |
| &nbsp;&nbsp;&nbsp;&nbsp;params        | object       | 精灵图的参数对象。                      |

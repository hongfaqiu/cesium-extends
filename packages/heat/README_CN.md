# @cesium-extends/heat

## 简介

这是一个用于在 CesiumJS 地图上创建热力图层的包。它提供了一种使用 heatmap.js 库创建和自定义热力图的简单方法。

## 安装

```bash
npm install @cesium-extends/heat
```

## 使用方法

### 导入

```javascript
import HeatMapLayer from "@cesium-extends/heat";
```

### 创建图层

```javascript
const viewer = new Cesium.Viewer("cesiumContainer");
const data = [
  { pos: [lon1, lat1], value: value1 },
  { pos: [lon2, lat2], value: value2 },
  // ...
];
const heatmap = new HeatMapLayer({
  viewer,
  data,
});
```

`data` 参数是一个带有 `pos` 和 `value` 属性的对象数组。 `pos` 是一个经度和纬度的数组，而 `value` 是该位置的值。

### 自定义热力图

```javascript
const heatmap = new HeatMapLayer({
  viewer,
  data,
  heatStyle: {
    radius: 20,
    maxOpacity: 0.5,
    blur: 0.8,
  },
});
```

可以使用 `heatStyle` 参数来自定义热力图的外观。可用选项为：

- `radius`：每个点的半径（以像素为单位）。
- `maxOpacity`：每个点的最大不透明度（透明度）。
- `blur`：应用于每个点的模糊量。

### 自动调整画布大小

```javascript
const heatmap = new HeatMapLayer({
  viewer,
  data,
  canvasConfig: {
    autoResize: true,
    minSize: 1024,
    maxSize: 10000,
  },
});
```

默认情况下，用于渲染热力图的画布的大小是固定的。但是，它可以根据数据点的数量自动调整大小。可以使用 `canvasConfig` 参数来配置此行为。可用选项为：

- `autoResize`：是否启用自动调整大小。
- `minSize`：画布的最小尺寸（以像素为单位）。
- `maxSize`：画布的最大尺寸（以像素为单位）。

### 自动调整半径

```javascript
const heatmap = new HeatMapLayer({
  viewer,
  data,
  autoRadiusConfig: {
    enabled: true,
    min: 1000000,
    max: 10000000,
    minRadius: 1,
    maxRadius: 10,
  },
});
```

每个点的半径可以根据当前摄像机高度自动调整。可以通过将 `autoRadiusConfig` 对象的 `enabled` 属性设置为 `true` 来启用此功能。 `min` 和 `max` 属性指定了摄像机高度的范围，而 `minRadius` 和 `maxRadius` 属性指定了相应点半径的范围。

### 更新数据

```javascript
heatmap.data = newData;
```

`data` 属性可用于使用新数据更新热力图。

### 更改配置

```javascript
heatmap.changeConfig({ radius: 30 });
```

可以通过调用 `changeConfig` 方法并传递新的配置对象来动态更改热力图的外观。

### 删除图层

```javascript
heatmap.remove();
```

可以通过调用 `remove` 方法从地图中删除热力图层。

### 销毁图层

```javascript
heatmap.destroy();
```

可以通过调用 `destroy` 方法完全销毁热力图层（包括其容器）并将其从 CesiumJS 地图中删除。

### 完整示例

以下是使用 `HeatMapLayer` 类在 CesiumJS 地图上创建热力图层的示例：

```javascript
import HeatMapLayer from "@cesium-extends/heat";

const viewer = new Cesium.Viewer("cesiumContainer");

// 热力图的数据
const data = [
  { pos: [120.153775, 30.287459], value: 50 },
  { pos: [120.155882, 30.291709], value: 70 },
  { pos: [120.156977, 30.293814], value: 40 },
  { pos: [120.154543, 30.296191], value: 90 },
  { pos: [120.152671, 30.298352], value: 60 },
  { pos: [120.140383, 30.300447], value: 80 },
];

// 创建热力图层
const heatmap = new HeatMapLayer({
  viewer,
  data,
  heatStyle: {
    radius: 20,
    maxOpacity: 0.5,
    blur: 0.8,
  },
});

// 动态更新热力图数据
setInterval(() => {
  const newData = data.map((item) => ({
    pos: item.pos,
    value: Math.floor(Math.random() * 100),
  }));
  heatmap.data = newData;
}, 2000);
```

这个示例将在地图上创建一个包含一些随机值的初始热力图，并每两秒钟更新一次数据。

## API 参考

### `new HeatMapLayer(options: HeatMapLayerContructorOptions)`

使用指定的选项创建一个新的 `HeatMapLayer` 实例。

#### `options.viewer: Viewer`

要将热力图层添加到的 CesiumJS `Viewer`。

#### `options.data: HeatMapDataItem[]`

表示热力图数据点的对象数组。每个对象应该有一个 `pos` 属性，它是经度和纬度的数组，以及一个 `value` 属性，它是该位置的值。

#### `options.heatStyle?: BaseHeatmapConfiguration`

可选的热力图外观配置。有关详细信息，请参见 [heatmap.js 文档](https://www.patrick-wied.at/static/heatmapjs/docs.html#h337-create-config)。

#### `options.canvasSize?: number`

已弃用。改用 `options.canvasConfig.width` 和 `options.canvasConfig.height`。

#### `options.bbox?: number[]`

已弃用。改用 `options.tolerance`。

#### `options.autoRadiusConfig?: AutoRadiusConfig`

自动根据相机高度调整点半径的可选配置。请参见上面的示例了解更多信息。

#### `options.tolerance?: number`

数据范围周围的可选缓冲区宽度（以度为单位）。这可用于在地图边缘附近显示热力图时避免边缘效应。

#### `options.canvasConfig?: CanvasConfig`

可选的热力图画布配置。请参见上面的示例了解更多信息。

### 属性

#### `heatmap.data: HeatMapDataItem[]`

获取或设置热力图的数据点。

#### `heatmap.show: boolean`

获取或设置热力图层是否在地图上可见。

#### `heatmap.autoRadiusConfig: Required<AutoRadiusConfig>`

获取或设置自动根据相机高度调整点半径的配置。请参见上面的示例了解更多信息。

#### `heatmap.dataRange: { west: number; east: number; sourth: number; north: number; min: number; max: number; }`

返回当前数据的经度、纬度和值的数据范围。

### 方法

#### `heatmap.changeConfig(config: BaseHeatmapConfiguration | undefined): void`

更改热力图的配置。有关详细信息，请参见 [heatmap.js 文档](https://www.patrick-wied.at/static/heatmapjs/docs.html#h337-configure)。

#### `heatmap.updateCesium(): void`

更新 CesiumJS 地图上的热力图。

#### `heatmap.convertHeatItem(heatItems: HeatMapDataItem[]): DataPoint[]`

将 `HeatMapDataItem` 对象数组转换为 `DataPoint` 对象数组，这些对象可以被 heatmap.js 库使用。

#### `heatmap.convertPos(pos: number[]): number[]`

将经度和纬度对转换为画布上的 x-y 坐标。

#### `heatmap.remove(): boolean`

从 CesiumJS 地图中删除热力图层。

#### `heatmap.destroy(): boolean`

销毁热力图层（包括其容器）并从 CesiumJS 地图中删除它。## 类型定义

### `HeatMapDataItem`

表示热图中单个数据点的对象。

```typescript
interface HeatMapDataItem {
  pos: [number, number];
  value: number;
}
```

### `BaseHeatmapConfiguration`

热图外观的配置对象。有关更多信息，请参见 [heatmap.js 文档](https://www.patrick-wied.at/static/heatmapjs/docs.html#h337-create-config)。

```typescript
interface BaseHeatmapConfiguration {
  gradient?: Gradient | Record<string, string>;
  minOpacity?: number;
  maxOpacity?: number;
  blur?: number;
  radius?: number;
  backgroundColor?: string;
  opacity?: number;
}
```

### `AutoRadiusConfig`

根据相机高度自动调整点半径的配置对象。

```typescript
interface AutoRadiusConfig {
  enabled?: boolean;
  min: number;
  max: number;
  minRadius: number;
  maxRadius: number;
}
```

### `CanvasConfig`

热图画布的配置对象。

```typescript
interface CanvasConfig {
  autoResize?: boolean;
  minSize?: number;
  maxSize?: number;
  width?: number;
  height?: number;
}
```

### `DataPoint`

以 heatmap.js 库所需格式表示单个数据点的对象。

```typescript
interface DataPoint {
  x: number;
  y: number;
  value: number;
}
```

### `Gradient`

用于给热图着色的渐变对象。

```typescript
type Gradient = Record<number, string>;
```

## 鸣谢

https://github.com/postor/cesiumjs-heat

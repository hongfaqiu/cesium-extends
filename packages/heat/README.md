# @cesium-extends/heat

## Introduction

This is a package for creating heatmap layers on CesiumJS map. It provides an easy way to create and customize heatmaps using the heatmap.js library.

[中文 Readme](./README_CN.md)

## Installation

```bash
npm install @cesium-extends/heat
```

## Usage

### Importing

```javascript
import HeatMapLayer from "@cesium-extends/heat";
```

### Creating a layer

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

The `data` parameter is an array of objects with `pos` and `value` properties. `pos` is an array of longitude and latitude, and `value` is the value at that location.

### Customizing the heatmap

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

The `heatStyle` parameter can be used to customize the appearance of the heatmap. The available options are:

- `radius`: the radius of each point in pixels.
- `maxOpacity`: the maximum opacity (transparency) of each point.
- `blur`: the amount of blur to apply to each point.

### Auto-resizing canvas

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

By default, the canvas used to render the heatmap is fixed at a certain size. However, it can be set to auto-resize based on the number of data points. The `canvasConfig` parameter can be used to configure this behavior. The available options are:

- `autoResize`: whether to enable auto-resizing.
- `minSize`: the minimum size of the canvas in pixels.
- `maxSize`: the maximum size of the canvas in pixels.

### Auto-adjusting radius

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

The radius of each point can be automatically adjusted based on the current camera height. This can be enabled by setting the `enabled` property of the `autoRadiusConfig` object to `true`. The `min` and `max` properties specify the range of camera heights, and the `minRadius` and `maxRadius` properties specify the corresponding range of point radii.

### Updating the data

```javascript
heatmap.data = newData;
```

The `data` property can be used to update the heatmap with new data.

### Changing the configuration

```javascript
heatmap.changeConfig({ radius: 30 });
```

The appearance of the heatmap can be changed dynamically by calling the `changeConfig` method and passing a new configuration object.

### Removing the layer

```javascript
heatmap.remove();
```

The heatmap layer can be removed from the map by calling the `remove` method.

### Destroying the layer

```javascript
heatmap.destroy();
```

The heatmap layer can be completely destroyed (including its container) by calling the `destroy` method.

### Full Example

Here is an example of using the `HeatMapLayer` class to create a heatmap layer on a CesiumJS map:

```javascript
import HeatMapLayer from "@cesium-extends/heat";

const viewer = new Cesium.Viewer("cesiumContainer");

// Data for the heatmap
const data = [
  { pos: [-122.4194, 37.7749], value: 20 },
  { pos: [-74.0059, 40.7128], value: 30 },
  { pos: [139.6917, 35.6895], value: 15 },
  // ...
];

// Create the heatmap layer
const heatmap = new HeatMapLayer({
  viewer,
  data,
  heatStyle: {
    radius: 20,
    maxOpacity: 0.5,
    blur: 0.8,
  },
  autoRadiusConfig: {
    enabled: true,
    min: 1000000,
    max: 10000000,
    minRadius: 1,
    maxRadius: 10,
  },
});

// Update the data after a delay
setTimeout(() => {
  const newData = [
    { pos: [-122.4194, 37.7749], value: 30 },
    { pos: [-74.0059, 40.7128], value: 10 },
    { pos: [139.6917, 35.6895], value: 25 },
    // ...
  ];
  heatmap.data = newData;
}, 5000);

// Change the configuration after a delay
setTimeout(() => {
  heatmap.changeConfig({ radius: 30 });
}, 10000);

// Remove the layer after a delay
setTimeout(() => {
  heatmap.remove();
}, 15000);
```

## API Reference

### `new HeatMapLayer(options: HeatMapLayerContructorOptions)`

Creates a new `HeatMapLayer` instance with the specified options.

#### `options.viewer: Viewer`

The CesiumJS `Viewer` to add the heatmap layer to.

#### `options.data: HeatMapDataItem[]`

An array of objects representing the data points of the heatmap. Each object should have a `pos` property, which is an array of longitude and latitude, and a `value` property, which is the value at that location.

#### `options.heatStyle?: BaseHeatmapConfiguration`

Optional configuration for the appearance of the heatmap. See [heatmap.js documentation](https://www.patrick-wied.at/static/heatmapjs/docs.html#h337-create-config) for more information.

#### `options.canvasSize?: number`

Deprecated. Use `options.canvasConfig.width` and `options.canvasConfig.height` instead.

#### `options.bbox?: number[]`

Deprecated. Use `options.tolerance` instead.

#### `options.autoRadiusConfig?: AutoRadiusConfig`

Optional configuration for automatically adjusting the point radius based on camera height. See the example above for more information.

#### `options.tolerance?: number`

Optional buffer width (in degrees) around the data range. This can be used to avoid edge effects when displaying the heatmap near the edges of the map.

#### `options.canvasConfig?: CanvasConfig`

Optional configuration for the heatmap canvas. See the example above for more information.

### Properties

#### `heatmap.data: HeatMapDataItem[]`

Gets or sets the data points of the heatmap.

#### `heatmap.show: boolean`

Gets or sets whether the heatmap layer is visible on the map.

#### `heatmap.autoRadiusConfig: Required<AutoRadiusConfig>`

Gets or sets the configuration for automatically adjusting the point radius based on camera height. See the example above for more information.

#### `heatmap.dataRange: { west: number; east: number; sourth: number; north: number; min: number; max: number; }`

Returns the data range (in longitude, latitude, and value) of the current data.

### Methods

#### `heatmap.changeConfig(config: BaseHeatmapConfiguration | undefined): void`

Changes the configuration of the heatmap. See [heatmap.js documentation](https://www.patrick-wied.at/static/heatmapjs/docs.html#h337-configure) for more information.

#### `heatmap.updateCesium(): void`

Updates the heatmap on the CesiumJS map.

#### `heatmap.convertHeatItem(heatItems: HeatMapDataItem[]): DataPoint[]`

Converts an array of `HeatMapDataItem` objects to an array of `DataPoint` objects, which can be used by the heatmap.js library.

#### `heatmap.convertPos(pos: number[]): number[]`

Converts a longitude-latitude pair to an x-y pair on the canvas.

#### `heatmap.remove(): boolean`

Removes the heatmap layer from the CesiumJS map.

#### `heatmap.destroy(): boolean`

Destroys the heatmap layer (including itscontainer) and removes it from the CesiumJS map.

## Type Definitions

### `HeatMapDataItem`

An object representing a single data point of the heatmap.

```typescript
interface HeatMapDataItem {
  pos: [number, number];
  value: number;
}
```

### `BaseHeatmapConfiguration`

A configuration object for the appearance of the heatmap. See [heatmap.js documentation](https://www.patrick-wied.at/static/heatmapjs/docs.html#h337-create-config) for more information.

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

A configuration object for automatically adjusting the point radius based on camera height.

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

A configuration object for the heatmap canvas.

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

An object representing a single data point in the format expected by the heatmap.js library.

```typescript
interface DataPoint {
  x: number;
  y: number;
  value: number;
}
```

### `Gradient`

A gradient object used to colorize the heatmap.

```typescript
type Gradient = Record<number, string>;
```

## Credit

https://github.com/postor/cesiumjs-heat

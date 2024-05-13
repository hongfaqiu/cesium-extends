# @cesium-extends/compass

A compass widget for [Cesium](https://cesium.com/) based on [@cesium-extends/common](https://www.npmjs.com/package/@cesium-extends/common) library.
[中文 Readme](./README_CN.md)

## Installation

```bash
npm install @cesium-extends/compass
```

## Usage

The `Compass` widget can be used in a Cesium app to display a compass. To use the widget, first import it into your project:

```javascript
import Compass from "@cesium-extends/compass";
```

Next, create a new instance of the widget and pass it your Cesium Viewer instance:

```javascript
const viewer = new Cesium.Viewer("cesiumContainer");
const compass = new Compass(viewer);
```

You can also customize the widget by passing an options object when creating a new instance:

```javascript
const compass = new Compass(viewer, {
  container: document.getElementById("compass-container"),
  tips: {
    inner: "North",
    outer: "Rotate",
  },
});
```

## API

### `constructor(viewer: Cesium.Viewer, options?: CompassOptions)`

Creates a new instance of the `Compass` widget attached to the specified Cesium Viewer.

#### Parameters

- `viewer`: The Cesium Viewer instance to attach the widget to.
- `options` (optional): An object containing optional parameters for the widget.

#### `enabled`

A boolean property that controls whether the widget is enabled or not.

#### `ready`

A boolean property indicating whether the widget is ready or not.

### `hide()`

A method for hiding the widget.

### `show()`

A method for showing the widget.

### `destroy(): void`

Mounts the content of the widget.

## Options

The following options can be passed when creating a new instance of the `Compass` widget:

- `container` (optional): The DOM element to mount the widget to. Defaults to `viewer.container`.
- `tips` (optional): An object containing strings for the inner and outer tips of the compass. Defaults to `{ inner: '', outer: 'Drag outer ring: rotate view.\nDrag inner gyroscope: free orbit.\nDouble-click: reset view.\nTIP: You can also free orbit by holding the CTRL key and dragging the map.' }`.
- `icons`: (Optional): The compass icon SVG used. Default to `{ compass_outer: string, compass_inner: string, compass_rotation_marker: string }`

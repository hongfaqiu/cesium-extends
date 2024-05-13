# @cesium-extends/zoom-control

A zoom controller widget for Cesium, which is an npm package that can be used with [Cesium](https://cesium.com/).
[中文 Readme](./README_CN.md)

## Features

- Zoom in, Zoom out and Reset zoom functionality.

## Installation

Install it via npm:

```bash
npm install @cesium-extends/zoom-control
```

## Usage

### Importing the module

```javascript
import ZoomController from "@cesium-extends/zoom-control";
```

### Creating an instance of the widget

```javascript
const viewer = new Cesium.Viewer("cesiumContainer");
const zoomController = new ZoomController(viewer, {
  container: document.getElementById("myContainer"),
  home: new Cesium.Cartesian3.fromDegrees(-98.57, 39.82, 5000000),
});
```

The constructor of `ZoomController` takes two arguments:

- `viewer`: A required parameter representing the instance of the Cesium Viewer.
- `options`: An optional object containing following properties:
  - `container`: An optional property representing the HTML element where the widget needs to be added to.
  - `home`: An optional property representing the Cartesian3 position to which the camera should fly back when reset zoom button is clicked.
  - `tips`: An optional property representing an object containing text messages to display as tooltip for the buttons.Defaults to `{ zoomIn: 'Zoom In', zoomOut: 'Zoom Out', refresh: 'Reset Zoom' }`
  - `icons`: An optional attribute representing the SVG component used, default object `{ controller_decrease: string, controller_increase: string, controller_refresh: string }`

### Using the widget methods

Once you have created an instance of `ZoomController`, you can access the following methods:

- `show()`: To show the widget.
- `hide()`: To hide the widget.
- `destroy()`: To destroy the widget.

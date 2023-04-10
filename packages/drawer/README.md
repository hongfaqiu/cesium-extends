# @cesium-extends/drawer

A package for drawing shapes in CesiumJS.
[中文 Readme](./README_CN.md)

## Installation

Use npm to install:

```bash
npm install @cesium-extends/drawer
```

## Usage

### Import

```javascript
import Drawer from "@cesium-extends/drawer";
```

### Constructor

```javascript
const drawer = new Drawer(viewer, options);
```

#### Parameters

- `viewer`: A [Cesium Viewer](https://cesium.com/docs/cesiumjs-ref-doc/Viewer.html) object.
- `options` (optional): A `Partial<DrawOption>` object with the following properties:

  - `terrain` (default: `false`): A boolean that indicates whether to use terrain. If enabled, terrain selection functionality is required by the browser. If this feature is not supported, it will be disabled.
  - `operateType`: An object that specifies the types of events used to draw shapes. The default values are:

    ```javascript
    {
      START: 'LEFT_CLICK',
      MOVING: 'MOUSE_MOVE',
      CANCEL: 'RIGHT_CLICK',
      END: 'LEFT_DOUBLE_CLICK'
    }
    ```

  - `dynamicGraphicsOptions`: An object that specifies the default graphics options when dynamically drawing shapes. It contains the following properties:
    - `POINT`: A `PointGraphics.ConstructorOptions` object.
    - `POLYLINE`: A `PolylineGraphics.ConstructorOptions` object.
    - `POLYGON`: A `PolygonGraphics.ConstructorOptions` object.
    - `CIRCLE`: A `EllipseGraphics.ConstructorOptions` object.
    - `RECTANGLE`: A `RectangleGraphics.ConstructorOptions` object.
  - `action`: A callback function that receives mouse events.
  - `sameStyle` (default: `true`): A boolean that indicates whether multiple shapes drawn using the same instance of `Drawer` should have the same style.
  - `tips`: An object that specifies the text to display in the mouse tooltip during editing. It contains the following properties:
    - `init` (default: `'Click to draw'`): The tooltip text to display when starting a new shape.
    - `start` (default: `'LeftClick to add a point, rightClick remove point, doubleClick end drawing'`): The tooltip text to display while drawing a shape.
    - `end` (default: `''`): The tooltip text to display when finishing a shape.

### Methods

#### start(config, overrideFunc)

Starts drawing a new shape with the specified configuration.

##### Parameters

- `config`: A `StartOption` object with the following properties:
  - `type`: A string that specifies the type of shape to draw. Valid values are `'POLYGON'`, `'POLYLINE'`, `'POINT'`, `'CIRCLE'`, and `'RECTANGLE'`.
  - `once` (optional): A boolean that indicates whether to stop drawing after the first shape is completed.
  - `oneInstance` (optional): A boolean that indicates whether to destroy the previous shape when a new one is started.
  - `finalOptions` (optional): An object that specifies the graphics options for the completed shape. See [CesiumJS documentation](https://cesium.com/docs/cesiumjs-ref-doc/PointGraphics.html) for available options.
  - `dynamicOptions` (optional): An object that specifies the graphics options for the shape as it is being drawn. See [CesiumJS documentation](https://cesium.com/docs/cesiumjs-ref-doc/PointGraphics.html) for available options.
  - `onPointsChange` (optional): A callback function that receives an array of Cartesian3 points whenever the shape's points change.
  - `onEnd` (optional): A callback function that is called when the shape is completed. It receives the completed entity and an array of Cartesian3 positions for the shape.
- `overrideFunc` (optional): A function that can be used to override the completed shape. This function takes an event type and an entity, and can return a new entity or nothing.

#### reset()

Resets the drawer's status.

#### pause()

Pauses the drawer.

#### destroy()

Destroys the drawer.

## Example

```javascript
import Drawer from "@cesium-extends/drawer";

const viewer = new Cesium.Viewer("cesiumContainer");
const drawer = new Drawer(viewer);

drawer.start({
  type: "POLYGON",
  finalOptions: {
    material: Cesium.Color.RED.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
  },
});
```

## Properties

### status

A read-only property that returns the current status of the drawer. Possible values are:

- `'INIT'`: The drawer has been initialized but is not actively drawing a shape.
- `'START'`: The drawer is actively drawing a shape.
- `'PAUSE'`: The drawer is paused.
- `'DESTROY'`: The drawer has been destroyed.

### operateType

A read-only property that returns an object with the types of events used to draw shapes.

### isDestroyed

A read-only property that returns `true` if the drawer has been destroyed, `false` otherwise.

## License

@cesium-extends/drawer is licensed under the MIT License. See [LICENSE](https://github.com/cesium-extends/drawer/blob/master/LICENSE) for more information.

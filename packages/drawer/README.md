# @cesium-extends/drawer

A drawing tool library based on Cesium, supporting commonly used shapes such as point, line, polygon, circle, etc.
[中文 Readme](./README_CN.md)

## Installing

Using npm:

```bash
npm install @cesium-extends/drawer --save
```

## Usage

```javascript
import Drawer from "@cesium-extends/drawer";
import Cesium from "cesium";

// Initialize the viewer
const viewer = new Cesium.Viewer("cesiumContainer");

// Create a Drawer instance
const drawer = new Drawer(viewer);

// Start drawing
drawer.start({
  type: "POLYGON",
  finalOptions: {
    material: Cesium.Color.RED.withAlpha(0.5),
  },
});
```

### DrawOption

Here are the configurable options of `options`:

| Property                 | Type                                                                                                                                                    | Default                                                                                                                     | Description                                                                             |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| `terrain`                | `boolean`                                                                                                                                               | `false`                                                                                                                     | Whether to enable terrain mode, which requires the browser to support terrain selection. |
| `model`                  | `boolean`                                                                                                                                               | `false`                                                                                                                     | Whether to enable draw point on model.                                                  |
| `operateType`            | `{START?: EventType, MOVING?: EventType, CANCEL?: EventType, END?: EventType}`                                                                          | `{START: LEFT_CLICK, MOVING: MOUSE_MOVE, CANCEL: RIGHT_CLICK, END: LEFT_DOUBLE_CLICK}`                                      | Operation types.                                                                        |
| `dynamicGraphicsOptions` | `{POINT: PointGraphics.ConstructorOptions; POLYLINE: PolylineGraphics.ConstructorOptions; POLYGON: PolygonGraphics.ConstructorOptions; CIRCLE: EllipseGraphics.ConstructorOptions; RECTANGLE: RectangleGraphics.ConstructorOptions;}` | -                                                                                                                           | Dynamic graphics configuration when no shape has been confirmed yet.                    |
| `action`                 | `(action: EventType, move: EventArgs) => void`                                                                                                          | -                                                                                                                           | Mouse event callback.                                                                   |
| `sameStyle`              | `boolean`                                                                                                                                               | `true`                                                                                                                      | Whether to use the same style when drawing multiple shapes.                             |
| `tips`                   | `{init?: string or Element, start?: string or Element, end?: string or Element}`                                                                        | `{init: 'Click to draw', start: 'LeftClick to add a point, rightClick remove point, doubleClick end drawing', end: ''}`      | Custom mouse movement tips during editing.                                              |


### StartOption

Here are the configurable options of `config`:

| Property         | Type                                                | Default     | Description                                                          |
| ---------------- | --------------------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `type`           | `'POLYGON' \| 'POLYLINE' \| 'POINT' \| 'CIRCLE' \| 'RECTANGLE'` | -           | The type of shape to draw.                                           |
| `once`           | `boolean`                                           | `undefined` | Whether to draw only once.                                           |
| `oneInstance`    | `boolean`                                           | `false`     | Whether to use singleton mode.                                       |
| `finalOptions`   | `object`                                            | `{}`        | Entity options for drawing.                                          |
| `dynamicOptions` | `object`                                            | `{}`        | Dynamic graphics configuration when no shape has been confirmed yet. |
| `onPointsChange` | `(points: Cartesian3[]) => void`                    | -           | Callback function for changes in points.                             |
| `onEnd`          | `(entity: Entity, positions: Cartesian3[]) => void` | -           | Callback function when drawing is completed.                         |


## Instance Methods

| Method                                                          | Description                  |
| --------------------------------------------------------------- | ---------------------------- |
| `start(config: StartOption, overrideFunc?: OverrideEntityFunc)` | Start drawing.               |
| `reset()`                                                       | Reset the status.            |
| `pause()`                                                       | Pause drawing.               |
| `destroy()`                                                     | Destroy the Drawer instance. |

## Type Definitions

### DrawOption

```typescript
type DrawOption = {
  terrain: boolean;
  operateType: OperationType;
  dynamicGraphicsOptions: {
    POINT: PointGraphics.ConstructorOptions;
    POLYLINE: PolylineGraphics.ConstructorOptions;
    POLYGON: PolygonGraphics.ConstructorOptions;
    CIRCLE: EllipseGraphics.ConstructorOptions;
    RECTANGLE: RectangleGraphics.ConstructorOptions;
  };
  action?: ActionCallback;
  sameStyle: boolean;
  tips: {
    init?: string | Element;
    start?: string | Element;
    end?: string | Element;
  };
};
```

### StartOption

```typescript
type StartOption = {
  type: "POLYGON" | "POLYLINE" | "POINT" | "CIRCLE" | "RECTANGLE";
  once?: boolean;
  oneInstance?: boolean;
  finalOptions?: object;
  dynamicOptions?: object;
  onPointsChange?: BasicGraphicesOptions["onPointsChange"];
  onEnd?: (entity: Entity, positions: Cartesian3[]) => void;
};
```

### Status

```typescript
type Status = "INIT" | "START" | "PAUSE" | "DESTROY";
```

### OperationType

```typescript
type OperationType = {
  START?: EventType;
  MOVING?: EventType;
  CANCEL?: EventType;
  END?: EventType;
};
```

### OverrideEntityFunc

```typescript
type OverrideEntityFunc = (
  this: Drawer,
  action: EventType,
  entity: Entity
) => Entity | void;
```

### ActionCallback

```typescript
type ActionCallback = (action: EventType, move: EventArgs) => void;
```

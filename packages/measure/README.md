# @cesium-extends/measure

@cesium-extends/measure is a measurement tool based on Cesium, which supports distance and area measurement and is easy to use.
[中文 Readme](./README_CN.md)

## Installation

Install via npm:

```bash
npm install @cesium-extends/measure --save
```

## Usage

Import the `@cesium-extends/measure` module in your project, then instantiate the corresponding measuring class for measurement.

### AreaMeasure

Used for non-ground area measurement.

```typescript
import { Viewer } from "cesium";
import { AreaMeasure } from "@cesium-extends/measure";

const viewer = new Viewer("cesiumContainer");
const areaMeasure = new AreaMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // The callback function when the measurement is completed, returning the measurement result
  },
});

// Start drawing
areaMeasure.start();
```

### AreaSurfaceMeasure

Used for ground area measurement.

```typescript
import { Viewer } from "cesium";
import { AreaSurfaceMeasure } from "@cesium-extends/measure";

const viewer = new Viewer("cesiumContainer");
const areaSurfaceMeasure = new AreaSurfaceMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // The callback function when the measurement is completed, returning the measurement result
  },
});

// Start drawing
areaSurfaceMeasure.start();
```

### DistanceMeasure

Used for non-ground distance measurement.

```typescript
import { Viewer } from "cesium";
import { DistanceMeasure } from "@cesium-extends/measure";

const viewer = new Viewer("cesiumContainer");
const distanceMeasure = new DistanceMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // The callback function when the measurement is completed, returning the measurement result
  },
});

// Start drawing
distanceMeasure.start();
```

### DistanceSurfaceMeasure

Used for ground distance measurement.

```typescript
import { Viewer } from "cesium";
import { DistanceSurfaceMeasure } from "@cesium-extends/measure";

const viewer = new Viewer("cesiumContainer");
const distanceSurfaceMeasure = new DistanceSurfaceMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // The callback function when the measurement is completed, returning the measurement result
  },
});

// Start drawing
distanceSurfaceMeasure.start();
```

## API

### MeasureOptions

| Parameter     | Type     | Description                                         |
| ------------- | -------- | --------------------------------------------------- |
| labelStyle    | object   | Label style                                         |
| units         | string   | Unit of measure, default is 'kilometers'            |
| locale        | object   | Custom locale                                       |
| onEnd         | function | Callback function when the measurement is completed |
| drawerOptions | object   | Drawing tool options                                |

### Measure

The base class for measurement. Other measuring classes inherit from this class.

#### Constructor

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

Create a measurement tool instance.

Parameters:

- `viewer`: Cesium.Viewer object.
- `options` (optional): Configuration item with type `MeasureOptions`.

#### Properties

##### `destroyed: boolean`

Returns whether the current measurement tool has been destroyed.

##### `mouseTooltip: MouseTooltip`

Mouse tooltip tool instance.

##### `drawer: Drawer`

Drawing tool instance.

#### Methods

##### `start(): void`

Start measuring.

##### `end(): void`

End measuring and clear the measurement result.

##### `destroy(): void`

Destroy the measurement tool.

### AreaMeasure

Used for non-ground area measurement.

#### Constructor

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

Create an `AreaMeasure` instance.

Parameters:

- `viewer`: Cesium.Viewer object.
- `options` (optional): Configuration item with type `MeasureOptions`.

#### Methods

##### `getArea(positions: Cartesian3[]): number`

Calculate the area of a polygon.

Parameters:

- `positions`: An array of positions, with each position being of type `Cartesian3`.

Return value: The area, with the unit specified by the configuration item, defaulting to meters.

### AreaSurfaceMeasure

Used for ground area measurement.

#### Constructor

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

Create an `AreaSurfaceMeasure` instance.

Parameters:

- `viewer`: Cesium.Viewer object.
- `options` (optional): Configuration item with type `MeasureOptions`.

#### Methods

##### `getArea(positions: Cartesian3[]): number`

Calculate the ground area of a polygon.

Parameters:

- `positions`: An array of positions, with each position being of type `Cartesian3`.

Return value: The area, with the unit specified by the configuration item, defaulting to meters.

### DistanceMeasure

Used for non-ground distance measurement.

#### Constructor

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

Create a `DistanceMeasure` instance.

Parameters:

- `viewer`: Cesium.Viewer object.
- `options` (optional): Configuration item with type `MeasureOptions`.

#### Methods

##### `getDistance(start: Cartesian3, end: Cartesian3): number`

Calculate the distance between two points.

Parameters:

- `start`: The starting point coordinates, as a `Cartesian3`.
- `end`: The ending point coordinates, as a `Cartesian3`.

Return value: The distance between the two points, with the unit specified by the configuration item, defaulting to meters.

### DistanceSurfaceMeasure

Used for ground distance measurement.

#### Constructor

##### `constructor(viewer: Viewer, options?: MeasureOptions & {splitNum?: number})`

Create a `DistanceSurfaceMeasure` instance.

Parameters:

- `viewer`: Cesium.Viewer object.
- `options` (optional): Configuration item with type `MeasureOptions`, also supports an additional `splitNum` parameter, indicating how many segments to divide the line for surface distance calculation. When this parameter is not passed, it defaults to 10.

#### Methods

##### `getDistance(pos1: Cartesian3, pos2: Cartesian3): number`

Calculate the ground distance between two points.

Parameters:

- `pos1`: The starting point coordinates, as a `Cartesian3`.
- `pos2`: The ending point coordinates, as a `Cartesian3`.

Return value: The distance between the two points, with the unit specified by the configuration item, defaulting to meters.

## Notes

- This tool is based on Cesium and requires the Cesium library to be imported into the project.
- Please make sure you understand the basics of Cesium and how to create a Viewer before using the measuring tool.
- Before using the measuring tool, other operations that may affect the interaction, such as camera roaming and scene rotation, should be stopped.
- Please be aware of the performance of the browser during use. Excessive drawing may cause the browser to crash or freeze.
- The current version only supports distance and area measurement. If you need to implement other functions, you can extend it yourself.
- The tool code is open source. If you have any questions or suggestions, please submit an issue or PR on the GitHub project page.

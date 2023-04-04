## @cesium-extends/primitive-geojson

@cesium-extends/primitive-geojson is a JavaScript library based on Cesium that parses GeoJSON and TopoJSON data into visualizable Cesium entities, including points, lines, polygons, labels, etc. It can be installed as an npm package and used directly in Cesium projects.
[中文 Readme](./README_CN.md)

### Installation

Install using npm:

```
npm install @cesium-extends/primitive-geojson
```

### Usage

To use @cesium-extends/primitive-geojson in your project, simply import it like any other module:

```javascript
import { GeoJsonPrimitiveLayer } from "@cesium-extends/primitive-geojson";
```

Then create a new instance of the `GeoJsonPrimitiveLayer` class and load your GeoJSON data:

```javascript
const layer = new GeoJsonPrimitiveLayer();
layer.load("path/to/data.json").then(() => {
  // Do something when the data is loaded
});
```

See the API documentation for more details on usage and available options.

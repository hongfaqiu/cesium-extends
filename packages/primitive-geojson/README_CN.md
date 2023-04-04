## @cesium-extends/primitive-geojson

@cesium-extends/primitive-geojson 是基于 Cesium 的 JavaScript 库，用于将 GeoJSON 和 TopoJSON 数据解析为可视化的 Cesium 实体，包括点、线、面、标注等。它可以作为 npm 包安装，并在 Cesium 项目中直接使用。

### 安装

通过 npm 进行安装：

```
npm install @cesium-extends/primitive-geojson
```

### 使用方法

要在您的项目中使用 @cesium-extends/primitive-geojson，只需像其他模块一样导入即可：

```javascript
import { GeoJsonPrimitiveLayer } from "@cesium-extends/primitive-geojson";
```

然后创建 `GeoJsonPrimitiveLayer` 类的新实例并加载您的 GeoJSON 数据：

```javascript
const layer = new GeoJsonPrimitiveLayer();
layer.load("path/to/data.json").then(() => {
  // 当数据加载完毕时执行某些操作
});
```

有关使用和可用选项的详细信息，请参阅 API 文档。

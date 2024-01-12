---
title: primitive-geojson
nav: 指南
group: 扩展
order: 2
---

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
import { GeoJsonPrimitiveLayer } from '@cesium-extends/primitive-geojson';
```

然后创建 `GeoJsonPrimitiveLayer` 类的新实例并加载您的 GeoJSON 数据：

```javascript
const layer = new GeoJsonPrimitiveLayer();
layer.load('path/to/data.json').then(() => {
  viewer.scene.primitives.add(primitiveLayer.primitiveCollection);
});
```

有关使用和可用选项的详细信息，请参阅 [API 文档](#API文档)。

---

## API 文档

### BasicGraphicLayer 类

#### 构造函数 BasicGraphicLayer(options)

创建一个 `BasicGraphicLayer` 的实例。

##### 参数

- `options`: 可选参数，包含如下属性：
  - `subscriber`: 可选参数，用于添加事件监听器的对象。

#### 方法

##### addSubscribers(callback, eventType)

添加事件监听器。

- `callback`: 监听器回调函数。
- `eventType`: 监听事件类型。

##### removeSubscribers(ids)

移除事件监听器。

- `ids`: 可选参数，要删除的监听器 Id。

---

### GeoJsonPrimitiveLayer 类

#### 构造函数 GeoJsonPrimitiveLayer(options)

创建一个 `GeoJsonPrimitiveLayer` 的实例。

##### 参数

- `options`: 可选参数，包含如下属性：
  - `name`: 图层名称。
  - `subscriber`: 可选参数，用于添加事件监听器的对象。
  - `options`: 可选参数，包含图层相关的配置项。

#### 属性

##### billboardCollection

获取当前实例中的 `BillboardCollection` 对象。

##### labelCollection

获取当前实例中的 `LabelCollection` 对象。

##### pointPrimitiveCollection

获取当前实例中的 `PointPrimitiveCollection` 对象。

##### primitiveCollection

获取当前实例中的 `PrimitiveCollection` 对象。

##### polygonPrimitive

获取当前实例中的 `Polygon` 对象，如果没有则返回 `undefined`。

##### circlePrimitive

获取当前实例中的 `Circle` 对象，如果没有则返回 `undefined`。

##### polylinePrimitive

获取当前实例中的 `Polyline` 对象，如果没有则返回 `undefined`。

##### featureItems

获取当前实例中的所有 `PrimitiveItem` 对象。

##### pinBuilder

获取当前实例中的 `PinBuilder` 对象。

##### name

获取或设置当前实例的名称。

##### loading

获取一个值，指示数据源是否正在加载数据。

##### changedEvent

获取当底层数据源更改时触发的事件。

##### credit

获取当前实例的 `Credit` 对象。

##### errorEvent

获取遇到错误时触发的事件。

##### loadingEvent

获取数据源开始或停止加载时触发的事件。

##### show

获取或设置当前实例是否可见。

##### crsNames

获取一个对象，将 CRS 的名称映射到将 GeoJSON 坐标转换为 WGS84 地球固定笛卡尔坐标的回调函数。

##### crsLinkHrefs

获取一个对象，将 CRS 链接的 href 属性映射到将 CRS 属性对象作为输入并返回一个 Promise 的回调函数，该 Promise 解析为将 GeoJSON 坐标转换为 WGS84 地球固定笛卡尔坐标的回调函数。在指定了 type 的情况下，此对象中的项优先于 `crsLinkTypes` 中定义的项。

##### crsLinkTypes

获取一个对象，将 CRS 链接的 type 属性映射到将 CRS 属性对象作为输入并返回一个 Promise 的回调函数，该 Promise 解析为将 GeoJSON 坐标转换为 WGS84 地球固定笛卡尔坐标的回调函数。`crsLinkHrefs` 中的项优先于此对象中定义的项。

##### isDestroyed

获取一个值，指示当前实例是否已被销毁。

##### geojson

获取当前实例的 `GeoJSON` 对象，如果没有则返回 `undefined`。

#### 方法

##### load(url, options)

其中 `options` 的类型说明：

`load(url, options)` 方法用于异步加载提供的 GeoJSON 或 TopoJSON 数据，并替换任何现有数据。其中：

- `url`: 要加载的 GeoJSON 文件路径或 `Resource` 对象。
- `options`: 可选参数对象，包含如下属性：
  - `sourceUri` 可选: 用于解析相对链接的 URL 地址。
  - `markerSize`: 标记的大小，以像素为单位。
  - `markerSymbol`可选: 标记的符号名称。
  - `markerColor`: 标记的颜色。
  - `stroke`: 轮廓线的颜色。
  - `strokeWidth`: 轮廓线的宽度，以像素为单位。
  - `fill`: 填充区域的颜色。
  - `clampToGround`: 是否贴地。
  - `credit`可选: 图层的信用信息。
  - `depthTest`可选: 是否开启深度测试。

该方法返回一个 `Promise` 对象，在 GeoJSON 加载完成时解析为当前实例。

##### addBillboard(item)

添加一个 `BillboardPrimitiveItem` 对象。

- `item`: 要添加的 `BillboardPrimitiveItem` 对象。
- 返回：添加的 `cesium.Billboard` 实例。

##### addLabel(item)

添加一个 `LabelPrimitiveItem` 对象。

- `item`: 要添加的 `LabelPrimitiveItem` 对象。
- 返回：添加的 `cesium.Label` 实例。

##### addPoint(item)

添加一个 `PointPrimitiveItem` 对象。

- `item`: 要添加的 `PointPrimitiveItem` 对象。
- 返回：添加的 `cesium.PointPrimitive` 实例。

##### addCircle(item)

添加一个 `CirclePrimitiveItem` 对象。

- `item`: 要添加的 `CirclePrimitiveItem` 对象。
- 返回：添加的 `GeometryInstance` 实例。

##### addPolygon(item)

添加一个 `PolygonPrimitiveItem` 对象。

- `item`: 要添加的 `PolygonPrimitiveItem` 对象。
- 返回：添加的 `GeometryInstance` 实例。

##### addPolyline(item, addFeature?)

添加一个 `PolylinePrimitiveItem` 对象。

- `item`: 要添加的 `PolylinePrimitiveItem` 对象。
- `addFeature`: 可选参数，是否将该对象添加为 Feature，默认为 `true`。
- 返回：添加的 `GeometryInstance` 实例。

##### addFeatureItem(item)

添加一个 `PrimitiveItem` 对象。

- `item`: 要添加的 `PrimitiveItem` 对象。
- 返回：添加的 `PrimitiveItem` 对象。

##### getFeatureItemById(id)

根据 Id 获取相应的 `PrimitiveItem` 对象。

- `id`: 要查找的 `PrimitiveItem` 对象的 Id。
- 返回：与给定 Id 匹配的 `PrimitiveItem` 对象，如果不存在则返回 `undefined`。

##### removeFeatureItemById(id)

从图层中删除指定 Id 的 `PrimitiveItem` 对象。

- `id`: 要删除的 `PrimitiveItem` 对象的 Id。
- 返回：是否成功删除了 `PrimitiveItem` 对象。

##### preload(geoJson, layerOptions, sourceUri, clear)

异步预加载提供的 GeoJSON 数据。

- `geoJson`: 要加载的 GeoJSON 数据。
- `layerOptions`: 可选参数，包含图层相关的配置项。
- `sourceUri`: 用于解析相对链接的 Url。
- `clear`: 是否清空原有数据。
- 返回：一个 `Promise` 对象，在 GeoJSON 加载完成时解析为当前实例。

##### removeAllPrimitive()

删除所有的 `Primitive` 和 `primitiveItem` 对象。

##### reloadPrimitive()

重新加载所有的 `Primitive` 和 `primitiveItem` 对象。

##### destroy()

销毁当前实例及其内部对象。

- 返回：是否成功销毁了当前实例。

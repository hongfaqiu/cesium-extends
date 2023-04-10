# @cesium-extends/drawer

一个用于在 CesiumJS 中绘制形状的 npm 包。

## 安装

使用 npm 安装：

```bash
npm install @cesium-extends/drawer
```

## 使用

### 导入

```javascript
import Drawer from "@cesium-extends/drawer";
```

### 构造函数

```javascript
const drawer = new Drawer(viewer, options);
```

#### 参数

- `viewer`：一个[Cesium Viewer](https://cesium.com/docs/cesiumjs-ref-doc/Viewer.html)对象。
- `options` (可选)：一个 `Partial<DrawOption>` 对象，具有以下属性：

  - `terrain` (默认: `false`)：一个布尔值，表示是否使用地形。如果启用，则浏览器需要支持地形选择功能。如果不支持该功能，则会禁用它。
  - `operateType`：一个对象，用于指定绘制形状使用的事件类型。默认值为:

    ```javascript
    {
      START: 'LEFT_CLICK',
      MOVING: 'MOUSE_MOVE',
      CANCEL: 'RIGHT_CLICK',
      END: 'LEFT_DOUBLE_CLICK'
    }
    ```

  - `dynamicGraphicsOptions`：一个对象，用于在动态绘制形状时指定默认图形选项。它包含以下属性：
    - `POINT`：一个 `PointGraphics.ConstructorOptions` 对象。
    - `POLYLINE`：一个 `PolylineGraphics.ConstructorOptions` 对象。
    - `POLYGON`：一个 `PolygonGraphics.ConstructorOptions` 对象。
    - `CIRCLE`：一个 `EllipseGraphics.ConstructorOptions` 对象。
    - `RECTANGLE`：一个 `RectangleGraphics.ConstructorOptions` 对象。
  - `action`：一个回调函数，接收鼠标事件。
  - `sameStyle` (默认: `true`)：一个布尔值，表示是否使用同一实例的多个绘制形状应具有相同的样式。
  - `tips`：一个对象，用于在编辑期间显示鼠标提示中的文本。它包含以下属性：
    - `init` (默认: `'Click to draw'`)：在开始新形状时要显示的提示文本。
    - `start` (默认: `'LeftClick to add a point, rightClick remove point, doubleClick end drawing'`)：当绘制形状时要显示的提示文本。
    - `end` (默认: `''`)：完成形状时要显示的提示文本。

### 方法

#### start(config, overrideFunc)

使用指定的配置开始绘制新的形状。

##### 参数

- `config`：一个 `StartOption` 对象，具有以下属性：
  - `type`：一个字符串，指定要绘制的形状类型。有效值为 `'POLYGON'`, `'POLYLINE'`, `'POINT'`, `'CIRCLE'`, 和 `'RECTANGLE'`。
  - `once` (可选)：一个布尔值，表示是否在第一次完成形状后停止绘制。
  - `oneInstance` (可选)：一个布尔值，表示在启动新形状时是否销毁先前形状。
  - `finalOptions` (可选)：一个对象，用于指定已完成形状的图形选项。有关可用选项，请参阅[CesiumJS 文档](https://cesium.com/docs/cesiumjs-ref-doc/PointGraphics.html)。
  - `dynamicOptions` (可选)：一个对象，用于指定正在绘制形状时的图形选项。有关可用选项，请参阅[CesiumJS 文档](https://cesium.com/docs/cesiumjs-ref-doc/PointGraphics.html)。
  - `onPointsChange` (可选)：一个回调函数，每当形状的点发生更改时就会接收一个 Cartesian3 点数组。
  - `onEnd` (可选)：当形状完成时调用的回调函数。它接收完成的实体和形状的 Cartesian3 位置数组。
- `overrideFunc` (可选)：可用于覆盖已完成形状的函数。此函数接受事件类型和实体，并可以返回新的实体或什么都不返回。

#### reset()

重置绘图器的状态。

#### pause()

暂停绘图器。

#### destroy()

销毁绘图器。

## 属性

### status

一个只读属性，返回绘图器的当前状态。可能的值为：

- `'INIT'`：绘图器已初始化但未主动绘制形状。
- `'START'`：绘图器正在主动绘制形状。
- `'PAUSE'`：绘图器已暂停。
- `'DESTROY'`：绘图器已被销毁。

### operateType

一个只读属性，返回一个对象，其中包含用于绘制形状的事件类型。

### isDestroyed

一个只读属性，如果绘图器已被销毁则返回 `true`，否则返回 `false`。

## 许可证

@cesium-extends/drawer 使用 MIT 许可证。有关更多信息，请参见 [LICENSE](https://github.com/cesium-extends/drawer/blob/master/LICENSE)。

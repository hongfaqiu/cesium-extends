# @cesium-extends/compass

一款基于 [@cesium-extends/common](https://www.npmjs.com/package/@cesium-extends/common) 库的[Cesium](https://cesium.com/)指南针插件。

## 安装

```bash
npm install @cesium-extends/compass
```

## 使用方法

`Compass` 小部件可在 Cesium 应用程序中用于显示指南针。要使用该小部件，首先将其导入到您的项目中：

```javascript
import Compass from "@cesium-extends/compass";
```

接下来，创建小部件的一个新实例并将其传递给您的 Cesium Viewer 实例：

```javascript
const viewer = new Cesium.Viewer("cesiumContainer");
const compass = new Compass(viewer);
```

您还可以通过在创建新实例时传递选项对象来自定义小部件：

```javascript
const compass = new Compass(viewer);
```

## API

### `constructor(viewer: Cesium.Viewer, options?: CompassOptions)`

创建一个新的 `Compass` 小部件实例并将其附加到指定的 Cesium Viewer。

#### 参数

- `viewer`: 要将小部件附加到的 Cesium Viewer 实例。
- `options` (可选): 包含小部件的可选参数的对象。

#### `enabled`

控制小部件是否启用的布尔属性。

#### `ready`

指示小部件是否准备就绪的布尔属性。

### `hide()`

隐藏小部件的方法。

### `show()`

显示小部件的方法。

### `destroy(): void`

销毁小部件的内容。

## 选项

在创建 `Compass` 小部件的新实例时可以传递以下选项：

- `container` (可选): 要将小部件挂载到的 DOM 元素。默认为 `viewer.container`。
- `tips` (可选): 包含指南针内部和外部提示字符串的对象。默认为 `{ inner: '', outer: 'Drag outer ring: rotate view.\nDrag inner gyroscope: free orbit.\nDouble-click: reset view.\nTIP: You can also free orbit by holding the CTRL key and dragging the map.' }`。
- `icons`: (可选): 使用的指南针图标 svg，默认 `{ compass_outer: string, compass_inner: string, compass_rotation_marker: string }`

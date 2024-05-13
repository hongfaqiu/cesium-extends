# @cesium-extends/zoom-control

@cesium-extends/zoom-control 是一个用于 Cesium 的缩放控制部件，它是一个 npm 包，可以与 [Cesium](https://cesium.com/) 一起使用。

## 特性

- 缩放、放大和重置缩放功能。

## 安装

通过 npm 安装：

```bash
npm install @cesium-extends/zoom-control
```

## 使用

### 导入模块

```javascript
import ZoomController from "@cesium-extends/zoom-control";
```

### 创建部件实例

```javascript
const viewer = new Cesium.Viewer("cesiumContainer");
const zoomController = new ZoomController(viewer, {
  container: document.getElementById("myContainer"),
  home: new Cesium.Cartesian3.fromDegrees(-98.57, 39.82, 5000000),
  tips: {
    zoomIn: "放大",
    zoomOut: "缩小",
    refresh: "重置缩放",
  },
});
```

`ZoomController` 的构造函数接受两个参数：

- `viewer`：一个表示 Cesium Viewer 实例的必需参数。
- `options`：一个可选对象，包含以下属性：
  - `container`：一个可选属性，表示需要将部件添加到的 HTML 元素。
  - `home`：一个可选属性，表示点击重置缩放按钮时相机应飞回的 Cartesian3 位置。
  - `tips`：一个可选属性，表示包含要显示在按钮工具提示中的文本消息的对象。默认为`{ zoomIn: 'Zoom In', zoomOut: 'Zoom Out', refresh: 'Reset Zoom' }`
  - `icons`: 一个可选属性，表示使用的 svg 部件，默认对象 `{ controller_decrease: string, controller_increase: string, controller_refresh: string }`

### 使用部件方法

创建 `ZoomController` 实例后，可以访问以下方法：

- `show()`：显示部件。
- `hide()`：隐藏部件。
- `destroy()`：销毁部件。

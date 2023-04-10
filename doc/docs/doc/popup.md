---
title: popup
nav: 指南
group: 扩展
order: 6
---

# @cesium-extends/popup

一个轻量级、易于使用的 CesiumJS 弹窗组件。

## 安装

要安装 `@cesium-extends/popup`，请运行以下命令：

```bash
npm install @cesium-extends/popup
```

## 使用

以下是如何使用 `@cesium-extends/popup` 的示例：

```javascript
import Popup from '@cesium-extends/popup';
import { Viewer } from 'cesium';

const viewer = new Viewer('cesiumContainer');

const options = {
  position: [120, 30, 0],
  element: document.getElementById('popup'),
  offset: [10, 10],
};

const popup = new Popup(viewer, options);

// 更新弹窗的位置
popup.position = [121, 31, 0];

// 销毁弹窗
popup.destroy();
```

## 示例

下面的示例中添加了一个[120, 30]经纬度处的 popup, 其中是一个时间不断变幻的 react popup 组件

<code src="@/components/Map/popup.tsx"></code>

### PopupOptions

`PopupOptions` 接口具有以下属性：

- `position`：弹窗的位置，以 `[经度，纬度，高度]` 数组的形式指定。如果为 `null`，则弹窗将被隐藏。
- `element`：表示弹窗的 HTML 元素。
- `offset`（可选）：一个由 `[xOffset，yOffset]` 组成的数组，用于指定弹窗相对于其位置的偏移量。

### 属性

- `position`：获取或设置弹窗的位置。
- `destroyed`：指示是否已销毁弹窗。

### 方法

- `switchElementShow(val: boolean)`：显示或隐藏弹窗。
- `setPosition()`：更新弹窗的位置。
- `destroy()`：销毁弹窗，移除任何事件监听器并清理资源。

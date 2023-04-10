---
title: common
nav: 指南
group: 扩展
order: 4
---

# @cesium-extends/common

- `Widget` 是一个基类，你需要拓展它来创建自己的小部件。你可以将它导入到你的项目中：
- `DomUtil` 是一个提供一些 DOM 操作方法的实用工具类。

## 安装

```bash
npm install --save @cesium-extends/common
```

## 使用

```javascript
import { Widget, DomUtil } from '@cesium-extends/common';
```

## Widget

`Widget` 是基于 `Cesium` 应用程序的小部件的基类，它提供了一些常用的小部件操作方法和属性。

### API

#### `constructor(viewer: Cesium.Viewer, wrapper: HTMLElement)`

创建一个新的 `Widget` 实例并将其附加到指定的 Cesium Viewer 上。

##### 参数

- `viewer`：要附加小部件的 Cesium Viewer 实例。
- `wrapper`：要将小部件挂载到的 DOM 元素。

#### `enabled`

控制小部件是否启用的布尔值属性。

#### `ready`

小部件是否准备好的布尔值属性。

#### `setContent(content: string | Element): Widget`

为小部件设置内容的方法。

##### 参数

- `content`：要设置的内容字符串或 DOM 元素。

#### `hide()`

隐藏小部件的方法。

#### `show()`

显示小部件的方法。

#### `destroy()`

销毁小部件的方法。

## DomUtil

`DomUtil` 是一个提供一些 DOM 操作方法的实用工具类。

### API

#### `create(tagName: string, className: string, container: Element | null = null): HTMLElement`

创建带有 `tagName` 的 HTML 元素，将其类设置为 `className`，并可选择将其追加到 `container` 元素中。

##### 参数

- `tagName`：要创建的 HTML 元素的标记名称。
- `className`：要设置的 HTML 元素的类名。
- `container`（可选）：要追加新元素的容器元素。

#### `parseDom(domStr: string, className: string): HTMLDivElement`

将字符串解析为 DOM 元素并返回包含该元素的 DIV 元素。

##### 参数

- `domStr`：要解析的字符串。
- `className`：要设置的 DIV 元素的类名。

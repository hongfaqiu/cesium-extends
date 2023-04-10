---
title: tooltip
nav: 指南
group: 扩展
order: 5
---

# @cesium-extends/tooltip

`@cesium-extends/tooltip` 是一个基于 [Cesium](https://cesium.com/) 对象实现的 tooltip 组件，支持自定义内容。包含两个类：`Tooltip` 和 `MouseTooltip`。

`MouseTooltip` 会创建一个跟随鼠标移动的 tooltip.

## 安装

```bash
npm install @cesium-extends/tooltip
```

## 使用

### Tooltip

用法示例：

```javascript
import { Cartesian2, Viewer } from 'cesium';
import { Tooltip } from '@cesium-extends/tooltip';

const viewer = new Viewer('cesiumContainer');
const tooltip = new Tooltip(viewer, {
  offset: [10, -10],
  content: 'Hello, World!',
});

tooltip.content = 'Philadelphia';

// 显示（添加content后默认显示）
tooltip.show();
// 隐藏
tooltip.hide();

// 销毁 Tooltip
tooltip.destroy();
```

## 示例

下面的示例中添加了一个跟随鼠标移动的 tooltip

<code src="@/components/Map/mouseTooltip.tsx"></code>

#### Options

`Tooltip` 类接受以下 options：

| 名称    | 类型                  | 默认值   | 描述                                   |
| ------- | --------------------- | -------- | -------------------------------------- |
| offset  | Tuple `[x, y]`        | `[0, 0]` | Tooltip 相对于鼠标或实体的位置偏移量   |
| content | `string` 或 `Element` | `''`     | Tooltip 的内容，可以是文本或 HTML 元素 |

#### 方法

#### `enabled`

控制小部件是否启用的布尔值属性。

#### `ready`

小部件是否准备好的布尔值属性。

#### `content`

获取或更改 tooltip 的内容

##### showAt(windowPosition: Cartesian2, content: string | Element): Tooltip

显示 Tooltip。接受两个参数：

- `windowPosition`：`Cartesian2` 类型，tooltip 在屏幕上的位置
- `content`：`string` 或 `Element` 类型，tooltip 的内容

返回值为 `Tooltip` 实例。

##### show(): void

显示 Tooltip。

##### hide(): void

隐藏 Tooltip。

##### destroy(): void

销毁 Tooltip。

### MouseTooltip

用法示例：

```javascript
import { Viewer } from 'cesium';
import { MouseTooltip } from '@cesium-extends/tooltip';

const viewer = new Viewer('cesiumContainer');
const mouseTooltip = new MouseTooltip(viewer, {
  offset: [10, -10],
});

mouseTooltip.content = 'Philadelphia';

// 显示（添加content后默认显示）
mouseTooltip.show();
// 隐藏
mouseTooltip.hide();

// 销毁 MouseTooltip
mouseTooltip.destroy();
```

#### Options

`MouseTooltip` 类继承自 `Tooltip`，接受相同的 options。

#### API

#### `enabled`

控制小部件是否启用的布尔值属性。

#### `ready`

小部件是否准备好的布尔值属性。

#### `content`

获取或更改 tooltip 的内容

##### show(): void

显示 MouseTooltip。

##### hide(): void

隐藏 MouseTooltip。

##### destroy(): void

销毁 MouseTooltip。

---
title: sync-viewer
nav: 指南
group: 扩展
order: 11
---

# @cesium-extends/sync-viewer

`@cesium-extends/sync-viewer` 是一个用于同步两个 Cesium Viewer 视图的 npm 包。

## 安装

```bash
npm install @cesium-extends/sync-viewer
```

## 使用

```js
import { Viewer } from 'cesium';
import SyncViewer from '@cesium-extends/sync-viewer';

const leftViewer = new Viewer('left-container');
const rightViewer = new Viewer('right-container');

const syncViewer = new SyncViewer(leftViewer, rightViewer);

// 销毁
syncViewer.destroy();
```

## 示例

下面的示例演示了两个同步的视图，可以切换二三维查看同步效果

<code src="@/components/Map/sync-viewer.tsx"></code>

### `SyncViewProps`

| 属性名            | 类型     | 描述                                              |
| ----------------- | -------- | ------------------------------------------------- |
| percentageChanged | `number` | 相机 zoom 改变时距离改变的百分比，默认为 `0.01`。 |

### `SyncViewer`

#### 构造函数

```ts
constructor(leftViewer: Viewer, rightViewer: Viewer, options?: SyncViewProps)
```

- `leftViewer`: 左侧 Viewer 实例。
- `rightViewer`: 右侧 Viewer 实例。
- `options` (可选): 配置项，包括：
  - `percentageChanged`: 相机 zoom 改变时距离改变的百分比，默认为 `0.01`。

#### 方法

##### `start()`

开始同步左右 Viewer 视图。

```ts
start(): void
```

##### `destroy()`

销毁实例，并解除视图同步。

```ts
destroy(): void
```

#### 属性

##### `synchronous`

获取或设置是否进行视图同步。

```ts
synchronous: boolean;
```

##### `isDestory`

获取实例是否已销毁。

```ts
get isDestory(): boolean
```

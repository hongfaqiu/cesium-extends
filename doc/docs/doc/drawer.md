---
title: drawer
nav: 指南
group: 扩展
order: 9
---

# @cesium-extends/drawer

一个基于 Cesium 的绘制工具库，支持勾画点、线、多边形、圆等常用图形。

## 安装

使用 npm 安装：

```bash
npm install @cesium-extends/drawer --save
```

## 使用方法

```javascript
import Drawer from '@cesium-extends/drawer';
import Cesium from 'cesium';

// 初始化Viewer
const viewer = new Cesium.Viewer('cesiumContainer');

// 创建Drawer实例
const drawer = new Drawer(viewer);

// 开始绘制
drawer.start({
  type: 'POLYGON',
  finalOptions: {
    material: Cesium.Color.RED.withAlpha(0.5),
  },
});
```

## 示例

你可以通过下面的示例体验点线面多边形的绘制

<code src="@/components/Map/drawer/index.tsx"></code>

### DrawOption

以下是 `options` 可配置选项:

| 属性                     | 类型                                                                                                                                                                                                                                  | 默认值                                                                                                                    | 描述                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `terrain`                | `boolean`                                                                                                                                                                                                                             | `false`                                                                                                                   | 是否开启地形模式，需要浏览器支持地形选取功能     |
| `model`                  | `boolean`                                                                                                                                                                                                                             | `false`                                                                                                                   | 是否开启在模型上选点模式                         |
| `operateType`            | `{START?: EventType, MOVING?: EventType, CANCEL?: EventType, END?: EventType}`                                                                                                                                                        | `{ START: LEFT_CLICK, MOVING: MOUSE_MOVE, CANCEL: RIGHT_CLICK, END: LEFT_DOUBLE_CLICK }`                                  | 操作类型                                         |
| `dynamicGraphicsOptions` | `{POINT: PointGraphics.ConstructorOptions; POLYLINE: PolylineGraphics.ConstructorOptions; POLYGON: PolygonGraphics.ConstructorOptions; CIRCLE: EllipseGraphics.ConstructorOptions; RECTANGLE: RectangleGraphics.ConstructorOptions;}` | -                                                                                                                         | 动态勾画没有确定图形时的图形配置                 |
| `action`                 | `(action: EventType, move: EventArgs) => void`                                                                                                                                                                                        | -                                                                                                                         | 鼠标事件回调                                     |
| `sameStyle`              | `boolean`                                                                                                                                                                                                                             | `true`                                                                                                                    | 是否使用相同的样式，当绘制多个图形时样式是否相同 |
| `tips`                   | `{init?: string or Element, start?: string or Element, end?: string or Element}`                                                                                                                                                      | `{ init: 'Click to draw', start: 'LeftClick to add a point, rightClick remove point, doubleClick end drawing', end: '' }` | 自定义编辑时鼠标移动的提示                       |

### StartOption

以下是 `config` 可配置选项:

| 属性             | 类型                                                        | 默认值      | 描述                             |
| ---------------- | ----------------------------------------------------------- | ----------- | -------------------------------- |
| `type`           | `'POLYGON' / 'POLYLINE' / 'POINT' / 'CIRCLE' / 'RECTANGLE'` | -           | 勾画类型                         |
| `once`           | `boolean`                                                   | `undefined` | 是否只勾画一次                   |
| `oneInstance`    | `boolean`                                                   | `false`     | 是否使用单例模式                 |
| `finalOptions`   | `object`                                                    | `{}`        | 勾画的 Entity 选项               |
| `dynamicOptions` | `object`                                                    | `{}`        | 动态勾画没有确定图形时的图形配置 |
| `onPointsChange` | `(points: Cartesian3[]) => void`                            | -           | 点改变的回调函数                 |
| `onEnd`          | `(entity: Entity, positions: Cartesian3[]) => void`         | -           | 结束绘制的回调函数               |

## 实例方法

| 方法名                                                          | 描述             |
| --------------------------------------------------------------- | ---------------- |
| `start(config: StartOption, overrideFunc?: OverrideEntityFunc)` | 开始绘制         |
| `reset()`                                                       | 重置状态         |
| `pause()`                                                       | 暂停绘制         |
| `destroy()`                                                     | 销毁 Drawer 实例 |

## 类型定义

### DrawOption

```typescript
type DrawOption = {
  terrain: boolean;
  model: boolean;
  operateType: OperationType;
  dynamicGraphicsOptions: {
    POINT: PointGraphics.ConstructorOptions;
    POLYLINE: PolylineGraphics.ConstructorOptions;
    POLYGON: PolygonGraphics.ConstructorOptions;
    CIRCLE: EllipseGraphics.ConstructorOptions;
    RECTANGLE: RectangleGraphics.ConstructorOptions;
  };
  action?: ActionCallback;
  sameStyle: boolean;
  tips: {
    init?: string | Element;
    start?: string | Element;
    end?: string | Element;
  };
};
```

### StartOption

```typescript
type StartOption = {
  type: 'POLYGON' | 'POLYLINE' | 'POINT' | 'CIRCLE' | 'RECTANGLE';
  once?: boolean;
  oneInstance?: boolean;
  finalOptions?: object;
  dynamicOptions?: object;
  onPointsChange?: BasicGraphicesOptions['onPointsChange'];
  onEnd?: (entity: Entity, positions: Cartesian3[]) => void;
};
```

### Status

```typescript
type Status = 'INIT' | 'START' | 'PAUSE' | 'DESTROY';
```

### OperationType

```typescript
type OperationType = {
  START?: EventType;
  MOVING?: EventType;
  CANCEL?: EventType;
  END?: EventType;
};
```

### OverrideEntityFunc

```typescript
type OverrideEntityFunc = (
  this: Drawer,
  action: EventType,
  entity: Entity,
) => Entity | void;
```

### ActionCallback

```typescript
type ActionCallback = (action: EventType, move: EventArgs) => void;
```

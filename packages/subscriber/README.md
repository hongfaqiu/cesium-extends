# @cesium-extends/subscriber

该包提供了一种方便的方式，用于在 Cesium 场景中订阅事件。它允许您为指定的实体添加事件监听器，并在发生事件时触发回调函数。

## 安装

使用 npm 进行安装：

```
npm install @cesium-extends/subscriber
```

## 用法

```javascript
import Subscriber, { EventType } from "@cesium-extends/subscriber";
import { viewer, entities } from "./cesiumInit";

// 创建订阅者
const subscriber = new Subscriber(viewer);

// 添加事件监听器
subscriber.add(
  entities[0],
  (movement, entity) => {
    console.log(movement);
    console.log(entity);
  },
  EventType.LEFT_CLICK
);

// 添加特定事件监听器
subscriber.addExternal((movement, result) => {
  console.log(movement);
  console.log(result);
}, EventType.MOUSE_MOVE);

// 暂停执行监听回调
subscriber.enable = false;

// 销毁订阅者
subscriber.destroy();
```

## API

### `new Subscriber(viewer: Viewer, options?: Options)`

创建一个新的 Subscriber 对象。

| 参数    | 类型   | 描述                                                                                                                                                                     |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| viewer  | Viewer | Cesium.Viewer 对象                                                                                                                                                       |
| options | object | （可选）配置项，包括： <br> • element: 用于注册事件的 HTML 元素，默认为 Cesium.Viewer canvas。 <br> • pickResult: 是否启用拾取结果以及移动去抖时间（毫秒），默认不启用。 |

### `add(substances: Entity | Entity[], callback: ListenCallback<Entity>, eventType: EventType): void`

为给定 Substance 添加指定事件类型的监听器。

| 参数       | 类型                   | 描述                                                 |
| ---------- | ---------------------- | ---------------------------------------------------- |
| substances | Entity or Entity[]     | 要添加监听器的 Substance，可以是单个实体或实体数组。 |
| callback   | ListenCallback<Entity> | 当事件发生时要调用的回调函数。                       |
| eventType  | EventType              | 所需事件类型。                                       |

### `addExternal(callback: ExternalListenCallback, eventType: EventType): string`

添加指定事件类型的外部监听器。与`add`不同之处在于此事件将不会过滤实体。

| 参数      | 类型                   | 描述                        |
| --------- | ---------------------- | --------------------------- |
| callback  | ExternalListenCallback | 要处理所需事件的回调函数。  |
| eventType | EventType              | 所需事件类型。              |
| 返回值    | string                 | 事件 ID，在移除事件时使用。 |

### `remove(substances: Entity | Entity[], eventType: EventType): void`

从给定的 substance 中删除指定类型的事件监听器。

| 参数       | 类型               | 描述                                                       |
| ---------- | ------------------ | ---------------------------------------------------------- |
| substances | Entity or Entity[] | 要从其中删除侦听器的 Substance，可以是单个实体或实体数组。 |
| eventType  | EventType          | 所需事件类型。                                             |

### `removeExternal(ids: string | string[], eventType?: EventType): void`

删除指定 ID 的外部事件监听器。

| 参数      | 类型               | 描述                                                             |
| --------- | ------------------ | ---------------------------------------------------------------- |
| ids       | string or string[] | 需要删除的事件 ID，可以是字符串或字符串数组。                    |
| eventType | EventType          | （可选）事件类型（如果未提供，将搜索该 id 并自动确定事件类型）。 |

### `removeNative(viewer: Viewer, eventType: EventType): void`

从 Viewer 中删除指定类型的原生事件监听器。

| 参数      | 类型      | 描述                 |
| --------- | --------- | -------------------- |
| viewer    | Viewer    | Cesium.Viewer 对象。 |
| eventType | EventType | 原生事件类型。       |

### `destroy(): void`

销毁 Subscriber 对象。

## 类型

### `EventType`

监听器支持的事件类型，包括：

- `'LEFT_DOWN'`
- `'LEFT_UP'`
- `'LEFT_CLICK'`
- `'LEFT_DOUBLE_CLICK'`
- `'RIGHT_DOWN'`
- `'RIGHT_UP'`
- `'RIGHT_CLICK'`
- `'MIDDLE_DOWN'`
- `'MIDDLE_UP'`
- `'MIDDLE_CLICK'`
- `'MOUSE_MOVE'`
- `'WHEEL'`
- `'PINCH_START'`
- `'PINCH_MOVE'`
- `'PINCH_END'`

### `ListenCallback<T>`

与事件相关联的回调函数类型。

| 参数      | 类型      | 描述                           |
| --------- | --------- | ------------------------------ |
| movement  | EventArgs | 包含事件位置和其他属性的对象。 |
| substance | T         | 与事件关联的实体。             |

### `ExternalListenCallback`

外部事件的回调函数类型。

| 参数     | 类型      | 描述                                                             |
| -------- | --------- | ---------------------------------------------------------------- |
| movement | EventArgs | 包含事件位置和其他属性的对象。                                   |
| result   | any       | 当启用拾取结果时，它将包含所选实体的详细信息，否则为 undefined。 |

### `EventArgs`

事件处理程序传递给回调函数的事件参数对象类型。

| 属性           | 类型       | 描述                                   |
| -------------- | ---------- | -------------------------------------- |
| position       | Cartesian2 | 鼠标位置（以像素为单位）。             |
| endPosition    | Cartesian2 | 鼠标位置的结束位置（当鼠标移动时）。   |
| startPosition  | Cartesian2 | 鼠标位置的起始位置（当鼠标移动时）。   |
| [name: string] | any        | 可以包含其他自定义属性的任何其他属性。 |

### `Cartesian2`

二维笛卡尔坐标系中的点，由 x 和 y 轴坐标组成。

### `Entity`

表示 Cesium 场景中的一个对象或元素。

### `Viewer`

Cesium 场景的主要控制器，负责管理场景中的所有元素并接收用户输入。

## 参考资料

- [Cesium](https://cesium.com/)
- [Cesium Documentation](https://cesium.com/docs/)

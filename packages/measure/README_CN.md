# @cesium-extends/measure

@cesium-extends/measure 是一个基于 Cesium 实现的测量工具，支持距离和面积测量，使用简单方便。

## 安装

通过 npm 安装：

```bash
npm install @cesium-extends/measure --save
```

## 使用

在项目中引入`@cesium-extends/measure`模块，然后实例化对应的测量类即可进行测量。

### AreaMeasure

用于不贴地的面积测量。

```typescript
import { Viewer } from "cesium";
import { AreaMeasure } from "@cesium-extends/measure";

const viewer = new Viewer("cesiumContainer");
const areaMeasure = new AreaMeasure(viewer, {
  units: 'kilometers', // 默认为kilometers
  locale: {
    start: '起点',
    area: '面积',
    total: '总计',
    formatLength: (length, unitedLength) => {
      if (length < 1000) {
        return length + '米';
      }
      return unitedLength + '千米';
    },
    formatArea: (area, unitedArea) => {
      if (area < 1000000) {
        return area + '平方米';
      }
      return unitedArea + '平方千米';
    }
  },
  drawerOptions: {
    tips: {
      init: '点击绘制',
      start: '左键添加点，右键移除点，双击结束绘制',
    }
  }
  onEnd: (entity) => {
    console.log(entity); // 测量完成回调函数，返回测量结果
  },
});

// 开始绘制
areaMeasure.start();
```

### AreaSurfaceMeasure

用于贴地的面积测量。

```typescript
import { Viewer } from "cesium";
import { AreaSurfaceMeasure } from "@cesium-extends/measure";

const viewer = new Viewer("cesiumContainer");
const areaSurfaceMeasure = new AreaSurfaceMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // 测量完成回调函数，返回测量结果
  },
});

// 开始绘制
areaSurfaceMeasure.start();
```

### DistanceMeasure

用于不贴地的距离测量。

```typescript
import { Viewer } from "cesium";
import { DistanceMeasure } from "@cesium-extends/measure";

const viewer = new Viewer("cesiumContainer");
const distanceMeasure = new DistanceMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // 测量完成回调函数，返回测量结果
  },
});

// 开始绘制
distanceMeasure.start();
```

### DistanceSurfaceMeasure

用于贴地的距离测量。

```typescript
import { Viewer } from "cesium";
import { DistanceSurfaceMeasure } from "@cesium-extends/measure";

const viewer = new Viewer("cesiumContainer");
const distanceSurfaceMeasure = new DistanceSurfaceMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // 测量完成回调函数，返回测量结果
  },
});

// 开始绘制
distanceSurfaceMeasure.start();
```

## API

### MeasureOptions

| 参数          | 类型     | 描述                     |
| ------------- | -------- | ------------------------ |
| labelStyle    | object   | 标签样式                 |
| units         | string   | 测量单位，默认为'meters' |
| locale        | string   | 国际化内容               |
| onEnd         | function | 测量完成回调函数         |
| drawerOptions | object   | 绘制工具### Measure      |

测量基类，其他测量类继承自该类。

#### 构造函数

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

创建一个测量工具实例。

参数：

- `viewer`：Cesium.Viewer 对象。
- `options`（可选）：配置项，类型为`MeasureOptions`。

#### 属性

##### `destroyed: boolean`

返回当前测量工具是否已销毁。

##### `mouseTooltip: MouseTooltip`

鼠标提示工具实例。

##### `drawer: Drawer`

绘制工具实例。

#### 方法

##### `start(): void`

开始测量操作。

##### `end(): void`

结束测量操作，并清除测量结果。

##### `destroy(): void`

销毁测量工具。

### AreaMeasure

用于不贴地的面积测量。

#### 构造函数

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

创建一个 AreaMeasure 实例。

参数：

- `viewer`：Cesium.Viewer 对象。
- `options`（可选）：配置项，类型为`MeasureOptions`。

#### 方法

##### `getArea(positions: Cartesian3[]): number`

计算多边形面积。

参数：

- `positions`：由点位构成的数组，每个点位为 Cartesian3 类型。

返回值：面积，单位由配置项指定，默认为米。

### AreaSurfaceMeasure

用于贴地的面积测量。

#### 构造函数

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

创建一个 AreaSurfaceMeasure 实例。

参数：

- `viewer`：Cesium.Viewer 对象。
- `options`（可选）：配置项，类型为`MeasureOptions`。

#### 方法

##### `getArea(positions: Cartesian3[]): number`

计算贴地的多边形面积。

参数：

- `positions`：由点位构成的数组，每个点位为 Cartesian3 类型。

返回值：面积，单位由配置项指定，默认为米。

### DistanceMeasure

用于不贴地的距离测量。

#### 构造函数

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

创建一个 DistanceMeasure 实例。

参数：

- `viewer`：Cesium.Viewer 对象。
- `options`（可选）：配置项，类型为`MeasureOptions`。

#### 方法

##### `getDistance(start: Cartesian3, end: Cartesian3): number`

计算两点之间的距离。

参数：

- `start`：起点坐标，Cartesian3 类型。
- `end`：终点坐标，Cartesian3 类型。

返回值：两点之间的距离，单位由配置项指定，默认为米。

### DistanceSurfaceMeasure

用于贴地的距离测量。

#### 构造函数

##### `constructor(viewer: Viewer, options?: MeasureOptions & {splitNum?: number})`

创建一个 DistanceSurfaceMeasure 实例。

参数：

- `viewer`：Cesium.Viewer 对象。
- `options`（可选）：配置项，类型为`MeasureOptions`，另外支持一个额外的`splitNum`参数，表示将线段分割成多少段进行计算表面距离，不传该参数时默认为 10。

#### 方法

##### `getDistance(pos1: Cartesian3, pos2: Cartesian3): number`

计算两点之间的贴地距离。

参数：

- `pos1`：起点坐标，Cartesian3 类型。
- `pos2`：终点坐标，Cartesian3 类型。

返回值：两点之间的距离，单位由配置项指定，默认为米。

## 注意事项

- 本工具基于 Cesium 实现，需要在项目中引入 Cesium 库。
- 使用前请确保了解 Cesium 的基础知识，如何创建 Viewer 等。
- 应当在使用测量工具前先停止其他可能影响交互的操作，例如相机漫游、场景旋转等。
- 在使用过程中请注意浏览器的性能，过多的绘制可能会导致浏览器崩溃或卡顿。
- 当前版本仅支持测量距离和面积，如果需要实现其他功能可自行扩展。
- 工具代码已开源，如有需要可以参考其源码进行二次开发。

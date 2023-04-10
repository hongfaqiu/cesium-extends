import type Cesium from 'cesium';
import type {
  Cartesian3,
  EllipseGraphics,
  Entity,
  PointGraphics,
  PolygonGraphics,
  PolylineGraphics,
} from 'cesium';
import type { EventType } from '../../subscriber/dist';
import type { BasicGraphicesOptions } from './base';

export { EventArgs } from '../../subscriber/dist';

export type hierarchyHandler = (
  hierarchy: Cesium.Cartesian3[] | Cesium.CallbackProperty | Cartesian3,
) => Cesium.Entity.ConstructorOptions;

export type OverrideEntityFunc = (this: Drawer, action: EventType, entity: Entity) => Entity | void;

/**
 * @todo 为了防止产生侵入性bug，请在配置前确认相关事件是否可用，不再默认移除原生事件
 */
export type OperationType = {
  /**
   * @desc 勾画开始事件
   * @type EventType
   * @default LEFT_CLICK
   */
  START?: EventType;
  /**
   * @desc 勾画移动事件
   * @type EventType
   * @default MOUSE_MOVE
   */
  MOVING?: EventType;
  /**
   * @desc 勾画撤销事件
   * @type EventType
   * @default RIGHT_CLICK
   */
  CANCEL?: EventType;
  /**
   * @desc 勾画结束事件
   * @type EventType
   * @default LEFT_DOUBLE_CLICK
   */
  END?: EventType;
};

export type DrawerCallback = (entity: Entity) => void;

/**
 * @desc 操作回调
 * @param action 事件名
 * @param move 事件参数
 */
export type ActionCallback = (action: EventType, move: EventArgs) => void;

/**
 * 绘制状态
 */
export type Status = 'INIT' | 'START' | 'PAUSE' | 'DESTROY';

export interface DrawOption {
  /**
   * @desc 是否使用地形，当开启时需要浏览器支持地形选取功能，如果不支持将会被关闭
   */
  terrain: boolean;

  /**
   * @desc  操作方式
   */
  operateType: OperationType;

  dynamicGraphicsOptions: {
    POINT: PointGraphics.ConstructorOptions;
    POLYLINE: PolylineGraphics.ConstructorOptions;
    POLYGON: PolygonGraphics.ConstructorOptions;
    CIRCLE: EllipseGraphics.ConstructorOptions;
    RECTANGLE: RectangleGraphics.ConstructorOptions;
  };
  /**
   * 鼠标事件回调
   */
  action?: ActionCallback;
  sameStyle: boolean;
  
  /** 自定义编辑时鼠标移动的提示 */
  tips: {
    /** 默认为 'Click to draw' */
    init?: string | Element;
    /** 默认为 'LeftClick to add a point, rightClick remove point, doubleClick end drawing' */
    start?: string | Element;
    /** 默认为 '' */
    end?: string | Element;
  };
}

export type StartOption = {
  /**
   * @desc 勾画类型 目前支持 Polygon、Line、Point、Circle、Rectangle
   */
  type: 'POLYGON' | 'POLYLINE' | 'POINT' | 'CIRCLE' | 'RECTANGLE';

  /**
   * 是否只勾画一次，如果设为true，则在第一勾画结束时停止
   * @default undefined
   */
  once?: boolean;
  /**
   * @desc 是否使用单例模式，如果开启，当勾画第二个图形时会销毁第一个图形
   */
  oneInstance?: boolean;

  /**
   * @desc 勾画的Entity选项，如Point对应#PointGraphics.ConstructorOptions
   */
  finalOptions?: object;

  /**
   * @desc 动态勾画没有确定图形时的图形配置，类型与options选项相同
   */
  dynamicOptions?: object;
  /**
   * 点改变的回调
   */
  onPointsChange?: BasicGraphicesOptions['onPointsChange'];
  /** 结束绘制的回调 */
  onEnd?: (entity: Entity, positions: Cartesian3[]) => void;
};

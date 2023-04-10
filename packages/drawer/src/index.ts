import { Color, defaultValue, Entity, JulianDate } from 'cesium';
import { MouseTooltip } from '@cesium-extends/tooltip';

import Subscriber from '@cesium-extends/subscriber';
import Painter from './painter';
import Circle from './shape/circle';
import Line from './shape/line';
import Point from './shape/point';
import Polygon from './shape/polygon';
import Rectangle from './shape/rectangle';

import type { Viewer } from 'cesium';
import type { EventArgs, EventType } from '@cesium-extends/subscriber';
import type { BasicGraphicesOptions } from './base';
import type {
  ActionCallback,
  DrawOption,
  OverrideEntityFunc,
  StartOption,
  Status,
} from './typings';

export * from './typings';

export const defaultOptions: DrawOption = {
  terrain: false,
  operateType: {
    START: 'LEFT_CLICK',
    MOVING: 'MOUSE_MOVE',
    CANCEL: 'RIGHT_CLICK',
    END: 'LEFT_DOUBLE_CLICK',
  },

  /**
   * 图形勾画时的Entity样式
   */
  dynamicGraphicsOptions: {
    POLYLINE: {
      clampToGround: true,
      width: 2,
      material: Color.YELLOW,
    },
    POLYGON: {
      outlineColor: Color.YELLOW,
      outlineWidth: 2,
      material: Color.DARKTURQUOISE.withAlpha(0.5),
    },
    POINT: {
      color: Color.BLUE,
      pixelSize: 8,
      outlineColor: Color.WHITE,
      outlineWidth: 1,
    },
    RECTANGLE: {
      material: Color.YELLOW.withAlpha(0.5),
    },
    CIRCLE: {
      material: Color.YELLOW.withAlpha(0.5),
      outline: true,
    },
  },
  sameStyle: true,
  tips: {
    init: 'Click to draw',
    start: 'LeftClick to add a point, rightClick remove point, doubleClick end drawing',
    end: '',
  },
};

export default class Drawer {
  private _viewer: Viewer;
  private _type!: StartOption['type'];
  private _terrain: boolean;
  private _subscriber: Subscriber;

  private _status: Status;

  private _painter!: Painter;

  private _events: string[] = [];

  private _typeClass!: Line | Polygon | Point | Rectangle | Circle;

  private _option: DrawOption;

  private $Instance!: Entity | void;
  private $AddedInstance: Entity[] = [];

  private _dropPoint!: (move: EventArgs) => void;
  private _moving!: (move: EventArgs) => void;
  private _cancel!: (move: EventArgs) => void;
  private _playOff!: (move: EventArgs) => Entity;

  /**
   * @desc 操作方式
   */
  private _operateType: {
    START: EventType;
    MOVING: EventType;
    CANCEL: EventType;
    END: EventType;
  };

  private _oneInstance!: boolean;

  private _once!: boolean;

  /**
   * @desc 动作回调
   */
  private _action: ActionCallback | undefined;

  private _sameStyle!: boolean;
  mouseTooltip: MouseTooltip;
  private _tips: Required<DrawOption['tips']>;

  get status(): Status {
    return this._status;
  }

  get operateType() {
    return this._operateType;
  }

  get isDestroyed(): boolean {
    return this._status === 'DESTROY';
  }

  constructor(viewer: Viewer, options?: Partial<DrawOption>) {
    this._option = defaultValue(options, {});

    if (!viewer) throw new Error('请输入Viewer对象！');

    // 设置操作方式
    this._operateType = defaultValue(this._option.operateType, {});

    this._operateType = Object.assign(defaultOptions.operateType, this._operateType);

    this._viewer = viewer;
    this._terrain = defaultValue(this._option.terrain, defaultOptions.terrain);

    this._action = this._option.action;

    this._tips = {
      ...defaultOptions.tips,
      ...options?.tips,
    } as Required<DrawOption['tips']>;

    if (this._terrain && !this._viewer.scene.pickPositionSupported) {
      console.warn('浏览器不支持 pickPosition属性，无法在有地形的情况下正确选点');
      this._terrain = false;
    }

    this._subscriber = new Subscriber(this._viewer);

    this.mouseTooltip = new MouseTooltip(viewer);
    this.mouseTooltip.enabled = false;

    this._status = 'INIT';
    // 为了防止产生侵入性bug，请在使用前确认相关事件是否可用，不再默认移除原生事件
    // Object.keys(this._option.keyboard).forEach(key =>
    //   Subscriber.removeNative(this._viewer, this._option.keyboard[key])
    // )
  }

  /**
   * @param finalOptions
   * @param dynamicOptions
   */
  private _initPainter(options: BasicGraphicesOptions): void {
    const painterOptions = { viewer: this._viewer, terrain: this._terrain };

    this._painter = new Painter(painterOptions);

    if (this._type === 'POLYGON') {
      this._typeClass = new Polygon(this._painter, options);
    } else if (this._type === 'POLYLINE') {
      this._typeClass = new Line(this._painter, options);
    } else if (this._type === 'POINT') {
      this._typeClass = new Point(this._painter, options);
    } else if (this._type === 'CIRCLE') {
      this._typeClass = new Circle(this._painter, options);
    } else if (this._type === 'RECTANGLE') {
      this._typeClass = new Rectangle(this._painter, options);
    }

    this._dropPoint = this._typeClass.dropPoint.bind(this._typeClass);
    this._moving = this._typeClass.moving.bind(this._typeClass);
    this._cancel = this._typeClass.cancel.bind(this._typeClass);
    this._playOff = this._typeClass.playOff.bind(this._typeClass);
  }

  private _updateTips() {
    if (!this._painter) return;
    if (this._status === 'INIT' || this._status === 'DESTROY') {
      this.mouseTooltip.enabled = false;
      return;
    }
    if (this._status === 'PAUSE') {
      this.mouseTooltip.content = this._tips.end;
      if (this._once === true) this.mouseTooltip.enabled = false;
      return;
    }
    if (this._painter._breakPointEntities.length === 0) {
      this.mouseTooltip.content = this._tips.init;
    } else {
      this.mouseTooltip.content = this._tips.start;
    }
  }

  /**
   * @desc 绘制函数,
   * @param config 绘制配置，可以通过定义options直接改写结果而不再填第二个参数
   * @param overrideFunc Entity 重写函数，用于重写绘制结果，如果 overrideFunc返回一个Entity,则将该Entity添加到Viewer中，否则结束函数无操作
   * @returns
   */
  start(
    config: StartOption,
    overrideFunc: OverrideEntityFunc = (action: EventType, entity: Entity) => entity,
  ): void {
    // eslint-disable-next-line no-param-reassign
    config = defaultValue(config, {});
    this._once = defaultValue(config.once, true);
    this._oneInstance = defaultValue(config.oneInstance, false);

    if (!this._isSupport(config.type)) {
      throw new Error(`the type '${config.type}' is not support`);
    }

    this._type = config.type;
    const defaultOpts = defaultOptions.dynamicGraphicsOptions[this._type];

    this._initPainter({
      finalOptions: {
        ...defaultOpts,
        ...config.finalOptions,
      },
      dynamicOptions: {
        ...defaultOpts,
        ...config.dynamicOptions,
      },
      sameStyle: this._sameStyle,
      onEnd: config.onEnd,
      onPointsChange: config.onPointsChange,
    });

    if (this._status === 'START') return;

    this._status = 'START';
    this._viewer.canvas.style.cursor = 'crosshair';
    this._updateTips();

    /**
     * @desc 是否开始绘制
     */
    let isStartDraw = false;

    // 开始事件
    const startId = this._subscriber.addExternal((move) => {
      isStartDraw = true;

      this._dropPoint(move);
      if (this._action) this._action(this._operateType.START, move);

      // 如果是点，则此时执行点的结束绘制操作
      if (this._type === 'POINT') {
        this._complete(overrideFunc);
        isStartDraw = false;
        const positions = this.$Instance?.position?.getValue(new JulianDate());
        if (config.onEnd && this.$Instance && positions) config.onEnd(this.$Instance, [positions]);
      }

      this._updateTips();
    }, this._operateType.START);

    // 移动事件
    const moveId = this._subscriber.addExternal((move) => {
      if (!isStartDraw) return;

      this._moving(move);
      this._viewer.canvas.style.cursor = 'crosshair';

      // ActionCallback
      if (this._action) this._action(this._operateType.MOVING, move);
    }, this._operateType.MOVING);

    // Redraw the shape so it's not dynamic and remove the dynamic shape.
    const cancelId = this._subscriber.addExternal((move) => {
      if (!isStartDraw) return;

      this._cancel(move);
      this._updateTips();

      // ActionCallback
      if (this._action) this._action(this._operateType.CANCEL, move);
    }, this._operateType.CANCEL);

    // Redraw the shape so it's not dynamic and remove the dynamic shape.
    const endId = this._subscriber.addExternal((move) => {
      if (!isStartDraw) return;

      // 结束绘制，确定实体
      this._playOff(move);

      // ActionCallback
      if (this._action) this._action(this._operateType.END, move);

      if (this._type === 'POINT') return;

      this._complete(overrideFunc);
      this._updateTips();

      isStartDraw = false;
    }, this._operateType.END);

    this._events = [startId, moveId, cancelId, endId];
  }

  private _complete(override: OverrideEntityFunc): void {
    // 如果是线和面，则此时将实例添加到Viewer中
    if (this._once) this.pause();

    if (this._oneInstance && this.$Instance) {
      this._viewer.entities.remove(this.$Instance);
    }

    this.$Instance = override.call(this, this._operateType.END, this._typeClass.result);

    if (this.$Instance instanceof Entity) {
      this._viewer.entities.add(this.$Instance);
      this.$AddedInstance.push(this.$Instance);
    }
    this._viewer.canvas.style.cursor = 'default';
  }

  private _isSupport(type: string) {
    return ['POLYGON', 'POLYLINE', 'POINT', 'CIRCLE', 'RECTANGLE'].includes(type);
  }

  reset() {
    this.pause();
    this._status = 'INIT';
    this._painter?.clear();
    this.$AddedInstance.map((entity) => {
      this._viewer.entities.remove(entity);
    });
    this.$AddedInstance = [];
    this._viewer.scene.requestRender();
  }

  pause(): void {
    this._status = 'PAUSE';
    this._updateTips();
    this._subscriber.removeExternal(this._events);
    this._events = [];
    this._viewer.canvas.style.cursor = 'default';
  }

  destroy(): void {
    this._status = 'DESTROY';
    this.reset();
    this._subscriber.destroy();
  }
}

import { ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';

import type { Cartesian2, Entity, Viewer } from 'cesium';

export interface EventArgs {
  position?: Cartesian2;
  endPosition?: Cartesian2;
  startPosition?: Cartesian2;
  [name: string]: any;
}
export type ListenCallback<T> = (movement: EventArgs, substance: T) => void;

export type ExternalListenCallback = (movement: EventArgs, result: any) => void;

export type EventType =
  | 'LEFT_DOWN'
  | 'LEFT_UP'
  | 'LEFT_CLICK'
  | 'LEFT_DOUBLE_CLICK'
  | 'RIGHT_DOWN'
  | 'RIGHT_UP'
  | 'RIGHT_CLICK'
  | 'MIDDLE_DOWN'
  | 'MIDDLE_UP'
  | 'MIDDLE_CLICK'
  | 'MOUSE_MOVE'
  | 'WHEEL'
  | 'PINCH_START'
  | 'PINCH_MOVE'
  | 'PINCH_END';

type EventCollection = Record<EventType, Map<string, ListenCallback<Entity>>>;

type ExternalEventCollection = Record<EventType, Map<string, ListenCallback<Entity>>>;

function uniqueId(): string {
  let _val = '';

  do {
    _val = Math.random().toString(36).slice(-8);
  } while (_val.length < 8);

  return _val;
}

export class Subscriber {
  private _viewer: Viewer;

  private _handler: ScreenSpaceEventHandler;

  private _eventCollection: EventCollection = Object.create(null);

  private _externalEventCollection: ExternalEventCollection = Object.create({});

  private readonly _eventTypeList: EventType[] = [
    'LEFT_DOWN',
    'LEFT_UP',
    'LEFT_CLICK',
    'LEFT_DOUBLE_CLICK',
    'RIGHT_DOWN',
    'RIGHT_UP',
    'RIGHT_CLICK',
    'MIDDLE_DOWN',
    'MIDDLE_UP',
    'MIDDLE_CLICK',
    'MOUSE_MOVE',
    'WHEEL',
    'PINCH_START',
    'PINCH_MOVE',
    'PINCH_END',
  ];
  private _moveDebounce: number | undefined;
  private _lastTime: number;
  private _enablePickResult: boolean;
  private _lastResult: any;
  private _enable: boolean = true;
  private _isDestroy: boolean;

  /**
   * 是否被销毁
   */
  get isDestroy() {
    return this._isDestroy;
  }

  /** 是否执行监听回调 */
  get enable() {
    return this._enable;
  }

  set enable(val: boolean) {
    this._enable = val;
  }

  constructor(
    viewer: Viewer,
    options: {
      element?: HTMLCanvasElement;
      pickResult?: {
        enable: boolean;
        moveDebounce?: number;
      };
    } = {},
  ) {
    this._viewer = viewer;
    this._handler = new ScreenSpaceEventHandler(options.element || this._viewer.canvas);
    this._moveDebounce = options.pickResult?.moveDebounce;
    this._enablePickResult = options.pickResult?.enable ?? false;
    this._lastTime = new Date().getTime();
    this._isDestroy = false;
    this._initListener();
  }

  private _initListener(): void {
    this._eventTypeList.forEach((type) => {
      this._eventCollection[type] = new Map();
      this._externalEventCollection[type] = new Map();
    });
  }

  private _shouldUpdate(update = true) {
    if (!this._moveDebounce) return true;

    const timeNow = new Date().getTime();
    if (timeNow - this._lastTime < this._moveDebounce) {
      return false;
    } else {
      if (update) this._lastTime = timeNow;
      return true;
    }
  }

  private _eventRegister(eventType: EventType): void {
    if (this._isDestroy) return;
    const eventCollection = this._eventCollection[eventType];
    const externalEventCollection = this._externalEventCollection[eventType];
    this._handler.setInputAction((movement: EventArgs) => {
      if (this._isDestroy || !this._enable || (eventType === 'MOUSE_MOVE' && !this._shouldUpdate())) return;

      if (this._enablePickResult) {
        if (eventType === 'MOUSE_MOVE' && movement.endPosition) {
          this._lastResult = this._viewer.scene.pick(movement.endPosition);
        } else if (movement.position) {
          this._lastResult = this._viewer.scene.pick(movement.position);
        }
      }

      if (externalEventCollection.size > 0) {
        const iterator = externalEventCollection.values();
        let val = iterator.next();
        while (!val.done) {
          val.value(movement, this._lastResult);
          val = iterator.next();
        }
      }

      if (movement.position || movement.endPosition) {
        const entity: Entity | undefined = this._lastResult?.id;
        if (
          entity &&
          eventCollection.has(entity.id) &&
          typeof eventCollection.get(entity.id) === 'function'
        ) {
          const func = eventCollection.get(entity.id);
          if (func) func(movement, entity);
        }
      }
    }, ScreenSpaceEventType[eventType]);
  }

  /**
   * @description 为Entity添加监听事件
   *
   * @event
   *
   * @param {Function} callback 需要相应的事件
   *
   * @param {EventType} eventType 事件类型
   */
  add(substances: Entity | Entity[], callback: ListenCallback<Entity>, eventType: EventType): void {
    if (this._isDestroy) return;

    if (
      this._eventCollection[eventType].size === 0 &&
      this._externalEventCollection[eventType].size === 0
    )
      this._eventRegister(eventType);

    const substancesArray = Array.isArray(substances) ? substances : [substances];

    for (const substance of substancesArray) {
      this._eventCollection[eventType].set(substance.id, callback);
    }
  }

  /**
   * @description 添加特定事件，与add不同在于该事件不会过滤Entity
   * @param callback 事件处理函数
   * @param eventType 事件类型
   * @return {string} Event Id  事件移除时需要提供事件ID
   */
  addExternal(callback: ExternalListenCallback, eventType: EventType): string {
    if (this._isDestroy) return '';

    if (
      this._eventCollection[eventType].size === 0 &&
      this._externalEventCollection[eventType].size === 0
    )
      this._eventRegister(eventType);

    const eId = uniqueId();
    this._externalEventCollection[eventType].set(eId, callback);
    return eId;
  }

  /**
   *@description 移除指定Substance的相应事件
   * @param substances 需要移除事件的Substance
   * @param eventType 需要移除的时间类型
   */
  remove<T extends Entity>(substances: T | T[], eventType: EventType): void {
    if (this._isDestroy) return;

    const substancesArray = Array.isArray(substances) ? substances : [substances];
    for (const substance of substancesArray) {
      if (this._eventCollection[eventType].has(substance.id)) {
        this._eventCollection[eventType].delete(substance.id);
      }
    }
  }

  removeExternal(ids: string | string[], eventType?: EventType): void {
    if (this._isDestroy) return;

    const idsArray = Array.isArray(ids) ? ids : [ids];

    for (const id of idsArray) {
      const type = eventType || this._searchExternal(id);
      if (type && this._externalEventCollection[type]?.has(id)) {
        this._externalEventCollection[type].delete(id);
      }
    }
  }

  private _searchExternal(id: string): EventType | undefined {
    if (this._isDestroy) return;

    const types: EventType[] = Object.keys(this._externalEventCollection) as any;

    for (const type of types) {
      const events = this._externalEventCollection[type];
      if (events.has(id)) return type;
    }
    return;
  }

  removeNative(viewer: Viewer, eventType: EventType): void {
    viewer.screenSpaceEventHandler.removeInputAction(this.convertCesiumEventType(eventType));
  }

  private convertCesiumEventType(subscriberEventType: EventType): ScreenSpaceEventType {
    return ScreenSpaceEventType[subscriberEventType];
  }

  destroy(): void {
    this._isDestroy = true;
    this._handler.destroy();
  }
}

export default Subscriber
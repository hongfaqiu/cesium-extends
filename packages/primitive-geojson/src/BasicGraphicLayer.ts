import { Event } from 'cesium';

import type Subscriber from '@cesium-extends/subscriber';
import type { EventType, ExternalListenCallback } from '@cesium-extends/subscriber';

/**
 * GraphicLayer 基类
 */
export class BasicGraphicLayer {
  protected _changed: Event;
  private _subscriber: Subscriber | undefined;
  protected _subscribIds: string[] = [];

  constructor(options: { subscriber?: Subscriber }) {
    this._subscriber = options.subscriber;
    this._changed = new Event();
  }

  addSubscribers(callback: ExternalListenCallback, eventType: EventType) {
    if (!this._subscriber) return;
    const id = this._subscriber.addExternal(callback, eventType);
    if (id) this._subscribIds.push(id);
  }

  removeSubscribers(ids?: string | string[]) {
    this._subscriber?.removeExternal(ids ?? this._subscribIds);
  }
}

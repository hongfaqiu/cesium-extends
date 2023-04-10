import * as Cesium from 'cesium';

import BasicGraphices from '../base';

import type { LifeCycle } from '../base';
import type { EventArgs } from '../typings';

export default class Line extends BasicGraphices implements LifeCycle {
  dropPoint(event: EventArgs): void {
    this._dropPoint(event, this.createShape.bind(this));
  }

  playOff(): Cesium.Entity {
    return this._playOff(this.createShape.bind(this));
  }

  cancel(): void {
    this._cancel(this.createShape.bind(this));
  }

  createShape(
    positions: Cesium.Cartesian3[] | Cesium.CallbackProperty,
    isDynamic = false,
  ): Cesium.Entity {
    const polyline: Cesium.PolylineGraphics.ConstructorOptions = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      { positions },
    );

    return new Cesium.Entity({ polyline });
  }
}

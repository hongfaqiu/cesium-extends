import { CallbackProperty, Entity, JulianDate, Rectangle as CesiumRectangle } from 'cesium';

import BasicGraphices from '../base';

import type { Cartesian3 } from 'cesium';
import type { EventArgs } from '@cesium-extends/subscriber';
import type { LifeCycle } from '../base';

export default class Rectangle extends BasicGraphices implements LifeCycle {
  dropPoint(move: EventArgs): void {
    this._dropPoint(move, this.createShape.bind(this));
  }

  playOff(): Entity {
    return this._playOff(this.createShape.bind(this));
  }

  cancel(): void {
    this._cancel(this.createShape.bind(this));
  }

  createShape(hierarchy: Cartesian3[] | CallbackProperty, isDynamic = false): Entity {
    const target = Array.isArray(hierarchy) ? hierarchy : hierarchy.getValue(JulianDate.now());

    const rectangle = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        coordinates: new CallbackProperty(function () {
          const obj = CesiumRectangle.fromCartesianArray(target);
          return obj;
        }, false),
      },
    );

    return new Entity({ rectangle });
  }
}

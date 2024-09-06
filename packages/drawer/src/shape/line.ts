import { ArcType, ClassificationType, Entity } from 'cesium';
import BasicGraphices from '../base';

import type { LifeCycle } from '../base';
import type { CallbackProperty, Cartesian3, PolylineGraphics } from 'cesium';
import type { EventArgs } from '@cesium-extends/subscriber';

export default class Line extends BasicGraphices implements LifeCycle {
  dropPoint(event: EventArgs): void {
    this._dropPoint(event, this.createShape.bind(this));
  }

  playOff(): Entity {
    return this._playOff(this.createShape.bind(this));
  }

  cancel(): void {
    this._cancel(this.createShape.bind(this));
  }

  createShape(
    positions: Cartesian3[] | CallbackProperty,
    isDynamic = false,
  ): Entity {
    const polyline: PolylineGraphics.ConstructorOptions = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        positions,
        arcType: ArcType.RHUMB,
        classificationType: this.painter._model
          ? ClassificationType.CESIUM_3D_TILE
          : undefined,
      },
    );

    return new Entity({ polyline });
  }
}

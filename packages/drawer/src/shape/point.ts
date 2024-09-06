import { defined, Entity } from 'cesium';

import BasicGraphices from '../base';

import type { Cartesian3 } from 'cesium';
import type { EventArgs } from '@cesium-extends/subscriber';
import type { LifeCycle } from '../base';

export default class Point extends BasicGraphices implements LifeCycle {
  dropPoint(event: EventArgs): void {
    if (!event.position) return;
    const earthPosition = this.painter.pickCartesian3(event.position);

    if (earthPosition && defined(earthPosition))
      this.result = this.createDynamicShape(earthPosition);
  }

  moving(): void {
    return undefined;
  }

  playOff(): Entity {
    this.painter.reset();
    return this.result;
  }

  cancel(): void {
    this.painter.reset();
    return undefined;
  }

  createDynamicShape(position: Cartesian3): Entity {
    const point = Object.assign({}, this.finalOptions);
    return new Entity({ position, point });
  }
}

import {
  CallbackProperty,
  ClassificationType,
  Entity,
  JulianDate,
} from "cesium";

import BasicGraphices from "../base";

import { Cartesian3 } from "cesium";
import type { EventArgs } from "@cesium-extends/subscriber";
import type { LifeCycle } from "../base";

export default class Circle extends BasicGraphices implements LifeCycle {
  dropPoint(move: EventArgs): void {
    this._dropPoint(move, this.createShape.bind(this));
  }

  playOff(): Entity {
    return this._playOff(this.createShape.bind(this));
  }

  cancel(): void {
    this._cancel(this.createShape.bind(this));
  }

  createShape(
    hierarchy: Cartesian3[] | CallbackProperty,
    isDynamic = false,
  ): Entity {
    const target: Cartesian3[] = Array.isArray(hierarchy)
    ? hierarchy
    : hierarchy.getValue(JulianDate.now());
    
    const radiusFuc = new CallbackProperty(function () {
      const distance = Cartesian3.distance(target[0], target[target.length - 1]);
      return distance || 1;
    }, false)

    const ellipse = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        semiMinorAxis: radiusFuc,
        semiMajorAxis: radiusFuc,
        classificationType: this.painter._model
          ? ClassificationType.CESIUM_3D_TILE
          : undefined,
      },
    );

    const position = this.painter._activeShapePoints[0];

    return new Entity({ position, ellipse });
  }
}

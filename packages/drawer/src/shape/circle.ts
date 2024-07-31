import {
  CallbackProperty,
  ClassificationType,
  Entity,
  JulianDate,
} from "cesium";

import BasicGraphices from "../base";

import type { Cartesian3 } from "cesium";
import type { EventArgs } from "@cesium-extends/subscriber";
import type { LifeCycle } from "../base";

export default class Circle extends BasicGraphices implements LifeCycle {
  dropPoint(move: EventArgs): void {
    if (this.painter._breakPointEntities.length < 1) {
      this._dropPoint(move, this.createShape.bind(this));
    }
  }

  playOff(): Entity {
    return this._playOff(this.createShape.bind(this));
  }

  cancel(): void {
    this.painter.clear();
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);
  }

  createShape(
    hierarchy: Cartesian3[] | CallbackProperty,
    isDynamic = false,
  ): Entity {
    const target: Cartesian3[] = Array.isArray(hierarchy)
      ? hierarchy
      : hierarchy.getValue(JulianDate.now());

    const ellipse = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        semiMinorAxis: new CallbackProperty(function () {
          // 半径 两点间距离
          const radius = Math.sqrt(
            Math.pow(target[0].x - target[target.length - 1].x, 2) +
              Math.pow(target[0].y - target[target.length - 1].y, 2),
          );
          return radius || radius + 1;
        }, false),
        semiMajorAxis: new CallbackProperty(function () {
          const radius = Math.sqrt(
            Math.pow(target[0].x - target[target.length - 1].x, 2) +
              Math.pow(target[0].y - target[target.length - 1].y, 2),
          );
          return radius || radius + 1;
        }, false),
        classificationType: this.painter._model
          ? ClassificationType.CESIUM_3D_TILE
          : undefined,
      },
    );

    const position = this.painter._activeShapePoints[0];

    return new Entity({ position, ellipse });
  }
}

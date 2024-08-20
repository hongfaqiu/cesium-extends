import {
  CallbackProperty,
  Entity,
  JulianDate,
  Rectangle as CesiumRectangle,
  Cartesian3,
  Cartesian2,
} from "cesium";

import BasicGraphices from "../base";

import type { Rectangle as TRectangle } from "cesium";
import type { EventArgs } from "@cesium-extends/subscriber";
import type { LifeCycle } from "../base";

export default class Rectangle extends BasicGraphices implements LifeCycle {
  dropPoint(move: EventArgs): void {
    this._dropPoint(move, this.createShape.bind(this));
  }

  playOff(): Entity {
    this.painter._activeShapePoints.pop();
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);

    this.result = this.createShape(this.painter._activeShapePoints);
    const rect = this.result.rectangle?.coordinates?.getValue(
      new JulianDate(),
    ) as TRectangle;
    const { west, east, north, south } = rect;
    const positions = [
      [west, north],
      [east, north],
      [east, south],
      [west, south],
    ].map((pos) => Cartesian3.fromRadians(pos[0], pos[1], 0));

    if (this._onEnd) this._onEnd(this.result, positions);

    this.painter.reset();

    this._lastClickPosition = new Cartesian2(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    );
    return this.result;
  }

  cancel(): void {
    this._cancel(this.createShape.bind(this));
  }

  createShape(
    hierarchy: Cartesian3[] | CallbackProperty,
    isDynamic = false,
  ): Entity {
    const target = Array.isArray(hierarchy)
      ? hierarchy
      : hierarchy.getValue(JulianDate.now());

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

import {
  ArcType,
  CallbackProperty,
  ClassificationType,
  defined,
  Entity,
  PolygonHierarchy,
} from "cesium";

import BasicGraphices from "../base";

import type {
  Cartesian3,
  Color,
  PolygonGraphics,
  PolylineGraphics,
} from "cesium";
import type { EventArgs } from "@cesium-extends/subscriber";
import type { LifeCycle } from "../base";

export default class Polygon extends BasicGraphices implements LifeCycle {
  dropPoint(event: EventArgs): void {
    if (!event.position) return;
    const earthPosition = this.painter.pickCartesian3(event.position);

    if (earthPosition && defined(earthPosition)) {
      if (!this.painter._activeShapePoints.length) {
        this.painter._activeShapePoints.push(earthPosition);
        const dynamicPositions = new CallbackProperty(
          () => new PolygonHierarchy(this.painter._activeShapePoints),
          false,
        );
        this.painter._dynamicShapeEntity = this.painter.addView(
          this.createShape(dynamicPositions, true),
        );
      }

      this.SetBreakpoint(earthPosition);
    }
  }

  playOff(): Entity {
    // 去除最后一个多余点
    this._cancel(this.createShape.bind(this));
    return this._playOff(this.createShape.bind(this));
  }

  cancel(): void {
    this._cancel(this.createShape.bind(this));
  }

  createShape(
    hierarchy: Cartesian3[] | CallbackProperty,
    isDynamic = false,
  ): Entity {
    const options: PolygonGraphics.ConstructorOptions =
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions;
    const polygon = Object.assign({}, options, {
      hierarchy: Array.isArray(hierarchy)
        ? new PolygonHierarchy(hierarchy)
        : hierarchy,
      arcType: ArcType.RHUMB,
      classificationType: this.painter._model
        ? ClassificationType.CESIUM_3D_TILE
        : undefined,
    });

    const polyline: PolylineGraphics.ConstructorOptions = {
      width: options.outlineWidth,
      material: options.outlineColor as Color,
      positions: Array.isArray(hierarchy)
        ? [...hierarchy, hierarchy[0]]
        : new CallbackProperty(() => {
            return [
              ...this.painter._activeShapePoints,
              this.painter._activeShapePoints[0],
            ];
          }, false),
      clampToGround: true,
      arcType: ArcType.RHUMB,
      classificationType: this.painter._model
        ? ClassificationType.CESIUM_3D_TILE
        : undefined,
    };

    return new Entity({ polygon, polyline });
  }
}

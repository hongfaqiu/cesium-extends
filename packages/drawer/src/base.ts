import { CallbackProperty, Cartesian2, defined } from "cesium";

import type { Cartesian3, Entity } from "cesium";
import type Painter from "./painter";
import type { EventArgs } from "@cesium-extends/subscriber";

type CreateFunc = (callback: CallbackProperty, bool: boolean) => Entity;

export interface LifeCycle {
  dropPoint?: (move: EventArgs) => void;
  moving?: (move: EventArgs) => void;
  cancel?: (move: EventArgs) => void;
  playOff?: (move: EventArgs) => void;
  createShape?: CreateFunc;
}

export type BasicGraphicesOptions = {
  finalOptions?: object;
  dynamicOptions?: object;
  sameStyle?: boolean;
  onPointsChange?: (points: Cartesian3[]) => void;
  onEnd?: (entity: Entity, positions: Cartesian3[]) => void;
};

export default class BasicGraphices {
  result!: Entity;
  painter: Painter;
  protected _terrain: boolean | undefined;
  protected _lastClickPosition: Cartesian2 = new Cartesian2(
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
  );
  private _mouseDelta = 10;

  finalOptions: object;
  dynamicOptions: object = {};
  sameStyle: boolean;
  protected _onPointsChange: ((points: Cartesian3[]) => void) | undefined;
  protected _onEnd:
    | ((entity: Entity, positions: Cartesian3[]) => void)
    | undefined;

  /**
   *
   * @param painter
   * @param options
   * @param flag
   */
  constructor(painter: Painter, options: BasicGraphicesOptions = {}) {
    this.painter = painter;
    this._terrain = painter._terrain;
    this.finalOptions = options.finalOptions ?? {};
    this.dynamicOptions = options.dynamicOptions ?? {};
    this.sameStyle = options.sameStyle ?? false;
    this._onPointsChange = options.onPointsChange;
    this._onEnd = options.onEnd;
  }

  protected _dropPoint(move: EventArgs, createShape: CreateFunc): void {
    if (!move.position) return;
    const earthPosition = this.painter.pickCartesian3(move.position);

    if (!earthPosition || !defined(earthPosition)) return;

    // 如果最近两个点的距离过小则return
    if (
      this._lastClickPosition &&
      Cartesian2.magnitude(
        Cartesian2.subtract(this._lastClickPosition, move.position, {} as any),
      ) < this._mouseDelta
    )
      return;

    if (!this.painter._activeShapePoints.length) {
      this.dynamicUpdate(earthPosition, createShape);
    }

    this.SetBreakpoint(earthPosition);

    Cartesian2.clone(move.position, this._lastClickPosition);
  }

  moving(event: EventArgs): void {
    this._moving(event);
  }

  protected _moving(event: EventArgs): void {
    if (!event.endPosition || this.painter._activeShapePoints.length === 0)
      return;
    const earthPosition = this.painter.pickCartesian3(event.endPosition);
    if (earthPosition && defined(earthPosition)) {
      this.painter._activeShapePoints.pop();
      this.painter._activeShapePoints.push(earthPosition);
      if (this._onPointsChange)
        this._onPointsChange([...this.painter._activeShapePoints]);
    }
    this.painter._viewer.scene.requestRender();
  }

  protected _playOff(createShape: (positions: Cartesian3[]) => Entity): Entity {
    this.painter._activeShapePoints.pop();
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);

    this.result = createShape(this.painter._activeShapePoints);
    if (this._onEnd)
      this._onEnd(this.result, [...this.painter._activeShapePoints]);

    this.painter.reset();

    this._lastClickPosition = new Cartesian2(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    );
    return this.result;
  }

  protected _cancel(createShape: (positions: Cartesian3[]) => Entity): void {
    this.painter._activeShapePoints.pop();
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);
    this.result = createShape(this.painter._activeShapePoints);

    const entity = this.painter._breakPointEntities.pop();
    if (entity) this.painter.removeEntity(entity);
  }

  SetBreakpoint(earthPosition: Cartesian3): void {
    this.painter._activeShapePoints.push(earthPosition);
    if (this._onPointsChange)
      this._onPointsChange([...this.painter._activeShapePoints]);
    const $point = this.painter.createPoint(earthPosition);

    this.painter._breakPointEntities.push($point);
    this.painter.addView($point);
  }

  /**
   * 将新的点添加到动态数组中
   * @param {Cartesian3} earthPosition
   * @param {CreateFunc} createShape
   */
  dynamicUpdate(earthPosition: Cartesian3, createShape: CreateFunc): void {
    this.painter._activeShapePoints.push(earthPosition);

    // 将动态绘制的图形加入Viewer
    const dynamicPositions = new CallbackProperty(() => {
      return this.painter._activeShapePoints;
    }, false);

    this.painter._dynamicShapeEntity = createShape(dynamicPositions, true);
    this.painter.addView(this.painter._dynamicShapeEntity);
    return undefined;
  }
}

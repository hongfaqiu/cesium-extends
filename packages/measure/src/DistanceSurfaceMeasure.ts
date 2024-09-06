import {
  Cartesian2,
  Cartographic,
  EllipsoidGeodesic,
  SceneTransforms,
} from 'cesium';

import DistanceMeasure from './DistanceMeasure';
import { pickCartesian3 } from './utils';

import type { Cartesian3, PolylineGraphics, Viewer } from 'cesium';
import type { MeasureOptions } from './Measure';

/**
 * 贴地距离测量类
 */
class DistanceSurfaceMeasure extends DistanceMeasure {
  private _splitNum: number;

  constructor(
    viewer: Viewer,
    options: MeasureOptions & {
      splitNum?: number;
    } = {},
  ) {
    super(viewer, options);
    this._splitNum = options.splitNum ?? 100;
  }
  /**
   * 计算线段的表面距离
   * @param startPoint  -线段起点的屏幕坐标
   * @param endPoint    -线段终点的屏幕坐标
   * @returns 表面距离
   */
  private _calculateSurfaceDistance(
    startPoint: Cartesian2,
    endPoint: Cartesian2,
  ): number {
    let resultDistance = 0;
    const sampleWindowPoints = [startPoint];
    const interval =
      Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + (endPoint.y - startPoint.y, 2),
      ) / this._splitNum;
    for (let ii = 1; ii <= this._splitNum; ii += 1) {
      const tempPositon = this._findWindowPositionByPixelInterval(
        startPoint,
        endPoint,
        ii * interval,
      );
      sampleWindowPoints.push(tempPositon);
    }
    sampleWindowPoints.push(endPoint);
    for (let jj = 0; jj < sampleWindowPoints.length - 1; jj += 1) {
      resultDistance += this._calculateDetailSurfaceLength(
        sampleWindowPoints[jj + 1],
        sampleWindowPoints[jj],
      );
    }
    return resultDistance;
  }

  /**
   * 计算细分后的，每一小段的笛卡尔坐标距离（也就是大地坐标系距离）
   * @param startPoint -每一段线段起点
   * @param endPoint -每一段线段终点
   * @returns 表面距离
   */
  private _calculateDetailSurfaceLength(
    startPoint: Cartesian2,
    endPoint: Cartesian2,
  ): number {
    let innerS = 0;
    const surfaceStartCartesian3 = pickCartesian3(this._viewer, startPoint);
    const surfaceEndCartesian3 = pickCartesian3(this._viewer, endPoint);
    if (surfaceStartCartesian3 && surfaceEndCartesian3) {
      const cartographicStart = Cartographic.fromCartesian(
        surfaceStartCartesian3,
      );
      const cartographicEnd = Cartographic.fromCartesian(surfaceEndCartesian3);
      const geoD = new EllipsoidGeodesic();
      geoD.setEndPoints(cartographicStart, cartographicEnd);
      innerS = geoD.surfaceDistance;
      innerS = Math.sqrt(
        Math.pow(innerS, 2) +
          Math.pow(cartographicStart.height - cartographicEnd.height, 2),
      );
    }
    return innerS;
  }

  /**
   * 获取线段上距起点一定距离出的线上点坐标（屏幕坐标）
   * @param startPosition  -线段起点（屏幕坐标）
   * @param endPosition -线段终点（屏幕坐标）
   * @param interval -距起点距离
   * @returns -结果坐标（屏幕坐标）
   */
  private _findWindowPositionByPixelInterval(
    startPosition: Cartesian2,
    endPosition: Cartesian2,
    interval: number,
  ): Cartesian2 {
    const result = new Cartesian2(0, 0);
    const length = Math.sqrt(
      Math.pow(endPosition.x - startPosition.x, 2) +
        Math.pow(endPosition.y - startPosition.y, 2),
    );
    if (length < interval) {
      return result;
    } else {
      const x =
        (interval / length) * (endPosition.x - startPosition.x) +
        startPosition.x;
      //alert(interval/length)
      const y =
        (interval / length) * (endPosition.y - startPosition.y) +
        startPosition.y;
      result.x = x;
      result.y = y;
    }
    return result;
  }

  getDistance(pos1: Cartesian3, pos2: Cartesian3): number {
    const start = SceneTransforms.worldToWindowCoordinates(
      this._viewer.scene,
      pos1,
    )!;
    const end = SceneTransforms.worldToWindowCoordinates(
      this._viewer.scene,
      pos2,
    )!;

    return this._calculateSurfaceDistance(start, end);
  }

  start(style: PolylineGraphics.ConstructorOptions = {}) {
    this._start('POLYLINE', {
      clampToGround: true,
      style,
    });
  }
}

export default DistanceSurfaceMeasure;

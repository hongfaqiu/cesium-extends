import {
  Cartesian2,
  Cartographic,
  EllipsoidGeodesic,
  SceneTransforms,
} from 'cesium';
import { Polygon, polygon } from '@turf/helpers';
import intersect from '@turf/intersect';
import { randomPoint } from '@turf/random';
import voronoi from '@turf/voronoi';

import AreaMeasure from './AreaMeasure';
import { getBounds, pickCartesian3 } from './utils';

import type { Cartesian3, Viewer } from 'cesium';
import type { MeasureOptions } from './Measure';

/**
 * 贴地面积量算类
 */
class AreaSurfaceMeasure extends AreaMeasure {
  private _splitNum: number;

  /**
   * 贴地面积量算构造函数
   * @param viewer
   * @param [options.splitNum = 10] 插值数，将面分割的网格数, 默认为10
   */
  constructor(
    viewer: Viewer,
    options: MeasureOptions & {
      splitNum?: number;
    } = {},
  ) {
    super(viewer, options);
    this._splitNum = options.splitNum ?? 10;
  }

  private _calculateSurfaceArea(positions: Cartesian2[]): number {
    let result = 0;
    const bounds = getBounds(positions);
    const points = randomPoint(this._splitNum, {
      bbox: [bounds[0], bounds[1], bounds[2], bounds[3]],
    });
    const mainPoly = this._Cartesian2turfPolygon(positions);
    const voronoiPolygons = voronoi(points, {
      bbox: [bounds[0], bounds[1], bounds[2], bounds[3]],
    });
    voronoiPolygons.features.forEach((element) => {
      const intersectPoints = this._intersect(mainPoly, element.geometry);
      result += this.calculateDetailSurfaceArea(intersectPoints);
    });
    return result;
  }

  private calculateDetailSurfaceArea(positions: Cartesian2[]): number {
    const worldPositions: Cartesian3[] = [];
    positions.forEach((element) => {
      const pickResult = pickCartesian3(this._viewer, element);
      if (pickResult) worldPositions.push(pickResult);
    });
    const area = this._getWorldPositionsArea(worldPositions);
    return area;
  }

  private _getWorldPositionsArea(positions: Cartesian3[]) {
    const x: number[] = [0];
    const y: number[] = [0];
    const geodesic = new EllipsoidGeodesic();
    const radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
    //数组x,y分别按顺序存储各点的横、纵坐标值
    for (let i = 0; i < positions.length - 1; i += 1) {
      const p1 = positions[i];
      const p2 = positions[i + 1];
      const point1cartographic = Cartographic.fromCartesian(p1);
      const point2cartographic = Cartographic.fromCartesian(p2);
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      const s = Math.sqrt(
        Math.pow(geodesic.surfaceDistance, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2),
      );
      const lat1 = point2cartographic.latitude * radiansPerDegree;
      const lon1 = point2cartographic.longitude * radiansPerDegree;
      const lat2 = point1cartographic.latitude * radiansPerDegree;
      const lon2 = point1cartographic.longitude * radiansPerDegree;
      let angle = -Math.atan2(
        Math.sin(lon1 - lon2) * Math.cos(lat2),
        Math.cos(lat1) * Math.sin(lat2) -
          Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2),
      );
      if (angle < 0) {
        angle += Math.PI * 2.0;
      }

      y.push(Math.sin(angle) * s + y[i]);
      x.push(Math.cos(angle) * s + x[i]);
    }

    let sum = 0;
    for (let i = 0; i < x.length - 1; i += 1) {
      sum += x[i] * y[i + 1] - x[i + 1] * y[i];
    }

    return Math.abs(sum + x[x.length - 1] * y[0] - x[0] * y[y.length - 1]) / 2;
  }

  private _Cartesian2turfPolygon(positions: Cartesian2[]): Polygon {
    const coordinates: number[][][] = [[]];
    positions.forEach((element) => {
      coordinates[0].push([element.x, element.y]);
    });
    coordinates[0].push([positions[0].x, positions[0].y]);
    const pg = polygon(coordinates);
    return pg.geometry;
  }

  private _intersect(poly1: Polygon, poly2: Polygon): Cartesian2[] {
    const intersection = intersect(poly1, poly2);
    if (intersection?.geometry !== undefined) {
      return this._turfPloygon2CartesianArr(intersection?.geometry as Polygon);
    } else {
      return [];
    }
  }
  private _turfPloygon2CartesianArr(polygon: Polygon): Cartesian2[] {
    return polygon.coordinates[0].map(
      (item) => new Cartesian2(item[0], item[1]),
    );
  }

  /**
   * 计算贴地的多边形面积
   * @param {Cartesian3[]} positions 点位
   * @returns {number} 面积/平方米
   */
  getArea(positions: Cartesian3[]): number {
    return this._calculateSurfaceArea(
      positions.map(
        (item) =>
          SceneTransforms.worldToWindowCoordinates(this._viewer.scene, item)!,
      ),
    );
  }
}

export default AreaSurfaceMeasure;

import type { Cartesian2, Cartesian3, HeightReference, Viewer } from 'cesium';
import { MeasureUnits } from './Measure';

export type PickResult = {
  cartesian: Cartesian3;
  CartesianModel: Cartesian3;
  cartesianTerrain: Cartesian3;
  windowCoordinates: Cartesian2;
  altitudeMode: HeightReference;
};

export function pickCartesian3(
  viewer: Viewer,
  position: Cartesian2,
): Cartesian3 | undefined {
  // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
  // we get the correct point when mousing over terrain.
  const ray = viewer.camera.getPickRay(position);
  if (ray) return viewer.scene.globe.pick(ray, viewer.scene);
  return undefined;
}

export function getBounds(points: Cartesian2[]): number[] {
  const left = Math.min(...points.map((item) => item.x));
  const right = Math.max(...points.map((item) => item.x));
  const top = Math.max(...points.map((item) => item.y));
  const bottom = Math.min(...points.map((item) => item.y));

  const bounds = [left, top, right, bottom];
  return bounds;
}

/**
 * 格式化显示长度
 * @param length 单位米
 * @param unit 目标单位
 */
export function formatLength(
  length: number,
  unitedLength: number,
  unit: MeasureUnits,
) {
  if (length < 1000) {
    return length + 'meters';
  }
  return unitedLength + unit;
}

/**
 * 格式化显示面积
 * @param area 单位米
 * @param unit 目标单位
 */
export function formatArea(
  area: number,
  unitedArea: number,
  unit: MeasureUnits,
) {
  if (area < 1000000) {
    return area + ' square meters ';
  }
  return unitedArea + ' square ' + unit;
}

export function mean(array: number[]): number {
  return (
    array.reduce((accumulator, currentValue) => accumulator + currentValue, 0) /
    array.length
  );
}

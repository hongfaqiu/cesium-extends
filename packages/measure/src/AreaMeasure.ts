import { Cartesian2, Cartesian3 } from 'cesium';
import { convertArea, polygon } from '@turf/helpers';

import Measure from './Measure';
import { mean } from './utils';

import area from '@turf/area';

import type { PolygonGraphics } from 'cesium';

/**
 * 距离测量类
 */
class AreaMeasure extends Measure {
  protected _updateLabelFunc(positions: Cartesian3[]) {
    this._labels.removeAll();
    if (positions.length < 3) return;
    const position = new Cartesian3(
      ...['x', 'y', 'z'].map((key) =>
        mean(positions.map((item) => (item as any)[key])),
      ),
    );
    this._labels.add({
      position,
      ...this._labelStyle,
      pixelOffset: new Cartesian2(-100, 0),
    });
    this._updateLabelTexts(positions);
  }

  /**
   * 计算多边形面积
   * @param {Cartesian3[]} positions 点位
   * @returns {number} 面积/平方米
   */
  getArea(positions: Cartesian3[]): number {
    const lonlats = this._cartesian2Lonlat(positions);
    const pg = polygon([[...lonlats, lonlats[0]]]);
    const polygonArea = area(pg);
    return polygonArea;
  }

  protected _updateLabelTexts(positions: Cartesian3[]) {
    const label = this._labels.get(0);
    const area = +this.getArea(positions).toFixed(2);
    const unitedArea = +convertArea(area, 'meters', this._units).toFixed(2);
    label.text = `${this._locale.area}: ${this._locale.formatArea(
      area,
      unitedArea,
      this._units,
    )}`;
  }

  protected _getDistance(pos1: Cartesian3, pos2: Cartesian3): number {
    return Cartesian3.distance(pos1, pos2);
  }

  start(style: PolygonGraphics.ConstructorOptions = {}) {
    this.end();
    this._start('POLYGON', {
      style,
    });
  }
}

export default AreaMeasure;

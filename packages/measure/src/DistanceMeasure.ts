import { Cartesian3 } from 'cesium';
import { convertLength } from '@turf/helpers';

import Measure from './Measure';

import type { PolylineGraphics } from 'cesium';

/**
 * 距离测量类
 */
class DistanceMeasure extends Measure {
  protected _updateLabelFunc(positions: Cartesian3[]) {
    this._labels.removeAll();
    positions.forEach((position) => {
      const newLabel = {
        position,
        ...this._labelStyle,
      };
      this._labels.add(newLabel);
    });
    this._updateLabelTexts(positions);
  }

  /**
   * 计算两点之间的距离
   * @param {Cartesian3} start 点位1
   * @param {Cartesian3} end 点位2
   * @returns {number} 距离/米
   */
  getDistance(start: Cartesian3, end: Cartesian3): number {
    return Cartesian3.distance(start, end);
  }

  protected _updateLabelTexts(positions: Cartesian3[]) {
    const num = positions.length;
    let distance = 0;
    for (let i = 0; i < num; i += 1) {
      const label = this._labels.get(i);
      if (i === 0) {
        label.text = this._locale.start;
        continue;
      } else {
        const newDis = +this.getDistance(
          positions[i - 1],
          positions[i],
        ).toFixed(2);
        const unitedNewDis = +convertLength(
          newDis,
          'meters',
          this._units,
        ).toFixed(2);

        distance += newDis;
        distance = +distance.toFixed(2);
        const unitedDistance = +convertLength(
          distance,
          'meters',
          this._units,
        ).toFixed(2);

        label.text =
          (i === num - 1 ? `${this._locale.total}: ` : '') +
          this._locale.formatLength(distance, unitedDistance, this._units) +
          (i > 1
            ? `\n(+${this._locale.formatLength(
                newDis,
                unitedNewDis,
                this._units,
              )})`
            : '');
      }
    }
  }

  start(style: PolylineGraphics.ConstructorOptions = {}) {
    this._start('POLYLINE', {
      style,
      clampToGround: false,
    });
  }
}

export default DistanceMeasure;

import {
  Cartesian2,
  Color,
  LabelCollection,
  LabelStyle,
  Math as CMath,
  NearFarScalar,
  HeightReference,
} from 'cesium';

import { MouseTooltip } from '@cesium-extends/tooltip';
import Drawer from '@cesium-extends/drawer';

import type { Units } from '@turf/helpers';
import type { Cartesian3, Entity, Viewer } from 'cesium';
import type { DrawOption } from '@cesium-extends/drawer';
import { formatArea, formatLength } from './utils';

export type MeasureUnits = Units;

export type MeasureLocaleOptions = {
  start: string;
  total: string;
  area: string;
  /**
   * 格式化显示长度
   * @param length 单位米
   * @param unit 目标单位
   */
  formatLength(
    length: number,
    unitedLength: number,
    unit: MeasureUnits,
  ): string;
  /**
   * 格式化显示面积
   * @param area 单位米
   * @param unit 目标单位
   */
  formatArea(area: number, unitedArea: number, unit: MeasureUnits): string;
};

export type MeasureOptions = {
  labelStyle?: {
    font?: string;
    fillColor?: Color;
    backgroundColor?: Color;
    backgroundPadding?: Cartesian2;
    outlineWidth?: number;
    style?: LabelStyle;
    pixelOffset?: Cartesian2;
    scale?: number;
    scaleByDistance?: NearFarScalar;
    heightReference?: HeightReference;
  };
  /** defaults to kilometers */
  units?: MeasureUnits;
  onEnd?: (entity: Entity) => void;
  drawerOptions?: Partial<DrawOption>;
  /**
   * @example 
   * {
        start: '起点',
        area: '面积',
        total: '总计',
        formatLength: (length, unitedLength) => {
          if (length < 1000) {
            return length + '米';
          }
          return unitedLength + '千米';
        },
        formatArea: (area, unitedArea) => {
          if (area < 1000000) {
            return area + '平方米';
          }
          return unitedArea + '平方千米';
        }
      }
   */
  locale?: Partial<MeasureLocaleOptions>;
};

export type Status = 'INIT' | 'WORKING' | 'DESTROY';

const DefaultOptions: MeasureOptions = {
  labelStyle: {
    font: `bold 20px Arial`,
    fillColor: Color.WHITE,
    backgroundColor: new Color(0.165, 0.165, 0.165, 0.8),
    backgroundPadding: new Cartesian2(4, 4),
    outlineWidth: 4,
    style: LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cartesian2(4, 0),
    scale: 1,
    scaleByDistance: new NearFarScalar(1, 0.85, 8.0e6, 0.75),
    heightReference: HeightReference.CLAMP_TO_GROUND,
  },
};

export default class Measure {
  protected _viewer: Viewer;
  protected _status: Status;
  protected _labels: LabelCollection;
  protected _labelStyle: MeasureOptions['labelStyle'];
  protected _units: MeasureUnits;
  protected _locale: MeasureLocaleOptions;

  mouseTooltip: MouseTooltip;
  drawer: Drawer;
  private _onEnd: ((entity: Entity) => void) | undefined;

  /**
   * 量算工具
   * @param viewer
   * @param {MeasureOptions['locale']} [options.locale] 绘制时的提示信息
   */
  constructor(viewer: Viewer, options: MeasureOptions = {}) {
    if (!viewer) throw new Error('undefined viewer');
    this._viewer = viewer;
    this._labelStyle = {
      ...DefaultOptions.labelStyle,
      ...options.labelStyle,
    };
    this._units = options.units ?? 'kilometers';
    this._onEnd = options.onEnd;
    this._locale = {
      area: 'Area',
      start: 'start',
      total: 'Total',
      formatLength,
      formatArea,
      ...options.locale,
    };

    this.mouseTooltip = new MouseTooltip(viewer);
    this.mouseTooltip.hide();

    this.drawer = new Drawer(viewer, {
      sameStyle: true,
      terrain: true,
      ...options.drawerOptions,
    });

    this._labels = new LabelCollection({
      scene: this._viewer.scene,
    });
    this._viewer.scene.primitives.add(this._labels);

    this._status = 'INIT';
  }

  /**
   * @return {boolean} 返回量算工具是否已销毁
   */
  get destroyed() {
    return this._status === 'DESTROY';
  }

  /**
   * 根据传入的坐标信息更新标签
   * @param {Cartesian3[]} positions
   */

  protected _updateLabelFunc(positions: Cartesian3[]): void {}

  protected _cartesian2Lonlat(positions: Cartesian3[]) {
    return positions.map((pos) => {
      const cartographic =
        this._viewer.scene.globe.ellipsoid.cartesianToCartographic(pos);
      const lon = +CMath.toDegrees(cartographic.longitude);
      const lat = +CMath.toDegrees(cartographic.latitude);
      return [lon, lat];
    });
  }

  start() {}

  /**
   * 开始绘制
   * @param {string} type 绘制图形类型
   * @param {boolean} clampToGround 是否贴地
   */
  protected _start(
    type: 'POLYGON' | 'POLYLINE' | 'POINT' | 'CIRCLE' | 'RECTANGLE',
    options?: {
      style?: object;
      clampToGround?: boolean;
    },
  ) {
    const { style, clampToGround } = options ?? {};
    if (this._status !== 'INIT') return;

    const self = this;
    this.drawer.start({
      type,
      onPointsChange: self._updateLabelFunc.bind(self),
      dynamicOptions: {
        ...style,
        clampToGround,
      },
      finalOptions: {
        ...style,
        clampToGround,
      },
      onEnd: this._onEnd,
    });
    this._status = 'WORKING';
  }

  /**
   * 清除测量结果,重置绘制
   */
  end() {
    this.drawer.reset();
    this._labels.removeAll();
    this._status = 'INIT';
  }

  destroy() {
    this.end();
    this.mouseTooltip.destroy();
    if (this._viewer && !this._viewer.isDestroyed()) {
      this._viewer.scene.primitives.remove(this._labels);
    }
    this._status = 'DESTROY';
  }
}

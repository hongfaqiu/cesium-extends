import {
  Cartesian2,
  Color,
  LabelCollection,
  LabelStyle,
  Math as CMath,
  NearFarScalar,
} from 'cesium';

import {MouseTooltip} from '@cesium-extends/tooltip';
import Drawer from '@cesium-extends/drawer';

import type { Units } from '@turf/helpers';
import type { Cartesian3, Entity, HeightReference, Viewer } from 'cesium';
import type { DrawOption } from '@cesium-extends/drawer';

export type MeasureUnits = Units;

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
  units?: Units;
  onEnd?: (entity: Entity) => void;
  drawerOptions?: Partial<DrawOption>;
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
    // heightReference : HeightReference.CLAMP_TO_GROUND,
  },
};

export default class Measure {
  protected _viewer: Viewer;
  protected _status: Status;
  protected _labels: LabelCollection;
  protected _labelStyle: MeasureOptions['labelStyle'];
  protected _units: MeasureUnits;

  mouseTooltip: MouseTooltip;
  drawer: Drawer;
  private _onEnd: ((entity: Entity) => void) | undefined;

  /**
   * 量算工具
   * @param viewer
   * @param {MeasureTips} [options.tips] 绘制时的提示信息
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

    this.mouseTooltip = new MouseTooltip(viewer);
    this.mouseTooltip.hide();

    this.drawer = new Drawer(viewer, {
      sameStyle: true,
      terrain: true,
      ...options.drawerOptions,
    });

    this._labels = new LabelCollection();
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _updateLabelFunc(positions: Cartesian3[]): void {}

  protected _cartesian2Lonlat(positions: Cartesian3[]) {
    return positions.map((pos) => {
      const cartographic = this._viewer.scene.globe.ellipsoid.cartesianToCartographic(pos);
      const lon = +CMath.toDegrees(cartographic.longitude).toFixed(4);
      const lat = +CMath.toDegrees(cartographic.latitude).toFixed(4);
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
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
    this._viewer.scene.primitives.remove(this._labels);
    this._status = 'DESTROY';
  }
}

import type { ImageryLayer, Viewer } from 'cesium';
import type { BaseHeatmapConfiguration, DataPoint, HeatmapConfiguration } from 'heatmap.js';

import { Rectangle, SingleTileImageryProvider } from 'cesium';
import * as h337 from 'heatmap.js';

type HeatMapDataItem = {
  pos: number[];
  value: number;
};
type AutoRadiusConfig = {
  enabled?: boolean;
  min?: number;
  max?: number;
  maxRadius?: number;
  minRadius?: number;
};
type CanvasConfig = {
  autoResize?: boolean;
  minSize?: number;
  maxSize?: number;
  width?: number;
  height?: number;
};
export interface HeatMapLayerContructorOptions {
  viewer: Viewer;
  heatStyle?: BaseHeatmapConfiguration;
  data: HeatMapDataItem[];
  canvasSize?: number;
  bbox?: number[];
  autoRadiusConfig?: AutoRadiusConfig;
  /** auto calculated bbox buffer width, default to 1 degree */
  tolerance?: number;
  canvasConfig?: CanvasConfig;
}

export default class HeatMapLayer {
  private _viewer: Viewer;
  private _container: HTMLDivElement;
  heatMap: h337.Heatmap<'value', 'x', 'y'>;
  private _layer: ImageryLayer | undefined;
  _data: HeatMapDataItem[];
  private _autoRadiusConfig: Required<AutoRadiusConfig>;
  cameraMoveEnd: () => any;
  private _dataRange!: {
    west: number;
    east: number;
    sourth: number;
    north: number;
    min: number;
    max: number;
  };
  private _tolerance: number;
  private _canvasConfig: Required<CanvasConfig>;
  private _destroyed: boolean = false;

  get viewer() {
    return this._viewer;
  }

  get layer() {
    return this._layer;
  }

  set show(val: boolean) {
    if (this._layer) this._layer.show = val;
  }

  get show() {
    return this._layer?.show ?? false;
  }

  get destroyed() {
    return this._destroyed;
  }

  set data(val: HeatMapDataItem[]) {
    this._data = val;
    this._getDataRange(this._data);
    this.updateCesium();
  }

  get data() {
    return this._data;
  }

  get autoRadiusConfig() {
    return this._autoRadiusConfig;
  }

  set autoRadiusConfig(val: AutoRadiusConfig) {
    this._autoRadiusConfig = {
      ...this._autoRadiusConfig,
      ...val,
    };
    this._viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd);
    if (this._autoRadiusConfig.enabled)
      this.viewer.camera.moveEnd.addEventListener(this.cameraMoveEnd);
  }

  get dataRange() {
    return this._dataRange;
  }

  constructor(options: HeatMapLayerContructorOptions) {
    this._viewer = options.viewer;

    this._autoRadiusConfig = {
      enabled: false,
      min: 1000000,
      max: 10000000,
      maxRadius: 10,
      minRadius: 1,
      ...options.autoRadiusConfig,
    };

    this._container = newDiv(
      {
        position: `absolute`,
        top: 0,
        left: 0,
        'z-index': -100,
        overflow: 'hidden',
        width: 0,
        height: 0,
      },
      document.body,
    );

    this._tolerance = options.tolerance ?? 0;

    this._data = options.data;
    this._getDataRange(this._data);

    const { east, west, north, sourth } = this._dataRange;
    const canvasConfig: Required<CanvasConfig> = {
      minSize: 1024,
      maxSize: 10000,
      autoResize: true,
      width: 1024,
      height: 1024,
      ...options.canvasConfig,
    };

    const height = north - sourth,
      width = east - west;
    const radius = height / width;

    // 计算画布大小
    if (canvasConfig?.autoResize) {
      const length = this._data.length;
      const w =
        length > canvasConfig.maxSize
          ? canvasConfig.maxSize
          : length < canvasConfig.minSize
            ? canvasConfig.minSize
            : length;
      const h = w * radius;
      this._canvasConfig = {
        ...canvasConfig,
        width: w,
        height: h,
      };
    } else {
      if (!canvasConfig.width || !canvasConfig.height) {
        throw Error('specify width and height if not auto resize');
      }
      this._canvasConfig = canvasConfig;
    }

    const config: HeatmapConfiguration = {
      ...options.heatStyle,
      container: newDiv(
        {
          width: this._canvasConfig.width,
          height: this._canvasConfig.height,
        },
        this._container,
      ),
    };

    this.heatMap = h337.create(config);
    this.updateCesium();
    this.cameraMoveEnd = () => this.updateCesium();
    if (this._autoRadiusConfig.enabled)
      this.viewer.camera.moveEnd.addEventListener(this.cameraMoveEnd);
  }

  changeConfig(config: BaseHeatmapConfiguration | undefined) {
    if (!config) return;
    this.heatMap.configure(config as any);
    this.updateCesium();
  }

  /**
   * 按当前的相机高度调整点的辐射（越高，越大）
   */
  private _updateHeatmap() {
    let data = this.convertHeatItem(this.data);
    if (this._autoRadiusConfig.enabled) {
      const h = this.viewer.camera.getMagnitude();
      const { min, max, minRadius, maxRadius } = this._autoRadiusConfig;
      const newRadius = minRadius + ((maxRadius - minRadius) * (h - min)) / (max - min);
      data = data.map(({ x, y, value }) => {
        return {
          x,
          y,
          value,
          radius: newRadius,
        };
      });
    }

    this.heatMap.setData({
      min: this._dataRange.min,
      max: this._dataRange.max,
      data,
    });
  }

  /**
   * 更新cesium显示
   */
  updateCesium() {
    if (this._destroyed) return;
    if (this._layer) {
      this.viewer.scene.imageryLayers.remove(this._layer);
    }
    this._updateHeatmap();
    const { west, sourth, east, north } = this._dataRange;
    const provider = new SingleTileImageryProvider({
      url: this.heatMap.getDataURL(),
      rectangle: Rectangle.fromDegrees(west, sourth, east, north),
      tileHeight: this._canvasConfig.height,
      tileWidth: this._canvasConfig.width,
    });
    this._layer = this.viewer.scene.imageryLayers.addImageryProvider(provider);
  }

  convertHeatItem(heatItems: HeatMapDataItem[]): DataPoint[] {
    const data = heatItems.map((item) => {
      const xy = this.convertPos(item.pos);
      return {
        x: +xy[0],
        y: +xy[1],
        value: item.value,
      };
    });
    return data;
  }

  convertPos(pos: number[]) {
    const [lon, lat] = pos;
    const { west, east, sourth, north } = this._dataRange;

    const x = ((lon - west) / (east - west)) * this._canvasConfig.width;
    const y = ((north - lat) / (north - sourth)) * this._canvasConfig.height;
    return [+x, +y];
  }

  private _getDataRange(data: HeatMapDataItem[]) {
    const result = {
      west: Math.min(...data.map((item) => item.pos[0])),
      east: Math.max(...data.map((item) => item.pos[0])),
      sourth: Math.min(...data.map((item) => item.pos[1])),
      north: Math.max(...data.map((item) => item.pos[1])),
      min: Math.min(...data.map((item) => item.value)),
      max: Math.max(...data.map((item) => item.value)),
    };
    const { west, sourth, east, north } = result;
    const tolerance = this._tolerance;
    this._dataRange = {
      ...result,
      west: Math.max(west - tolerance, -180),
      east: Math.min(east + tolerance, 180),
      sourth: Math.max(sourth - 1, -90),
      north: Math.min(180, north + tolerance),
    };
    return result;
  }

  remove() {
    let bool = false;
    this._viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd);
    if (this.layer && this._viewer) {
      bool = this._viewer.scene.imageryLayers.remove(this.layer);
      this.viewer.scene.requestRender();
    } else {
      bool = true
    }
    return bool;
  }

  destroy() {
    if (this._container) this._container.remove();
    this._destroyed = this.remove();
    return this._destroyed;
  }
}

/**
 * 创建一个标签
 */
function newDiv(style: Record<string, any>, parent: HTMLElement) {
  const div = document.createElement('div') as any;
  if (parent) parent.append(div);
  for (const k in style) {
    if (typeof style[k] === 'number') {
      div.style[k] = style[k] + 'px';
      continue;
    }
    div.style[k] = style[k];
  }
  return div;
}

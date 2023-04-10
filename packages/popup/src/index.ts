import {
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Occluder,
  SceneMode,
  SceneTransforms,
} from 'cesium';

import type { Viewer } from 'cesium';

interface CesiumPopupOptions {
  /** 经纬度坐标 */
  position: number[] | null;
  element: HTMLElement;
  offset?: [number, number];
}

export default class CesiumPopup {
  private _position: Cartesian3 | null;
  private _screenPosition = new Cartesian2();
  private _element: HTMLElement;
  private _viewer: Viewer;
  private _options: CesiumPopupOptions;
  private _destroyed = false;
  private _offset: [number, number];

  constructor(viewer: Viewer, options: CesiumPopupOptions) {
    this._viewer = viewer;
    this._options = options;
    const { position, element, offset } = options;
    if (!element) {
      throw Error('no element!');
    }
    this._position = position
      ? Cartesian3.fromDegrees(position[0], position[1], position[2])
      : null;
    this._element = element;
    this._offset = [offset?.[0] ?? 0, offset?.[1] ?? 0];
    this.addMapListener();
  }

  set position(val: number[] | null | undefined) {
    if (!val) {
      this.switchElementShow(false);
      this._position = null;
      this._options.position = null;
      return;
    }
    this._position = Cartesian3.fromDegrees(val[0], val[1], val[2]);
    this._options.position = val;
    this.setPosition();
  }

  get position() {
    return this._options.position;
  }

  get destroyed() {
    return this._destroyed;
  }

  switchElementShow(val: boolean) {
    if (this._element) {
      this._element.style.display = val ? 'block' : 'none';
    }
  }

  /**
   * 处理弹窗的屏幕位置
   */
  setPosition = () => {
    if (!this._position) return;
    if (this._viewer && this._position) {
      if (this._viewer.scene.mode === SceneMode.SCENE3D) {
        // 判断点是否在球的背面
        const cameraPosition = this._viewer.scene.camera.position;
        const littleSphere = new BoundingSphere(new Cartesian3(0, 0, 0), 6350000);
        const occluder = new Occluder(littleSphere, cameraPosition);
        const visible = occluder.isPointVisible(this._position);

        if (!visible) {
          this.switchElementShow(false);
          return;
        }
      }

      const screenPosition = SceneTransforms.wgs84ToWindowCoordinates(
        this._viewer.scene,
        this._position,
      );
      const { _element: element } = this;

      if (element && screenPosition) {
        if (this._screenPosition) {
          if (
            this._screenPosition.x === screenPosition.x &&
            this._screenPosition.y === screenPosition.y
          ) {
            return;
          }
        }

        this.switchElementShow(true);

        const x = screenPosition.x - element.clientWidth / 2 + this._offset[0];
        const y = screenPosition.y - element.clientHeight + this._offset[1];

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        this._screenPosition = screenPosition;
      }
    }
  };

  /**
   * 地图添加监听，用于更新弹窗的位置
   */
  private addMapListener() {
    this._viewer?.scene.postRender.addEventListener(this.setPosition);
  }

  destroy() {
    if (!this._viewer.isDestroyed()) {
      this._viewer.scene.postRender.removeEventListener(this.setPosition);
    }
    // @ts-ignore
    this.setPosition = undefined;
    this._destroyed = true;
  }
}

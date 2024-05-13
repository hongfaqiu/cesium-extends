import {
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Cartographic,
  getTimestamp,
  HeadingPitchRange,
  Math as CMath,
  Matrix4,
  Ray,
  SceneMode,
  Transforms,
} from 'cesium';
import { DomUtil, Widget } from '@cesium-extends/common';

import Icons from './icons';
import './styles/Compass.scss';

import type { Viewer } from 'cesium';

export interface CompassOptions {
  container?: Element;
  tips?: {
    inner?: string;
    outer?: string;
  };
  icons?: typeof Icons;
}

class Compass extends Widget {
  private _compassRectangle: DOMRect;
  private _outRing!: HTMLElement;
  private _gyro!: HTMLElement;
  private _rotation_marker!: HTMLElement;
  private _orbitCursorAngle: number;
  private _orbitCursorOpacity: number;
  private _orbitLastTimestamp: number;
  private _orbitFrame: Matrix4 | undefined;
  private _orbitIsLook: boolean;
  private _rotateInitialCursorAngle: number;
  private _rotateFrame: Matrix4 | undefined;
  private _mouseMoveHandle: ((e: any) => void) | undefined;
  private _mouseUpHandle: ((e: any) => void) | undefined;
  private _rotateInitialCameraAngle: number;
  private _options: CompassOptions;
  private _ifHover: boolean = false;
  private _icons: typeof Icons;

  constructor(viewer: Viewer, options: CompassOptions = {}) {
    super(viewer, DomUtil.create('div', 'cesium-compass', options.container ?? viewer.container));
    this._options = {
      ...options,
      icons: {
        ...Icons,
        ...options?.icons
      }
    };
    this._icons = this._options.icons as typeof Icons;
    this._wrapper.onmousedown = (e) => {
      this._handleMouseDown(e);
    };
    this._wrapper.ondblclick = () => {
      this._handleDoubleClick();
    };

    this._wrapper.onmouseover = () => {
      this._ifHover = true;
      this._postRenderHandler();
    };
    this._wrapper.onmouseleave = () => {
      this._ifHover = false;
      this._postRenderHandler();
    };
    this._compassRectangle = new DOMRect();
    this._orbitCursorAngle = 0;
    this._orbitCursorOpacity = 0.0;
    this._orbitLastTimestamp = 0;
    this._rotateInitialCameraAngle = 0;
    this._orbitFrame = undefined;
    this._orbitIsLook = false;
    this._rotateInitialCursorAngle = 0;
    this._rotateFrame = undefined;
    this._mouseMoveHandle = undefined;
    this._mouseUpHandle = undefined;

    this.enabled = true;
  }

  /**
   *
   * @private
   */
  protected _bindEvent() {
    this._viewer.scene.postRender.addEventListener(this._postRenderHandler, this);
  }

  /**
   *
   * @private
   */
  protected _unbindEvent() {
    this._viewer.scene.postRender.removeEventListener(this._postRenderHandler, this);
  }

  /**
   *
   * @private
   */
  private _postRenderHandler() {
    const heading = this._viewer.camera.heading;
    if (this._outRing)
      this._outRing.style.cssText = `
      transform :  ${this._ifHover ? 'scale(1.17)' : ''};
      -webkit-transform :  ${this._ifHover ? 'scale(1.17)' : ''};
      `;
    const innerSvg = this._outRing.children.item(0);
    if (innerSvg)
      (innerSvg as HTMLElement).style.cssText = `
    transform : rotate(-${heading}rad);
    -webkit-transform : rotate(-${heading}rad);
    `;
  }

  protected _mountContent() {
    const { tips } = this._options;
    DomUtil.create('div', 'out-ring-bg', this._wrapper);
    this._outRing = DomUtil.parseDom(this._icons.compass_outer, 'out-ring');
    this._wrapper.appendChild(this._outRing);
    this._gyro = DomUtil.parseDom(this._icons.compass_inner, 'gyro');
    this._wrapper.appendChild(this._gyro);
    this._outRing.title =
      tips?.outer ??
      'Drag outer ring: rotate view.\nDrag inner gyroscope: free orbit.\nDouble-click: reset view.\nTIP: You can also free orbit by holding the CTRL key and dragging the map.';
    this._gyro.title = tips?.inner ?? '';
    this._rotation_marker = DomUtil.parseDom(this._icons.compass_rotation_marker, 'rotation_marker');
    this._wrapper.appendChild(this._rotation_marker);
    this._rotation_marker.style.visibility = 'hidden';
    this._ready = true;
  }

  /**
   *
   * @param e
   * @returns {boolean}
   * @private
   */
  private _handleMouseDown(e: MouseEvent) {
    const scene = this._viewer.scene;
    if (scene.mode === SceneMode.MORPHING) {
      return true;
    }
    // @ts-ignore
    const rect = e.currentTarget?.getBoundingClientRect();
    if (!rect) return false;
    this._compassRectangle = rect;
    const maxDistance = this._compassRectangle.width / 2.0;
    const vector = this._getVector(e);
    const distanceFraction = Cartesian2.magnitude(vector) / maxDistance;
    if (distanceFraction < 50 / 145) {
      this._orbit(vector);
    } else if (distanceFraction < 1.0) {
      this._rotate(vector);
    } else {
      return true;
    }
    return true;
  }

  /**
   *
   * @param event
   * @returns {boolean}
   * @private
   */
  private _handleDoubleClick() {
    const scene = this._viewer.scene;
    const camera = scene.camera;
    const sscc = scene.screenSpaceCameraController;
    if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs) {
      return true;
    }
    if (scene.mode === SceneMode.COLUMBUS_VIEW && !sscc.enableTranslate) {
      return;
    }
    if (scene.mode === SceneMode.SCENE3D || scene.mode === SceneMode.COLUMBUS_VIEW) {
      if (!sscc.enableLook) {
        return;
      }
      if (scene.mode === SceneMode.SCENE3D) {
        if (!sscc.enableRotate) {
          return;
        }
      }
    }
    const center = this._getCameraFocus(true);
    if (!center) {
      return;
    }
    const cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(
      camera.positionCartographic,
    );
    const surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(center);
    const focusBoundingSphere = new BoundingSphere(center, 0);
    camera.flyToBoundingSphere(focusBoundingSphere, {
      offset: new HeadingPitchRange(
        0,
        CMath.PI_OVER_TWO - Cartesian3.angleBetween(surfaceNormal, camera.directionWC),
        Cartesian3.distance(cameraPosition, center),
      ),
      duration: 1.5,
    });
    return true;
  }

  /**
   *
   * @param inWorldCoordinates
   * @returns {Cartesian3|undefined}
   * @private
   */
  private _getCameraFocus(inWorldCoordinates: boolean) {
    let result: Cartesian3 | undefined = new Cartesian3();
    const scene = this._viewer.scene;
    const camera = scene.camera;
    if (scene.mode === SceneMode.MORPHING) {
      return undefined;
    }
    if (this._viewer.trackedEntity?.position) {
      result = this._viewer.trackedEntity.position.getValue(this._viewer.clock.currentTime);
    } else {
      const rayScratch = new Ray();
      rayScratch.origin = camera.positionWC;
      rayScratch.direction = camera.directionWC;
      result = scene.globe.pick(rayScratch, scene);
    }
    if (!result) {
      return undefined;
    }
    if (scene.mode === SceneMode.SCENE2D || scene.mode === SceneMode.COLUMBUS_VIEW) {
      result = camera.worldToCameraCoordinatesPoint(result);
      const unprojectedScratch = new Cartographic();
      if (inWorldCoordinates) {
        result = scene.globe.ellipsoid.cartographicToCartesian(
          scene.mapProjection.unproject(result, unprojectedScratch),
        );
      }
    } else {
      if (!inWorldCoordinates) {
        result = camera.worldToCameraCoordinatesPoint(result);
      }
    }
    return result;
  }

  /**
   *
   * @param vector
   * @private
   */
  private _orbit(vector: Cartesian2) {
    const scene = this._viewer.scene;
    const sscc = scene.screenSpaceCameraController;
    const camera = scene.camera;
    if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs) {
      return;
    }
    switch (scene.mode) {
      case SceneMode.COLUMBUS_VIEW:
        if (sscc.enableLook) {
          break;
        }
        if (!sscc.enableTranslate || !sscc.enableTilt) {
          return;
        }
        break;
      case SceneMode.SCENE3D:
        if (sscc.enableLook) {
          break;
        }
        if (!sscc.enableTilt || !sscc.enableRotate) {
          return;
        }
        break;
      case SceneMode.SCENE2D:
        if (!sscc.enableTranslate) {
          return;
        }
        break;
    }

    this._mouseMoveHandle = (e) => {
      this._orbitMouseMoveFunction(e);
    };
    this._mouseUpHandle = () => {
      this._orbitMouseUpFunction();
    };

    document.removeEventListener('mousemove', this._mouseMoveHandle, false);
    document.removeEventListener('mouseup', this._mouseUpHandle, false);

    this._orbitLastTimestamp = getTimestamp();

    if (this._viewer.trackedEntity) {
      this._orbitFrame = undefined;
      this._orbitIsLook = false;
    } else {
      const center = this._getCameraFocus(true);

      if (!center) {
        this._orbitFrame = Transforms.eastNorthUpToFixedFrame(
          camera.positionWC,
          scene.globe.ellipsoid,
        );
        this._orbitIsLook = true;
      } else {
        this._orbitFrame = Transforms.eastNorthUpToFixedFrame(center, scene.globe.ellipsoid);
        this._orbitIsLook = false;
      }
    }

    this._rotation_marker.style.visibility = 'visible';
    this._gyro.className += ' gyro-active';
    document.addEventListener('mousemove', this._mouseMoveHandle, false);
    document.addEventListener('mouseup', this._mouseUpHandle, false);
    this._viewer.clock.onTick.addEventListener(this._orbitTickFunction, this);
    this._updateAngleAndOpacity(vector, this._compassRectangle.width);
  }

  private _orbitTickFunction() {
    const scene = this._viewer.scene;
    const camera = this._viewer.camera;
    const timestamp = getTimestamp();
    const deltaT = timestamp - this._orbitLastTimestamp;
    const rate = ((this._orbitCursorOpacity - 0.5) * 2.5) / 1000;
    const distance = deltaT * rate;
    const angle = this._orbitCursorAngle + CMath.PI_OVER_TWO;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    let oldTransform;

    if (this._orbitFrame) {
      oldTransform = Matrix4.clone(camera.transform);
      camera.lookAtTransform(this._orbitFrame);
    }

    if (scene.mode === SceneMode.SCENE2D) {
      camera.move(
        new Cartesian3(x, y, 0),
        (Math.max(scene.canvas.clientWidth, scene.canvas.clientHeight) / 100) *
        camera.positionCartographic.height *
        distance,
      );
    } else {
      if (this._orbitIsLook) {
        camera.look(Cartesian3.UNIT_Z, -x);
        camera.look(camera.right, -y);
      } else {
        camera.rotateLeft(x);
        camera.rotateUp(y);
      }
    }
    if (this._orbitFrame && oldTransform) {
      camera.lookAtTransform(oldTransform);
    }
    this._orbitLastTimestamp = timestamp;
  }

  /**
   *
   * @param vector
   * @param compassWidth
   * @private
   */
  private _updateAngleAndOpacity(vector: Cartesian2, compassWidth: number) {
    const angle = Math.atan2(-vector.y, vector.x);
    this._orbitCursorAngle = CMath.zeroToTwoPi(angle - CMath.PI_OVER_TWO);
    const distance = Cartesian2.magnitude(vector);
    const maxDistance = compassWidth / 2.0;
    const distanceFraction = Math.min(distance / maxDistance, 1.0);
    this._orbitCursorOpacity = 0.5 * distanceFraction * distanceFraction + 0.5;
    this._rotation_marker.style.cssText = `
      transform: rotate(-${this._orbitCursorAngle}rad);
      opacity: ${this._orbitCursorOpacity}`;
  }

  /**
   *
   * @param e
   * @private
   */
  private _orbitMouseMoveFunction(e: MouseEvent) {
    this._updateAngleAndOpacity(this._getVector(e), this._compassRectangle.width);
  }

  /**
   *
   * @private
   */
  private _orbitMouseUpFunction() {
    if (!this._mouseMoveHandle || !this._mouseUpHandle) return;
    document.removeEventListener('mousemove', this._mouseMoveHandle, false);
    document.removeEventListener('mouseup', this._mouseUpHandle, false);
    this._viewer.clock.onTick.removeEventListener(this._orbitTickFunction, this);
    this._mouseMoveHandle = undefined;
    this._mouseUpHandle = undefined;
    this._rotation_marker.style.visibility = 'hidden';
    this._gyro.className = this._gyro.className.replace(' gyro-active', '');
  }

  /**
   *
   * @param vector
   * @private
   */
  private _rotate(vector: Cartesian2) {
    const scene = this._viewer.scene;
    const camera = scene.camera;
    const sscc = scene.screenSpaceCameraController;
    if (
      scene.mode === SceneMode.MORPHING ||
      scene.mode === SceneMode.SCENE2D ||
      !sscc.enableInputs
    ) {
      return;
    }
    if (
      !sscc.enableLook &&
      (scene.mode === SceneMode.COLUMBUS_VIEW ||
        (scene.mode === SceneMode.SCENE3D && !sscc.enableRotate))
    ) {
      return;
    }
    this._mouseMoveHandle = (e) => {
      this._rotateMouseMoveFunction(e);
    };
    this._mouseUpHandle = () => {
      this._rotateMouseUpFunction();
    };
    document.removeEventListener('mousemove', this._mouseMoveHandle, false);
    document.removeEventListener('mouseup', this._mouseUpHandle, false);
    this._rotateInitialCursorAngle = Math.atan2(-vector.y, vector.x);
    if (this._viewer.trackedEntity) {
      this._rotateFrame = undefined;
    } else {
      const center = this._getCameraFocus(true);
      if (
        !center ||
        (scene.mode === SceneMode.COLUMBUS_VIEW && !sscc.enableLook && !sscc.enableTranslate)
      ) {
        this._rotateFrame = Transforms.eastNorthUpToFixedFrame(
          camera.positionWC,
          scene.globe.ellipsoid,
        );
      } else {
        this._rotateFrame = Transforms.eastNorthUpToFixedFrame(center, scene.globe.ellipsoid);
      }
    }
    let oldTransform;
    if (this._rotateFrame) {
      oldTransform = Matrix4.clone(camera.transform);
      camera.lookAtTransform(this._rotateFrame);
    }
    this._rotateInitialCameraAngle = -camera.heading;
    if (this._rotateFrame && oldTransform) {
      camera.lookAtTransform(oldTransform);
    }
    document.addEventListener('mousemove', this._mouseMoveHandle, false);
    document.addEventListener('mouseup', this._mouseUpHandle, false);
  }

  private _rotateMouseMoveFunction(e: MouseEvent) {
    const camera = this._viewer.camera;
    const vector = this._getVector(e);
    const angle = Math.atan2(-vector.y, vector.x);
    const angleDifference = angle - this._rotateInitialCursorAngle;
    const newCameraAngle = CMath.zeroToTwoPi(this._rotateInitialCameraAngle - angleDifference);
    let oldTransform;
    if (this._rotateFrame) {
      oldTransform = Matrix4.clone(camera.transform);
      camera.lookAtTransform(this._rotateFrame);
    }
    const currentCameraAngle = -camera.heading;
    camera.rotateRight(newCameraAngle - currentCameraAngle);
    if (this._rotateFrame && oldTransform) {
      camera.lookAtTransform(oldTransform);
    }
  }

  private _rotateMouseUpFunction() {
    if (!this._mouseMoveHandle || !this._mouseUpHandle) return;
    document.removeEventListener('mousemove', this._mouseMoveHandle, false);
    document.removeEventListener('mouseup', this._mouseUpHandle, false);
    this._mouseMoveHandle = undefined;
    this._mouseUpHandle = undefined;
  }

  private _getVector(e: MouseEvent) {
    const compassRectangle = this._compassRectangle;
    const center = new Cartesian2(
      (compassRectangle.right - compassRectangle.left) / 2.0,
      (compassRectangle.bottom - compassRectangle.top) / 2.0,
    );
    const clickLocation = new Cartesian2(
      e.clientX - compassRectangle.left,
      e.clientY - compassRectangle.top,
    );
    const vector = new Cartesian2();
    Cartesian2.subtract(clickLocation, center, vector);
    return vector;
  }
}

export default Compass;

import { Cartesian3, Ellipsoid, IntersectionTests, Math as CMath, Ray, SceneMode } from 'cesium';

import Icons from './icons';
import './styles/zoom-controller.scss';
import { DomUtil, Widget } from '@cesium-extends/common';

import type { Camera, Scene, Viewer } from 'cesium';

interface ZoomControllerProps {
  container?: Element;
  home?: Cartesian3;
  tips?: {
    zoomIn?: string;
    zoomOut?: string;
    refresh?: string;
  };
}

class ZoomController extends Widget {
  private _zoomInEl!: HTMLElement;
  private _zoomOutEl!: HTMLElement;
  private _refreshEl!: HTMLElement;
  private _options: ZoomControllerProps;

  constructor(viewer: Viewer, options: ZoomControllerProps = {}) {
    super(
      viewer,
      DomUtil.create('div', 'cesium-zoom-controller', options.container ?? viewer.container),
    );
    this._options = options;
    this.enabled = true;
  }

  /**
   *
   * @param scene
   * @returns {Cartesian3}
   * @private
   */
  _getCameraFocus(scene: Scene) {
    const ray = new Ray(scene.camera.positionWC, scene.camera.directionWC);
    const intersections = IntersectionTests.rayEllipsoid(ray, Ellipsoid.WGS84);
    if (intersections) {
      return Ray.getPoint(ray, intersections.start);
    }
    // Camera direction is not pointing at the globe, so use the ellipsoid horizon point as
    // the focal point.
    return IntersectionTests.grazingAltitudeLocation(ray, Ellipsoid.WGS84);
  }

  /**
   *
   * @param camera
   * @param focus
   * @param scalar
   * @returns {Cartesian3}
   * @private
   */
  _getCameraPosition(camera: Camera, focus: Cartesian3, scalar: number) {
    const cartesian3Scratch = new Cartesian3();
    const direction = Cartesian3.subtract(focus, camera.position, cartesian3Scratch);
    const movementVector = Cartesian3.multiplyByScalar(direction, scalar, cartesian3Scratch);
    return Cartesian3.add(camera.position, movementVector, cartesian3Scratch);
  }

  /**
   *
   * @returns {boolean}
   * @private
   */
  _zoomIn() {
    const scene = this._viewer.scene;
    const camera = scene.camera;
    if (scene.mode === SceneMode.SCENE3D) {
      const focus = this._getCameraFocus(scene);
      const cameraPosition = this._getCameraPosition(camera, focus, 1 / 2);
      camera.flyTo({
        destination: cameraPosition,
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll,
        },
        duration: 0.5,
        convert: false,
      });
    } else {
      camera.zoomIn(camera.positionCartographic.height * 0.5);
    }
  }

  /**
   *
   * @private
   */
  _refresh() {
    if (this._options.home) {
      this._viewer.camera.flyTo({
        destination: this._options.home,
        orientation: {
          heading: CMath.toRadians(0),
          pitch: CMath.toRadians(-90),
          roll: CMath.toRadians(0),
        },
        duration: 1,
      });
    } else {
      this._viewer.camera.flyHome(1);
    }
  }

  /**
   *
   * @returns {boolean}
   * @private
   */
  _zoomOut() {
    const scene = this._viewer.scene;
    const camera = scene.camera;
    if (scene.mode === SceneMode.SCENE3D) {
      const focus = this._getCameraFocus(scene);
      const cameraPosition = this._getCameraPosition(camera, focus, -1);
      camera.flyTo({
        destination: cameraPosition,
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll,
        },
        duration: 0.5,
        convert: false,
      });
    } else {
      camera.zoomOut(camera.positionCartographic.height);
    }
  }

  /**
   *
   * @private
   */
  _mountContent() {
    const { tips } = this._options;
    this._zoomInEl = DomUtil.parseDom(
      Icons.controller_increase,
      'zoom-in cesium-toolbar-button cesium-button',
    );
    this._refreshEl = DomUtil.parseDom(
      Icons.controller_refresh,
      'refresh cesium-toolbar-button cesium-button',
    );
    this._zoomOutEl = DomUtil.parseDom(
      Icons.controller_decrease,
      'zoom-out cesium-toolbar-button cesium-button',
    );
    this._wrapper.appendChild(this._refreshEl);
    this._wrapper.appendChild(this._zoomInEl);
    this._wrapper.appendChild(this._zoomOutEl);
    this._zoomInEl.title = tips?.zoomIn ?? 'Zoom in';
    this._zoomOutEl.title = tips?.zoomOut ?? 'Zoom out';
    this._refreshEl.title = tips?.refresh ?? 'Reset zoom';
    this._zoomInEl.onclick = () => {
      this._zoomIn();
    };
    this._refreshEl.onclick = () => {
      this._refresh();
    };
    this._zoomOutEl.onclick = () => {
      this._zoomOut();
    };
    this._ready = true;
  }
}

export default ZoomController;

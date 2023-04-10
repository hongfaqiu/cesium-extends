import {
  Cartesian2,
  Cartesian3,
  Matrix4,
  SceneMode,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from 'cesium';

import type { Viewer } from 'cesium';

interface SyncViewProps {
  percentageChanged?: number;
}
export default class SyncViewer {
  private _leftViewer: Viewer;
  private _rightViewer: Viewer;
  private _options: SyncViewProps;
  private _leftHandler: ScreenSpaceEventHandler;
  private _rightHandler: ScreenSpaceEventHandler;
  private _currentOperation: 'left' | 'right' = 'left';
  private _originRate: {
    left: number;
    right: number;
  };
  private _destroyed = false;
  synchronous: boolean;

  get isDestory() {
    return this._destroyed;
  }

  constructor(leftViewer: Viewer, rightViewer: Viewer, options: SyncViewProps = {}) {
    if (!leftViewer || !rightViewer) throw Error("viewer can't be empty!");
    this._leftViewer = leftViewer;
    this._rightViewer = rightViewer;
    this._options = options;

    this._leftHandler = new ScreenSpaceEventHandler(leftViewer.scene.canvas);
    this._rightHandler = new ScreenSpaceEventHandler(rightViewer.scene.canvas);
    this.synchronous = true;
    const leftCamera = this._leftViewer.camera;
    const rightCamera = this._rightViewer.camera;
    this._originRate = {
      left: leftCamera.percentageChanged,
      right: rightCamera.percentageChanged,
    };
    leftCamera.percentageChanged = this._options.percentageChanged ?? 0.01;
    rightCamera.percentageChanged = this._options.percentageChanged ?? 0.01;
    this.start();
  }

  getViewPoint(viewer: Viewer) {
    const camera = viewer.camera;
    // The center of the view is the point that the 3D camera is focusing on
    const viewCenter = new Cartesian2(
      Math.floor(viewer.canvas.clientWidth / 2),
      Math.floor(viewer.canvas.clientHeight / 2),
    );
    // Given the pixel in the center, get the world position
    const worldPosition = viewer.scene.camera.pickEllipsoid(viewCenter);

    return {
      worldPosition,
      height: camera.positionCartographic.height,
      destination: camera.position.clone(),
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll,
      },
    };
  }

  private leftChangeEvent = () => {
    if (this._currentOperation === 'left' && this.synchronous) {
      const viewPoint = this.getViewPoint(this._leftViewer);
      if (this._leftViewer.scene.mode !== SceneMode.SCENE3D && viewPoint.worldPosition) {
        this._rightViewer.scene.camera.lookAt(
          viewPoint.worldPosition,
          new Cartesian3(0, 0, viewPoint.height),
        );
      } else {
        this._rightViewer.scene.camera.setView({
          destination: viewPoint.destination,
          orientation: viewPoint.orientation,
        });
      }
    }
  };

  private rightChangeEvent = () => {
    if (this._currentOperation === 'right' && this.synchronous) {
      const viewPoint = this.getViewPoint(this._rightViewer);
      if (this._rightViewer.scene.mode !== SceneMode.SCENE3D && viewPoint.worldPosition) {
        this._leftViewer.scene.camera.lookAt(
          viewPoint.worldPosition,
          new Cartesian3(0, 0, viewPoint.height),
        );
      } else {
        this._leftViewer.scene.camera.setView({
          destination: viewPoint.destination,
          orientation: viewPoint.orientation,
        });
      }
    }
  };

  private leftViewerMouseMove = () => {
    this._currentOperation = 'left';
    // 解除lookAt视角锁定
    if (this._rightViewer.scene.mode !== SceneMode.MORPHING)
      this._rightViewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
  };

  private rightViewerMouseMove = () => {
    this._currentOperation = 'right';
    // 解除lookAt视角锁定
    if (this._leftViewer.scene.mode !== SceneMode.MORPHING)
      this._leftViewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
  };

  start() {
    this.synchronous = true;
    // 视图同步

    this._leftHandler.setInputAction(this.leftViewerMouseMove, ScreenSpaceEventType.MOUSE_MOVE);
    this._rightHandler.setInputAction(this.rightViewerMouseMove, ScreenSpaceEventType.MOUSE_MOVE);

    this._leftViewer.camera.changed.addEventListener(this.leftChangeEvent);
    this._rightViewer.camera.changed.addEventListener(this.rightChangeEvent);
  }

  destroy() {
    this.synchronous = false;
    if (!this._leftViewer.isDestroyed()) {
      this._leftViewer.camera.percentageChanged = this._originRate.left;
      this._leftViewer.camera.changed.removeEventListener(this.leftChangeEvent);
      this._leftHandler.destroy();
    }
    if (!this._rightViewer.isDestroyed()) {
      this._rightViewer.camera.percentageChanged = this._originRate.right;
      this._rightViewer.camera.changed.removeEventListener(this.rightChangeEvent);
      this._rightHandler.destroy();
    }
    this._destroyed = true;
  }
}

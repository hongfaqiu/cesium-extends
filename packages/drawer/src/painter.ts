import type { Cartesian2, Cartesian3, PointGraphics, Viewer } from 'cesium';
import { Entity } from 'cesium';
import { defaultOptions } from '.';

interface DrawOption {
  viewer: Viewer;
  terrain?: boolean;
  model?: boolean;
}

/**
 * @desc 画笔工具
 */
export default class Painter {
  _viewer: Viewer;
  _terrain: boolean | undefined;
  _model?: boolean;

  _activeShapePoints: Cartesian3[] = [];

  _dynamicShapeEntity: Entity | undefined;

  _breakPointEntities: Entity[] = [];

  _addedEntitys: Entity[] = [];

  constructor(options: DrawOption) {
    this._viewer = options.viewer;
    this._terrain = options.terrain;
    this._model = options.model;
  }

  /**
   * 将entity添加到视图
   * @param {Entity | Entity.ConstructorOptions} entity entity实体或者构造参数
   * @returns {Entity} entity
   */
  addView(entity: Entity | Entity.ConstructorOptions): Entity {
    const newEntity = this._viewer.entities.add(entity);
    this._viewer.scene.requestRender();
    this._addedEntitys.push(newEntity);
    return newEntity;
  }

  /**
   * 移除entity
   * @param {Entity} entity entity实体
   * @returns {boolean} 是否移除成功
   */
  removeEntity(entity: Entity): boolean {
    this._addedEntitys = this._addedEntitys.filter((item) => item !== entity);
    const bool = this._viewer.entities.remove(entity);
    this._viewer.scene.requestRender();
    return bool;
  }

  createPoint(
    worldPosition: Cartesian3,
    options?: PointGraphics.ConstructorOptions,
  ): Entity {
    return new Entity({
      position: worldPosition,
      point: {
        ...defaultOptions.dynamicGraphicsOptions?.POINT,
        ...options,
      },
    });
  }

  pickCartesian3(position: Cartesian2): Cartesian3 | undefined {
    // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
    // we get the correct point when mousing over terrain.
    if (this._model) {
      return this._viewer.scene.pickPosition(position);
    }
    if (this._terrain) {
      const ray = this._viewer.camera.getPickRay(position);
      if (ray) return this._viewer.scene.globe.pick(ray, this._viewer.scene);
    } else {
      return this._viewer.camera.pickEllipsoid(position);
    }
    return undefined;
  }

  /**
   * 重置绘画结果，清空间断点和动态图形
   */
  reset(): void {
    if (this._dynamicShapeEntity) {
      this._viewer.entities.remove(this._dynamicShapeEntity);
      this._dynamicShapeEntity = undefined;
    }

    while (this._breakPointEntities.length) {
      const entity = this._breakPointEntities.pop();
      if (entity) this._viewer.entities.remove(entity);
    }

    this._activeShapePoints = [];
  }

  clear() {
    this.reset();
    while (this._addedEntitys.length) {
      const entity = this._addedEntitys.pop();
      if (entity) this._viewer.entities.remove(entity);
    }
  }
}

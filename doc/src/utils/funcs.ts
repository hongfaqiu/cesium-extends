import { Cartesian2, Cartesian3, Viewer, defined, Math as CMath } from "cesium";

/**
 * Cartesian2 坐标转经纬度
 */
export function CartesiantoLonlat(
  cartesian: Cartesian2 | Cartesian3 | undefined,
  viewer: Viewer,
  height?: number,
) {
  const scene = viewer.scene;
  let pos = undefined;
  let cartesian3: Cartesian3 | undefined;

  if (cartesian instanceof Cartesian2) {
    const pickedObject = scene.pick(cartesian);
    if (scene.pickPositionSupported && defined(pickedObject)) {
      cartesian3 = viewer.scene.pickPosition(cartesian);
    } else {
      cartesian3 = viewer.camera.pickEllipsoid(cartesian);
    }
  } else {
    cartesian3 = cartesian;
  }

  if (cartesian3) {
    const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(
      cartesian3 as Cartesian3,
    );
    // 将弧度转为度的十进制度表示
    const lon = +CMath.toDegrees(cartographic.longitude);
    const lat = +CMath.toDegrees(cartographic.latitude);
    pos = [lon, lat, height ?? cartographic.height];
  }
  return pos;
}

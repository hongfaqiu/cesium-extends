import { Viewer, Cartesian3, Math as CMath, Ion } from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';

Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGQwZTM2MC00NjkzLTRkZTgtYTU5MS0xZTA1NTljYWQyN2UiLCJpZCI6NTUwODUsImlhdCI6MTYyMDM5NjQ3NH0.lu_JBwyngYucPsvbCZt-xzmzgfwEKwcRXiYs5uV8uTM';

/**
 * 初始化地图
 * @param cesiumContainer 地图容器div id
 */
export function initMap(
  cesiumContainer: string,
  options: {
    home?: number[];
  } = {},
) {
  const viewer: Viewer = new Viewer(cesiumContainer, {
    baseLayerPicker: false, // 图层选择器
    animation: false, // 左下角仪表
    fullscreenButton: false, // 全屏按钮
    geocoder: false, // 右上角查询搜索
    infoBox: false, // 信息框
    homeButton: false, // home按钮
    sceneModePicker: true, // 3d 2d选择器
    selectionIndicator: false, //
    timeline: false, // 时间轴
    navigationHelpButton: false, // 右上角帮助按钮
    shouldAnimate: true,
    useBrowserRecommendedResolution: false,
  });

  viewer.scene.fog.density = 0.0001; // 雾气中水分含量
  viewer.scene.globe.enableLighting = false;
  viewer.scene.moon.show = false; // 不显示月球
  // @ts-ignore
  viewer._cesiumWidget._creditContainer.style.display = 'none';
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.scene.skyBox.show = false;

  const home = options.home ?? [116.3, 39.9, 15000000];

  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(home[0], home[1], home[2]),
    orientation: {
      heading: CMath.toRadians(0),
      pitch: CMath.toRadians(-90),
      roll: CMath.toRadians(0),
    },
  });

  return viewer;
}

import {
  Viewer,
  Cartesian3,
  Math as CMath,
  DataSource,
  GeoJsonDataSource,
  ArcGisMapServerImageryProvider,
  ImageryLayer,
} from 'cesium';
import './style.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import {
  GeoJsonRenderConfig,
  updateDataSourcePosition,
  renderGeoJson,
  GeoJsonPrimitiveLayer,
  renderPrimitiveGeoJson,
} from 'cesium-extends';

/**
 * 初始化地图
 * @param cesiumContainer 地图容器div id
 */
function initMap(
  cesiumContainer: string,
  options: {
    home?: number[];
  } = {},
) {
  const viewer: Viewer = new Viewer(cesiumContainer, {
    baseLayer: ImageryLayer.fromProviderAsync(
      ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        {
          enablePickFeatures: false,
        },
      ),
      {},
    ),
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
    maximumRenderTimeChange: Infinity, // 静止时不刷新,减少系统消耗
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

async function addGeojsonByDataSource(
  viewer: Viewer,
  url: string,
  config: GeoJsonRenderConfig,
) {
  const dataSource: DataSource = await GeoJsonDataSource.load(url);
  updateDataSourcePosition(dataSource);
  await renderGeoJson(dataSource, config);
  await viewer.dataSources.add(dataSource);
  return dataSource;
}

async function addGeojsonByPrimitive(
  viewer: Viewer,
  url: string,
  config: GeoJsonRenderConfig,
) {
  const primitiveLayer = await GeoJsonPrimitiveLayer.load(url);
  await renderPrimitiveGeoJson(primitiveLayer, config);
  viewer.scene.primitives.add(primitiveLayer.primitiveCollection);
  viewer.scene.primitives.lowerToBottom(primitiveLayer.primitiveCollection);

  return primitiveLayer;
}

const config: GeoJsonRenderConfig = {
  type: 'point',
  style: {
    sprite: {
      url: '/sprite/sprite@2x.png',
    },
    type: 'bubble',
    config: {
      field: 'value',
      'fill-type': 'multi',
      'section-type': 'auto',
      'section-num': 3,
      'label-size': [20, 40],
      'label-type': 'icon',
      'icon-image': 'aerialway',
    },
  },
};

const viewer = initMap('cesiumContainer');
addGeojsonByDataSource(viewer, '/test.geojson', config).then((res) => {
  viewer.zoomTo(res);
});

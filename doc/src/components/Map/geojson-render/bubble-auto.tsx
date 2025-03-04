import { DataSource, Viewer } from 'cesium';
import React, { useEffect } from 'react';
import {
  renderGeoJson,
  GeoJsonPrimitiveLayer,
  renderPrimitiveGeoJson,
  GeoJsonStyle,
  GeoJsonRenderConfig,
  updateDataSourcePosition,
} from 'cesium-extends';
import { GeoJsonDataSource } from 'cesium';

import { initMap } from '@/utils/initMap';

const config: GeoJsonRenderConfig = {
  type: 'point',
  style: {
    type: 'bubble',
    config: {
      field: 'MAG',
      'fill-type': 'multi',
      'section-type': 'average',
      'section-num': 10,
      'label-size': [2, 40],
      'circle-stroke-width': 1,
      'circle-stroke-color': 'white',
      colors: [
        '#313695',
        '#4575b4',
        '#74add1',
        '#abd9e9',
        '#e0f3f8',
        '#ffffbf',
        '#fee090',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026',
      ],
    },
  },
};

export async function addGeojsonByDataSource(
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

export async function addGeojsonByPrimitive(
  viewer: Viewer,
  url: string,
  config: GeoJsonRenderConfig,
) {
  const primitiveLayer = await GeoJsonPrimitiveLayer.load(url, {
    depthTest: true,
  });
  await renderPrimitiveGeoJson(primitiveLayer, config);
  viewer.scene.primitives.add(primitiveLayer.primitiveCollection);
  viewer.scene.primitives.lowerToBottom(primitiveLayer.primitiveCollection);

  return primitiveLayer;
}

let viewer: Viewer;
const Map: React.FC = () => {
  useEffect(() => {
    viewer = initMap('cesiumContainer');
    addGeojsonByPrimitive(viewer, '/earthquack.geojson', config);

    return () => {
      viewer?.destroy();
    };
  }, []);

  return <div id="cesiumContainer" />;
};

export default Map;

import { DataSource, Viewer } from 'cesium';
import React, { useEffect } from 'react';
import { renderGeoJson, GeoJsonPrimitiveLayer, renderPrimitiveGeoJson, GeoJsonStyle, GeoJsonRenderConfig, updateDataSourcePosition } from 'cesium-extends';
import { GeoJsonDataSource } from 'cesium';

import { initMap } from '../../utils/initMap';

const primitiveObj = new GeoJsonPrimitiveLayer();

const config: GeoJsonRenderConfig = {
  type: 'point',
  style: {
    type: 'bubble',
    config: {
      field: 'MAG',
      'fill-type': 'multi',
      'section-type': 'auto',
      'section-num': 10,
      'label-size': [2, 40],
      'circle-stroke-width': 1,
      'circle-stroke-color': 'white'
    }
  }
}

async function addGeojsonByDataSource(viewer: Viewer, url: string, config: GeoJsonRenderConfig) {
  const dataSource: DataSource = await GeoJsonDataSource.load(url);
  updateDataSourcePosition(dataSource);
  await renderGeoJson(dataSource, config);
  await viewer.dataSources.add(dataSource);
  return dataSource;
}

async function addGeojsonByPrimitive(viewer: Viewer, url: string, config: GeoJsonRenderConfig) {
  const primitiveLayer = await primitiveObj.load(url);
  await renderPrimitiveGeoJson(primitiveObj, config)
  viewer.scene.primitives.add(primitiveLayer.primitiveCollection);
  viewer.scene.primitives.lowerToBottom(primitiveLayer.primitiveCollection);

  return primitiveLayer;
}

let viewer: Viewer;
const Map: React.FC = () => {

  useEffect(() => {
    viewer = initMap('cesiumContainer')
    addGeojsonByDataSource(viewer, '/earthquack.geojson', config)

    return () => {
      viewer?.destroy()
    }
  }, []);

  return <div id="cesiumContainer"/>;
};

export default Map;

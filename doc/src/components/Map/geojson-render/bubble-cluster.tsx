import { Viewer } from 'cesium';
import React, { useEffect } from 'react';
import { GeoJsonRenderConfig } from 'cesium-extends';

import { initMap } from '@/utils/initMap';
import { addGeojsonByDataSource } from './bubble-auto';

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
      'circle-stroke-color': 'white',
    },
    cluster: {
      enable: true,
      pixelRange: 50,
      minimumClusterSize: 2,
      alpha: 0.7,
      scale: 0.7,
      colorBar: [
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
      maxNum: 1000,
    },
  },
};

let viewer: Viewer;
const Map: React.FC = () => {
  useEffect(() => {
    viewer = initMap('cluster');
    addGeojsonByDataSource(viewer, '/earthquack.geojson', config);

    return () => {
      viewer?.destroy();
    };
  }, []);

  return <div id="cluster" />;
};

export default Map;

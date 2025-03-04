import { Viewer } from 'cesium';
import React, { useEffect } from 'react';
import { GeoJsonRenderConfig } from 'cesium-extends';

import { initMap } from '@/utils/initMap';
import { addGeojsonByDataSource, addGeojsonByPrimitive } from './bubble-auto';

const config: GeoJsonRenderConfig = {
  type: 'point',
  style: {
    type: 'value',
    config: {
      field: 'MAG',
      'label-size': 10,
      color: [
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
    symbol: {
      'text-field': 'MAG',
      'text-font': '10px Arial',
      'text-color': '#fff',
      'text-halo-color': '#000',
      'text-offsetX': 10,
      'text-offsetY': 10,
    },
  },
};

let viewer: Viewer;
const Map: React.FC = () => {
  useEffect(() => {
    viewer = initMap('point-value');
    addGeojsonByPrimitive(viewer, '/earthquack.geojson', config);

    return () => {
      viewer?.destroy();
    };
  }, []);

  return <div id="point-value" />;
};

export default Map;

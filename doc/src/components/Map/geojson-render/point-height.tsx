import { Viewer } from 'cesium';
import React, { useEffect } from 'react';
import { GeoJsonRenderConfig } from 'cesium-extends';

import { initMap } from '@/utils/initMap';
import { addGeojsonByDataSource, addGeojsonByPrimitive } from './bubble-auto';

const config: GeoJsonRenderConfig = {
  type: 'point',
  style: {
    type: 'height',
    config: {
      field: 'MAG',
      'section-type': 'natural',
      'height-range': [100, 2000],
      'radius-size': 30,
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
  },
};

let viewer: Viewer;
const Map: React.FC = () => {
  useEffect(() => {
    viewer = initMap('point-height');
    addGeojsonByPrimitive(viewer, '/earthquack.geojson', config);

    return () => {
      viewer?.destroy();
    };
  }, []);

  return <div id="point-height" />;
};

export default Map;

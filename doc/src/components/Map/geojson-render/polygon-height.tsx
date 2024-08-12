import { Viewer, Cartesian3, Math as CMath } from 'cesium';
import React, { useEffect } from 'react';
import {
  GeoJsonPrimitiveLayer,
  renderPrimitiveGeoJson,
  GeoJsonRenderConfig,
} from 'cesium-extends';

import { initMap } from '@/utils/initMap';

const config: GeoJsonRenderConfig = {
  type: 'polygon',
  style: {
    type: 'height',
    config: {
      field: 'est',
      color: [
        '#053061',
        '#144c87',
        '#2467a6',
        '#3680b9',
        '#5199c6',
        '#75b2d4',
        '#9ac8e0',
        '#bcdaea',
        '#d7e8f0',
        '#ebeff1',
        '#f6ece7',
        '#fadfcf',
        '#f9c8b0',
        '#f3ac8e',
        '#e88b6f',
        '#d86755',
        '#c64240',
        '#ae2330',
        '#8e0e26',
        '#67001f',
      ],
      'section-type': 'natural',
      'outline-color': 'transparent',
      'height-range': [0, 500],
    },
  },
};

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

let viewer: Viewer;
const Map: React.FC = () => {
  useEffect(() => {
    viewer = initMap('cesiumContainer2');
    addGeojsonByPrimitive(
      viewer,
      'https://resource.deep-time.org/resource/testdem/California_heat.geojson',
      config,
    );

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(-126, 31, 1000000),
      orientation: {
        heading: CMath.toRadians(45),
        pitch: CMath.toRadians(-45),
        roll: CMath.toRadians(0),
      },
    });

    return () => {
      viewer?.destroy();
    };
  }, []);

  return <div id="cesiumContainer2" />;
};

export default Map;

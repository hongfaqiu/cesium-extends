import { Cartesian3, Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';
import { ZoomControl } from 'cesium-extends';

import { initMap } from '../../utils/initMap';

interface MapProps {}

let viewer: Viewer;
const Map: React.FC<MapProps> = () => {
  const ZoomControlObj = useRef<ZoomControl>();

  const reset = () => {
    ZoomControlObj.current?.destroy();
    ZoomControlObj.current = undefined;
  };

  useEffect(() => {
    viewer = initMap('cesiumContainer')

    ZoomControlObj.current = new ZoomControl(viewer, {
      home: Cartesian3.fromDegrees(116.3, 39.9, 15000000)
    });

    return () => {
      reset();
      viewer?.destroy()
    }
  }, []);

  return (
    <div id="cesiumContainer"/>
  );
};

export default Map;

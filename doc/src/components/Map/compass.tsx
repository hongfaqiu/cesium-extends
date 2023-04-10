import { Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';
import { Compass } from 'cesium-extends';

import { initMap } from '../../utils/initMap';

interface MapProps {}

let viewer: Viewer;
const Map: React.FC<MapProps> = () => {
  const CompassObj = useRef<Compass>();

  const reset = () => {
    CompassObj.current?.destroy();
    CompassObj.current = undefined;
  };

  useEffect(() => {
    viewer = initMap('cesiumContainer')

    CompassObj.current = new Compass(viewer);

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

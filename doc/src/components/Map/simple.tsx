import { Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';

import { initMap } from '../../utils/initMap';
import './index.less';

interface MapProps {}

const Map: React.FC<MapProps> = () => {
  const viewer = useRef<Viewer>()

  useEffect(() => {
    viewer.current = initMap('cesiumContainer')

    return () => {
      viewer.current?.destroy()
    }
  }, []);

  return <div id="cesiumContainer"/>;
};

export default Map;

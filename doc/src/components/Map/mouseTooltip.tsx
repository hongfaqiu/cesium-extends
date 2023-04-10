import { Viewer } from 'cesium';
import React, { useEffect } from 'react';
import { MouseTooltip } from 'cesium-extends';

import { initMap } from '../../utils/initMap';
import './index.less'

interface MapProps {}

let viewer: Viewer;
let mouseTooltip: MouseTooltip;
const Map: React.FC<MapProps> = () => {

  useEffect(() => {
    viewer = initMap('cesiumContainer')

    mouseTooltip = new MouseTooltip(viewer);
    mouseTooltip.content = '这是一个跟随鼠标的tooltip'
    mouseTooltip.show()

    return () => {
      viewer?.destroy()
    }
  }, []);

  return <div id="cesiumContainer"/>;
};

export default Map;

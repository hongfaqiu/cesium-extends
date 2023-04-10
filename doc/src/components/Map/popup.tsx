import { Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';
import { Popup } from 'cesium-extends';

import { initMap } from '../../utils/initMap';
import './index.less'
import NowDate from '../NowDate';
import PopupComponent from '../PopupComponent';

interface MapProps {}

let viewer: Viewer;
const Map: React.FC<MapProps> = () => {
  const PopupObj = useRef<Popup>();

  const reset = () => {
    PopupObj.current?.destroy();
    PopupObj.current = undefined;
  };

  useEffect(() => {
    viewer = initMap('cesiumContainer')

    reset();

    const element = document.getElementById('popup');

    if (element) {
      PopupObj.current = new Popup(viewer, {
        position: [120, 30],
        element,
      });

    }

    return () => {
      reset();
      viewer?.destroy()
    }
  }, []);

  return (
    <div id="cesiumContainer">
      <PopupComponent id='popup'>
        <NowDate/>
      </PopupComponent>
    </div>
  );
};

export default Map;

import { Cartesian3, Color, Viewer } from 'cesium';
import React, { useEffect } from 'react';
import { Subscriber } from 'cesium-extends';

import { initMap } from '../../utils/initMap';

interface MapProps {}

let viewer: Viewer;
let subscriber: Subscriber;
const Map: React.FC<MapProps> = () => {

  const addEntity = (viewer: Viewer) => {
    return viewer.entities.add({
      name: "Blue box",
      position: Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
      box: {
        dimensions: new Cartesian3(400000.0, 300000.0, 500000.0),
        material: Color.BLUE,
      },
    });
  }

  useEffect(() => {
    viewer = initMap('cesiumContainer')

    subscriber = new Subscriber(viewer, {
      pickResult: {
        enable: true,
      },
    });

    // 添加监听事件
    subscriber.addExternal((move, result) => {
      if (result) {
        viewer.canvas.style.cursor = 'pointer'
      } else {
        viewer.canvas.style.cursor = 'default';
      }
    }, 'MOUSE_MOVE')

    const entity = addEntity(viewer)
    viewer.zoomTo(viewer.entities);

    return () => {
      viewer?.destroy()
    }
  }, []);

  return <div id="cesiumContainer"/>;
};

export default Map;

import { Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';

import { initMap } from '@/utils/initMap';
import { StartOption, Drawer } from 'cesium-extends';
import './index.less';
import { CartesiantoLonlat } from '@/utils/funcs';

interface MapProps {}

const Map: React.FC<MapProps> = () => {
  const viewer = useRef<Viewer>()
  const DrawerTool = useRef<Drawer>();

  useEffect(() => {
    viewer.current = initMap('cesiumContainer')
    DrawerTool.current = new Drawer(viewer.current, {
      tips: {
        init: '点击绘制',
        start: '左键添加点，右键移除点，双击结束绘制',
      }
    });

    return () => {
      DrawerTool.current?.destroy();
      DrawerTool.current = undefined;
      viewer.current?.destroy()
    }
  }, []);

  const startDraw = (type: StartOption['type']) => {
    if (!viewer.current) return;

    DrawerTool.current?.start({
      type: type,
      onEnd: (entity, positions) => {
        console.log(entity, positions.map(pos => CartesiantoLonlat(pos, viewer.current as Viewer)))
      },
    });
  }

  const clear = () => {
    DrawerTool.current?.reset();
  }

  const operations: {
    type: StartOption['type'],
    label: string;
  }[] = [
    {
      type: 'POINT',
      label: '点'
    },
    {
      type: 'POLYLINE',
      label: '线'
    },
    {
      type: 'POLYGON',
      label: '多边形'
    },
    {
      type: 'CIRCLE',
      label: '圆形'
    },
    {
      type: 'RECTANGLE',
      label: '矩形'
    },
  ]

  return <div id="cesiumContainer">
    <div className='draw-tools'>
      {operations.map((op) => (
        <button key={op.type} onClick={() => startDraw(op.type)}>
          {op.label}
        </button>
      ))}
      <button onClick={clear}>清除</button>
    </div>
  </div>
};

export default Map;

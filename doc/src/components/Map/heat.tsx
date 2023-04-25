import { Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';

import { initMap } from '../../utils/initMap';
import './index.less';
import { HeatMapLayer } from 'cesium-extends';

interface MapProps { }

function generateHeatmapData(valRange: number[], lonRange: number[], latRange: number[], len: number) {
  const data = [];
  for (let i = 0; i < len; i++) {
    const lon = Math.random() * (lonRange[1] - lonRange[0]) + lonRange[0];
    const lat = Math.random() * (latRange[1] - latRange[0]) + latRange[0];
    const value = Math.floor(Math.random() * (valRange[1] - valRange[0] + 1)) + valRange[0];
    data.push({ pos: [lon, lat], value });
  }
  return data;
}

const Map: React.FC<MapProps> = () => {
  const viewer = useRef<Viewer>()
  const heatMap = useRef<HeatMapLayer>();

  useEffect(() => {
    viewer.current = initMap('cesiumContainer', {
      home: [120.5, 30.5, 200000]
    })

    // 热力图的数据
    const valRange = [0, 100];
    const lonRage = [120, 121];
    const latRage = [30, 31];
    let len = 200;

    // 创建热力图层
    const heatmap = new HeatMapLayer({
      viewer: viewer.current,
      data: generateHeatmapData(valRange, lonRage, latRage, len),
      heatStyle: {
        radius: 100,
        maxOpacity: 0.5,
        blur: 0.8,
      },
    });

    // 动态更新热力图数据
    setInterval(() => {
      heatmap.data = generateHeatmapData(valRange, lonRage, latRage, len);
    }, 2000);

    heatMap.current = heatmap

    return () => {
      // 移除热力图
      heatMap.current?.destroy();
      viewer.current?.destroy();
    }
  }, []);

  return <div id="cesiumContainer"/>;
};

export default Map;

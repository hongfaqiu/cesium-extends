import { Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';
import { SyncViewer } from 'cesium-extends';

import { initMap } from '../../utils/initMap';

interface MapProps {}

const Map: React.FC<MapProps> = () => {
  const leftViewer = useRef<Viewer>()
  const rightViewer = useRef<Viewer>()
  const syncViewer = useRef<SyncViewer>()

  useEffect(() => {
    leftViewer.current = initMap('left-container')
    rightViewer.current = initMap('right-container')

    if (leftViewer.current && rightViewer.current) {
      syncViewer.current = new SyncViewer(leftViewer.current, rightViewer.current);
      syncViewer.current.start();
    }

    return () => {
      leftViewer.current?.destroy()
      rightViewer.current?.destroy()
      syncViewer.current?.destroy()
    }
  }, []);

  return (
    <div className='sync-viewer' style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div id="left-container" style={{width: '50%', height: '100%'}}/>
      <div id="right-container" style={{width: '50%', height: '100%'}}/>
    </div>
  );
};

export default Map;

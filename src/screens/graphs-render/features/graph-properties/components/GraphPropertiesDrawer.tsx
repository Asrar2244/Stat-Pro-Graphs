/**
 * Main drawer container for graph properties
 */

import { FC, useRef, useEffect, useState } from 'react';
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  Button,
} from '@fluentui/react-components';
import { IoCloseOutline } from 'react-icons/io5';
import { useGraphPropertiesClasses } from '../../../styles/use-graph-properties-style';
import { GraphPropertiesProps } from '../types';
import { GraphPropertiesAccordion } from './GraphPropertiesAccordion';

export const GraphPropertiesDrawer: FC<GraphPropertiesProps> = ({ properties }) => {
  const classes = useGraphPropertiesClasses();
  const [drawerWidth, setDrawerWidth] = useState<number>(560);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const minWidth = 320;
  const maxWidth = 900;

  // Handle drawer resizing
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = startXRef.current - e.clientX; // dragging left increases width
      const next = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
      setDrawerWidth(next);
    };
    
    const onMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const beginDrag = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = drawerWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  if (!properties.showGraphProperties) {
    return null;
  }

  return (
    <InlineDrawer 
      open={properties.showGraphProperties} 
      position="end" 
      className={classes.drawerContainer}
      style={{ width: drawerWidth }}
    >
      <DrawerHeader className={classes.drawerHeader}>
        <DrawerHeaderTitle>Graph Properties</DrawerHeaderTitle>
        <Button
          appearance="transparent"
          icon={<IoCloseOutline />}
          onClick={properties.toggleGraphProperties}
          className={classes.closeButton}
        />
      </DrawerHeader>
      
      <DrawerBody className={classes.drawerBody} style={{ position: 'relative', height: '100%', overflowY: 'auto' }}>
        {/* Left-edge resizer */}
        <div
          onMouseDown={beginDrag}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: 6,
            cursor: 'ew-resize',
            transform: 'translateX(-3px)',
          }}
        />
        
        <div className={classes.propertiesContainer}>
          <GraphPropertiesAccordion properties={properties} />
        </div>
      </DrawerBody>
    </InlineDrawer>
  );
};

import React from 'react';
import { Button } from '@fluentui/react-components';

interface IPrintReportModalProps {
  open: boolean;
  closeModal: () => void;
}

export const PrintReportModal: React.FC<IPrintReportModalProps> = ({ open, closeModal }) => {
  if (!open) return null;
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        minWidth: '300px'
      }}>
        <h3>Print Report</h3>
        <p>Print report functionality will be implemented here.</p>
        <Button onClick={closeModal}>Close</Button>
      </div>
    </div>
  );
}; 
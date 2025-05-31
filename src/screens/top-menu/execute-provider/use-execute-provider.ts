import { useState, useEffect } from 'react';
import { useActiveNode } from '@hooks';
import { useEmptyDataStore } from '@store';
import { useShallow } from 'zustand/react/shallow';

export const useExecuteProvider = () => {
  const [isProcessing, setProcessing] = useState(false);
  const { id, config } = useActiveNode([]);
  const {
    //  setCreateState,
    canDelete,
    setDeleteNode,
  } = useEmptyDataStore(
    useShallow((state) => ({
      canDelete: state.nodes?.canDelete,
      setCreateState: state.setCreateState,
      setDeleteNode: state.setDeleteNode,
    })),
  );

  useEffect(() => {
    if (config?.isEmptyDataView && config?.dataState === 'draft') {
      console.log('id==>', id);
      //ToDo: need to remove after
      //   setProcessing(true);
      //   setCreateState({ nodeId: id as string, dataState: 'draft', processData: true });
    } else {
      setProcessing(false);
    }
  }, [config?.isEmptyDataView, config?.dataState]);

  useEffect(() => {
    if (canDelete) {
      setDeleteNode();
      setProcessing(false);
    }
  }, [canDelete]);

  return {
    isProcessing,
  };
};

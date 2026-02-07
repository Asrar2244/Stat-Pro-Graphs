import { useEffect } from 'react';
import { useAnalyticsStore } from '../store/analyticsSlice';
import { Variable } from '../../bar/types';

export const useAnalyticsVariables = (variables: Variable[]) => {
    const { setAvailableVariables } = useAnalyticsStore();

    useEffect(() => {
        if (variables && variables.length > 0) {
            setAvailableVariables(variables);
        }
    }, [variables, setAvailableVariables]);
};

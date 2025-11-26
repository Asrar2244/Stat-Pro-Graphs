import { create } from 'zustand';
import cloneDeep from 'lodash.clonedeep';
import {
  ISampleSizeStore,
  ITTestForm,
  IProportionForm,
  IPairedTTestForm,
  IAnovaForm,
  IChiSquareForm,
  ISampleSizeResult,
  SampleSizeTestType,
} from './types';

const initValues = {
  ttestForm: {
    expected_difference: 10,
    expected_std_dev: 8,
    desired_power: 0.8,
    alpha: 0.05,
  } as ITTestForm,
  proportionForm: {
    group1_proportion: 0.5,
    group2_proportion: 0.7,
    desired_power: 0.8,
    alpha: 0.05,
    yates_correction: false,
  } as IProportionForm,
  pairedTTestForm: {
    change_to_be_detected: 5,
    expected_std_dev_of_change: 8,
    desired_power: 0.8,
    alpha: 0.05,
    correlation: 0.5,
  } as IPairedTTestForm,
  anovaForm: {
    minimum_detectable_difference: 5,
    expected_std_dev_residuals: 8,
    num_groups: 3,
    desired_power: 0.8,
    alpha: 0.05,
  } as IAnovaForm,
  chiSquareForm: {
    desired_power: 0.8,
    alpha: 0.05,
    yates_correction: false,
  } as IChiSquareForm,
  isLoading: false,
  sampleSize: null as ISampleSizeResult | null,
  error: '',
};

export const useSampleSizeStore = create<ISampleSizeStore>((set, get) => ({
  ...cloneDeep(initValues),
  
  setTTestForm(payload): void {
    set((state) => ({
      ...state,
      ttestForm: { ...state.ttestForm, ...payload },
      sampleSize: null, // Clear previous result
      error: '',
    }));
  },

  setProportionForm(payload): void {
    set((state) => ({
      ...state,
      proportionForm: { ...state.proportionForm, ...payload },
      sampleSize: null,
      error: '',
    }));
  },

  setPairedTTestForm(payload): void {
    set((state) => ({
      ...state,
      pairedTTestForm: { ...state.pairedTTestForm, ...payload },
      sampleSize: null,
      error: '',
    }));
  },

  setAnovaForm(payload): void {
    set((state) => ({
      ...state,
      anovaForm: { ...state.anovaForm, ...payload },
      sampleSize: null,
      error: '',
    }));
  },

  setChiSquareForm(payload): void {
    set((state) => ({
      ...state,
      chiSquareForm: { ...state.chiSquareForm, ...payload },
      sampleSize: null,
      error: '',
    }));
  },

  setLoading(loading): void {
    set((state) => ({
      ...state,
      isLoading: loading,
    }));
  },

  setSampleSize(result): void {
    set((state) => ({
      ...state,
      sampleSize: result,
      error: '',
    }));
  },

  setError(error): void {
    set((state) => ({
      ...state,
      error,
      sampleSize: null,
    }));
  },

  resetAll(): void {
    set(cloneDeep(initValues));
  },

  // Get form data for a specific test type
  getFormData(test: SampleSizeTestType): ITTestForm | IProportionForm | IPairedTTestForm | IAnovaForm | IChiSquareForm {
    switch (test) {
      case 'ttest-sample-size':
        return get().ttestForm;
      case 'proportion-sample-size':
        return get().proportionForm;
      case 'paired-ttest-sample-size':
        return get().pairedTTestForm;
      case 'anova-sample-size':
        return get().anovaForm;
      case 'chi-square-sample-size':
        return get().chiSquareForm;
      default:
        throw new Error('Unknown test type');
    }
  },
})); 
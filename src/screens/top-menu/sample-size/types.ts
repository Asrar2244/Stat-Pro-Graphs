export interface TTestSampleSizeRequest {
  expected_difference: string | number;
  expected_std_dev: string | number;
  desired_power: string | number;
  alpha: string | number;
}

export interface ProportionSampleSizeRequest {
  group1_proportion: string | number;
  group2_proportion: string | number;
  desired_power: string | number;
  alpha: string | number;
  yates_correction: boolean;
}

export interface PairedTTestSampleSizeRequest {
  change_to_be_detected: string | number;
  expected_std_dev_of_change: string | number;
  desired_power: string | number;
  alpha: string | number;
  correlation: string | number;
}

export interface AnovaSampleSizeRequest {
  minimum_detectable_difference: string | number;
  expected_std_dev_residuals: string | number;
  num_groups: string | number;
  desired_power: string | number;
  alpha: string | number;
}

export interface ChiSquareSampleSizeRequest {
  alpha: string | number;
  desired_power: string | number;
  yates_correction: boolean;
  data: any[];
}

export type SampleSizeRequest =
  | TTestSampleSizeRequest
  | ProportionSampleSizeRequest
  | PairedTTestSampleSizeRequest
  | AnovaSampleSizeRequest
  | ChiSquareSampleSizeRequest;

export interface SampleSizeResponse {
  sample_size: string | number;
}

export interface SampleSizeModalProps {
  selectedTest: string;
  onClose: () => void;
}

export interface ISampleSizeProps {
  open: boolean;
  onClose: () => void;
  selectedTest: string;
  closeModal: () => void;
}

export type SampleSizeTestType =
  | 'ttest-sample-size'
  | 'proportion-sample-size'
  | 'paired-ttest-sample-size'
  | 'anova-sample-size'
  | 'chi-square-sample-size';

export interface SampleSizeOption {
  label: string;
  value: SampleSizeTestType;
}

export const sampleSizeOptions: SampleSizeOption[] = [
  { label: 'T-Test Sample Size', value: 'ttest-sample-size' },
  { label: 'Proportion Sample Size', value: 'proportion-sample-size' },
  { label: 'Paired T-Test Sample Size', value: 'paired-ttest-sample-size' },
  { label: 'ANOVA Sample Size', value: 'anova-sample-size' },
  { label: 'Chi-square Sample Size', value: 'chi-square-sample-size' },
];

export interface ITTestForm {
  expected_difference: number;
  expected_std_dev: number;
  desired_power: number;
  alpha: number;
}

export interface IProportionForm {
  group1_proportion: number;
  group2_proportion: number;
  desired_power: number;
  alpha: number;
  yates_correction: boolean;
}

export interface IPairedTTestForm {
  change_to_be_detected: number;
  expected_std_dev_of_change: number;
  desired_power: number;
  alpha: number;
  correlation: number;
}

export interface IAnovaForm {
  minimum_detectable_difference: number;
  expected_std_dev_residuals: number;
  num_groups: number;
  desired_power: number;
  alpha: number;
}

export interface IChiSquareForm {
  desired_power: number;
  alpha: number;
  yates_correction: boolean;
}

export interface ISampleSizeResult {
  sample_size: number;
  test_type: SampleSizeTestType;
  parameters: Record<string, any>;
}

export interface ISampleSizeModalProps {
  selectedTest: SampleSizeTestType;
  onClose: () => void;
}

export interface IDataBlock {
  id: string;
  name: string;
  data: any[][];
}

export interface IChiSquareModalProps {
  open: boolean;
  onClose: () => void;
}

export interface ISampleSizeStore {
  ttestForm: ITTestForm;
  proportionForm: IProportionForm;
  pairedTTestForm: IPairedTTestForm;
  anovaForm: IAnovaForm;
  chiSquareForm: IChiSquareForm;
  isLoading: boolean;
  sampleSize: ISampleSizeResult | null;
  error: string;
  setTTestForm: (payload: Partial<ITTestForm>) => void;
  setProportionForm: (payload: Partial<IProportionForm>) => void;
  setPairedTTestForm: (payload: Partial<IPairedTTestForm>) => void;
  setAnovaForm: (payload: Partial<IAnovaForm>) => void;
  setChiSquareForm: (payload: Partial<IChiSquareForm>) => void;
  setLoading: (loading: boolean) => void;
  setSampleSize: (result: ISampleSizeResult | null) => void;
  setError: (error: string) => void;
  resetAll: () => void;
  getFormData: (test: SampleSizeTestType) => ITTestForm | IProportionForm | IPairedTTestForm | IAnovaForm | IChiSquareForm;
} 
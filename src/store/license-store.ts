import { create } from 'zustand';
type ILicenseStatus = {
  state?: '30Days' | 'lifetime' | 'expired' | 'lookingProductLicense';
  type?: string;
};
interface ILicenseStore {
  licenseStatus: ILicenseStatus;
  setLicenseState: (licenseStatus: ILicenseStatus) => void;
}

export const useLicenseStore = create<ILicenseStore>((set) => ({
  licenseStatus: {
    state: undefined,
    type: undefined,
  },
  setLicenseState(licenseStatus): void {
    set(() => {
      return { licenseStatus };
    });
  },
}));

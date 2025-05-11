import { API } from '@constants/locale';
import { useAxios } from '@hooks';

export const useLicense = () => {
  const axios = useAxios();
  const checkLicense = async () => {
    const res = await axios.post(`api/${API.analysis}`, {
      operation: 'check_license',
    });
    return res.data;
  };
  const applyLicense = async ({ license_key }: { license_key: string }) => {
    const res = await axios.post(`api/${API.analysis}`, {
      license_key,
      operation: 'apply_license',
    });
    return res.data;
  };
  const getSystemData = async () => {
    const res = await axios.post(`api/${API.analysis}`, {
      operation: 'get_system_data',
    });
    return res.data;
  };
  return { checkLicense, applyLicense, getSystemData };
};

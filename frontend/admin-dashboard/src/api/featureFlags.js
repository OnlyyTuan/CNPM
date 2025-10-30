// frontend/admin-dashboard/src/api/featureFlags.js
// Helper để lấy feature flags (sử dụng axiosClient đã có token interceptor)

import axiosClient from './axiosClient';

export const getFeatureFlags = async () => {
  const res = await axiosClient.get('/feature-flags');
  return res.data?.flags || {};
};

export default { getFeatureFlags };

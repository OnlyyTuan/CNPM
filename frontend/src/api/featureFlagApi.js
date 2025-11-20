// frontend/src/api/featureFlagApi.js
// API client để lấy feature flags từ backend

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

export const fetchFeatureFlags = async () => {
  const res = await axios.get(API_ENDPOINTS.FEATURE_FLAGS);
  return res.data?.flags || {};
};

export default { fetchFeatureFlags };

import axios from 'axios';

const BASE_URL = 'http://144.24.136.5';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

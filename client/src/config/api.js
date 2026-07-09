import axios from "axios";

// Central axios instance so client requests share the same base config.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
});

import axios from "axios";

const API = axios.create({
  baseURL: "https://campus-lost-found-u4mt.onrender.com/api"
});

// 🔥 Attach token automatically to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
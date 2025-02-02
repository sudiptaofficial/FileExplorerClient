// src/api.js
import axios from "axios";

const API_URL = "http://localhost:8981/api";

// Retrieve token from localStorage (or a context/state manager)
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchFiles = (parentId = "") =>
  axios.get(`${API_URL}/files`, { params: { parentId }, headers: getAuthHeader() });

export const createFolder = (name, parentId = null) =>
  axios.post(`${API_URL}/folder`, { name, parentId }, { headers: getAuthHeader() });

export const uploadFile = (file, parentId = null, relativePath = "", onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("parentId", parentId ? parentId : "null");
  if (relativePath) formData.append("relativePath", relativePath);
  return axios.post(`${API_URL}/file`, formData, {
    headers: { ...getAuthHeader() },
    onUploadProgress
  });
};

export const renameFile = (id, name) =>
  axios.put(`${API_URL}/file/${id}`, { name }, { headers: getAuthHeader() });

export const deleteFile = (id) =>
  axios.delete(`${API_URL}/file/${id}`, { headers: getAuthHeader() });

export const downloadFile = (id) =>
  axios.get(`${API_URL}/download/${id}`, { responseType: "blob", headers: getAuthHeader() });

export const login = (username, password) =>
  axios.post(`${API_URL}/users/login`, { username, password });

export const register = (username, password) =>
  axios.post(`${API_URL}/register`, { username, password });

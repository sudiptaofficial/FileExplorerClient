// src/api.js
import axios from "axios";

const API_URL = "http://localhost:8981/api";

export const fetchFiles = (parentId = "") =>
  axios.get(`${API_URL}/files`, { params: { parentId } });

export const createFolder = (name, parentId = null) =>
  axios.post(`${API_URL}/folder`, { name, parentId });

export const uploadFile = (file, parentId = null) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("parentId", parentId);
  return axios.post(`${API_URL}/file`, formData);
};

export const renameFile = (id, name) =>
  axios.put(`${API_URL}/file/${id}`, { name });

export const deleteFile = (id) =>
  axios.delete(`${API_URL}/file/${id}`);

export const downloadFile = (id) =>
  axios.get(`${API_URL}/download/${id}`, { responseType: "blob" });

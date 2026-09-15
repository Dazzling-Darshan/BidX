import axios from "axios";
import { api } from "../config/api.js";

// getting list of all auction
export const getAuctions = async ({
  page = 1,
  limit = 12,
  category = "all",
  search = "",
  sortBy = "endingSoon",
  status = "active",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category && category !== "all") params.append("category", category);
  if (search && search.trim()) params.append("search", search.trim());
  if (sortBy) params.append("sortBy", sortBy);
  if (status && status !== "active") params.append("status", status);

  const res = await api.get(`/auction?${params.toString()}`);
  return res.data;
};

// getting list of my auctions
export const getMyAuctions = async ({ page = 1, limit = 12 } = {}) => {
  const res = await api.get(`/auction/myauction?page=${page}&limit=${limit}`);
  return res.data;
};

// getting list of auctions user has bid on
export const getMyBids = async ({ page = 1, limit = 12 } = {}) => {
  const res = await api.get(`/auction/mybids?page=${page}&limit=${limit}`);
  return res.data;
};

// getting single auction using _id
export const viewAuction = async (id) => {
  const res = await api.get(`/auction/${id}`);
  return res.data;
};

// placing bid for auction
export const placeBid = async ({ bidAmount, id }) => {
  const res = await api.post(`/auction/${id}/bid`, { bidAmount });
  return res.data;
};

// creating new auction (expects already-uploaded Cloudinary metadata)
export const createAuction = async (data) => {
  const payload = {
    itemName: data.itemName,
    startingPrice: data.startingPrice,
    itemDescription: data.itemDescription,
    itemCategory: data.itemCategory,
    itemStartDate: data.itemStartDate,
    itemEndDate: data.itemEndDate,
    formId: data.formId,
    public_id: data.public_id,
    secure_url: data.secure_url,
  };

  const res = await api.post(`/auction`, payload);
  return res.data;
};

// request signed upload params from backend
export const getUploadSignature = async () => {
  const res = await api.get(`/upload/signature`);
  return res.data;
};

// upload file directly to Cloudinary using signed params
// onProgress: optional callback receiving integer percent (0-100)
export const uploadImageToCloudinary = async ({
  file,
  signatureData,
  onProgress,
}) => {
  const cloudinaryFormData = new FormData();
  cloudinaryFormData.append("file", file);
  cloudinaryFormData.append("api_key", signatureData.apiKey);
  cloudinaryFormData.append("timestamp", signatureData.timestamp);
  cloudinaryFormData.append("signature", signatureData.signature);
  cloudinaryFormData.append("folder", signatureData.folder);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

  const res = await axios.post(cloudinaryUrl, cloudinaryFormData, {
    withCredentials: false,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (typeof onProgress !== "function") return;
      const total = progressEvent.total || 0;
      if (!total) return;
      const percent = Math.round((progressEvent.loaded * 100) / total);
      onProgress(percent);
    },
  });

  return res.data;
};

// getting dashboard stats
export const dashboardStats = async () => {
  const res = await api.get(`/auction/stats`);
  return res.data;
};

// AI auto-generate listing details from image URL
export const generateAIListingDetails = async ({ imageUrl }) => {
  const res = await api.post(`/auction/ai-generate`, { imageUrl });
  return res.data;
};

// get semantically similar auctions using vector embeddings
export const getSimilarAuctions = async (id) => {
  const res = await api.get(`/auction/${id}/similar`);
  return res.data;
};

// toggle watchlist status for an auction
export const toggleWatchlist = async (id) => {
  const res = await api.post(`/auction/${id}/watchlist`);
  return res.data;
};

// get current user's watchlisted auctions
export const getWatchlist = async ({ page = 1, limit = 12 } = {}) => {
  const res = await api.get(`/auction/watchlist?page=${page}&limit=${limit}`);
  return res.data;
};

// delete/cancel an auction (0-bid seller or admin)
export const deleteAuction = async (id) => {
  const res = await api.delete(`/auction/${id}`);
  return res.data;
};



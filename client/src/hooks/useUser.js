import { useQuery, useMutation } from "@tanstack/react-query";
import {
  changePassword,
  loginHistory,
  updateAvatar,
  updateProfile,
} from "../services/user.service.js";

export const useChangePassword = (options = {}) => {
  return useMutation({
    mutationFn: (formData) => changePassword(formData),
    ...options,
  });
};

export const useUpdateAvatar = (options = {}) => {
  return useMutation({
    mutationFn: (avatarData) => updateAvatar(avatarData),
    ...options,
  });
};

export const useUpdateProfile = (options = {}) => {
  return useMutation({
    mutationFn: (profileData) => updateProfile(profileData),
    ...options,
  });
};

export const useLoginHistory = () => {
  return useQuery({
    queryKey: ["loginHistory"],
    queryFn: loginHistory,
  });
};

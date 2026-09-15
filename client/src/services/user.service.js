import { api } from "../config/api.js";

export const changePassword = async (formData) => {
    try {
        const res = await api.patch(`/user`,
            formData,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update password")
        throw error;
    }
}


export const loginHistory = async () => {
    try {
        const res = await api.get(`/user/logins`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't show login history")
        throw error;
    }
}

export const updateAvatar = async (avatarData) => {
    try {
        const res = await api.patch(`/user/avatar`,
            { avatar: avatarData },
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update avatar");
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const res = await api.patch(`/user/profile`,
            profileData,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update profile");
        throw error;
    }
};
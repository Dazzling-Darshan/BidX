import { api } from "../config/api.js";


// Get admin dashboard statistics
export const getAdminDashboard = async () => {
    try {
        const res = await api.get(`/admin/dashboard`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't load admin dashboard");
        throw error;
    }
};

// Get all users with pagination and filtering
export const getAllUsers = async (page = 1, search = '', role = 'all', limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
    try {
        const res = await api.get(`/admin/users`, {
            params: { page, search, role, limit, sortBy, sortOrder },
            withCredentials: true
        });
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't load users");
        throw error;
    }
};

// Update user role (future functionality)
export const updateUserRole = async (userId, newRole) => {
    try {
        const res = await api.patch(`/admin/users/${userId}/role`,
            { role: newRole },
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update user role");
        throw error;
    }
};

// Delete user
export const deleteUser = async (userId) => {
    try {
        const res = await api.delete(`/admin/users/${userId}`,
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't delete user");
        throw error;
    }
};

// Get all auctions across the platform for admin moderation
export const getAllAdminAuctions = async (page = 1, search = '', status = 'all', category = 'all', limit = 10) => {
    try {
        const res = await api.get(`/admin/auctions`, {
            params: { page, search, status, category, limit },
            withCredentials: true,
        });
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't load auctions");
        throw error;
    }
};

// Admin delete an auction
export const adminDeleteAuction = async (auctionId) => {
    try {
        const res = await api.delete(`/admin/auctions/${auctionId}`, {
            withCredentials: true,
        });
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't delete auction");
        throw error;
    }
};

// Get all contact messages
export const getAllMessages = async (page = 1, search = '', status = 'all', limit = 10) => {
    try {
        const res = await api.get(`/admin/messages`, {
            params: { page, search, status, limit },
            withCredentials: true,
        });
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't load messages");
        throw error;
    }
};

// Update message status (read / unread)
export const updateMessageStatus = async (messageId, status) => {
    try {
        const res = await api.patch(`/admin/messages/${messageId}/status`, 
            { status },
            { withCredentials: true }
        );
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't update message status");
        throw error;
    }
};

// Delete a contact message
export const deleteMessage = async (messageId) => {
    try {
        const res = await api.delete(`/admin/messages/${messageId}`, {
            withCredentials: true,
        });
        return res.data;
    } catch (error) {
        console.log(error?.response?.data?.error || "Can't delete message");
        throw error;
    }
};

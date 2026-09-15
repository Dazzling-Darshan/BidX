import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import LoadingScreen from "../../components/LoadingScreen";
import { getAllUsers, updateUserRole, deleteUser } from "../../services/admin.service.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import toast from "react-hot-toast";
import {
  MdOutlineDelete,
  MdOutlineAdminPanelSettings,
  MdOutlinePersonOutline,
  MdWarningAmber,
} from "react-icons/md";

export const UsersList = () => {
  useDocumentTitle("Manage Users | Admin");
  const authState = useSelector((state) => state.auth);
  const currentUserId = authState?.user?.user?._id || authState?.user?._id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, deleting: false });
  const [roleModal, setRoleModal] = useState({ open: false, user: null, updating: false });

  const fetchUsers = async (
    page = 1,
    search = "",
    role = "all",
    sort = "createdAt",
    order = "desc",
  ) => {
    try {
      setLoading(true);
      setError(null);
      const roleParam = role === "all" ? "" : role;
      const response = await getAllUsers(page, search, roleParam, 20, sort, order);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchTerm, roleFilter, sortBy, sortOrder);
  }, [currentPage, searchTerm, roleFilter, sortBy, sortOrder]);

  const handleRoleToggleConfirm = async () => {
    if (!roleModal.user) return;
    const targetUser = roleModal.user;
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    setRoleModal((p) => ({ ...p, updating: true }));
    try {
      await updateUserRole(targetUser._id, newRole);
      toast.success(`${targetUser.name}'s role updated to ${newRole}`);
      setRoleModal({ open: false, user: null, updating: false });
      fetchUsers(currentPage, searchTerm, roleFilter, sortBy, sortOrder);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
      setRoleModal((p) => ({ ...p, updating: false }));
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deleteModal.user) return;
    setDeleteModal((p) => ({ ...p, deleting: true }));
    try {
      await deleteUser(deleteModal.user._id);
      toast.success(`User ${deleteModal.user.name} deleted successfully`);
      setDeleteModal({ open: false, user: null, deleting: false });
      fetchUsers(currentPage, searchTerm, roleFilter, sortBy, sortOrder);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
      setDeleteModal((p) => ({ ...p, deleting: false }));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLocation = (location) => {
    if (!location) return "Unknown";
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    return parts.length > 0 ? parts.join(", ") : "Unknown";
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) {
      return (
        <svg
          className="w-3.5 h-3.5 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortOrder === "asc" ? (
      <svg
        className="w-3.5 h-3.5 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-3.5 h-3.5 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
            <p className="text-sm text-gray-400 mt-1">
              {pagination.totalUsers
                ? `${pagination.totalUsers} registered users`
                : "Manage all users"}
            </p>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition shadow-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th
                    className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1.5">
                      User <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-1.5">
                      Role <SortIcon field="role" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1.5">
                      Joined <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition"
                    onClick={() => handleSort("lastLogin")}
                  >
                    <div className="flex items-center gap-1.5">
                      Last Login <SortIcon field="lastLogin" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user, i) => {
                    const isSelf = user._id === currentUserId;
                    const avatarColors = [
                      "from-indigo-400 to-violet-500",
                      "from-emerald-400 to-teal-500",
                      "from-amber-400 to-orange-500",
                      "from-rose-400 to-pink-500",
                      "from-sky-400 to-blue-500",
                    ];
                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center shrink-0`}
                            >
                              <span className="text-xs font-semibold text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </p>
                                {isSelf && (
                                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                              user.role === "admin"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatLocation(user.location)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Role Toggle Button */}
                            <button
                              onClick={() =>
                                setRoleModal({
                                  open: true,
                                  user,
                                  updating: false,
                                })
                              }
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "Cannot change your own role"
                                  : user.role === "admin"
                                  ? "Demote to User"
                                  : "Promote to Admin"
                              }
                              className={`p-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
                                isSelf
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : user.role === "admin"
                                  ? "border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300"
                                  : "border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                              }`}
                            >
                              {user.role === "admin" ? (
                                <>
                                  <MdOutlinePersonOutline className="w-4 h-4" />
                                  <span className="hidden md:inline">Demote</span>
                                </>
                              ) : (
                                <>
                                  <MdOutlineAdminPanelSettings className="w-4 h-4" />
                                  <span className="hidden md:inline">Make Admin</span>
                                </>
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() =>
                                setDeleteModal({
                                  open: true,
                                  user,
                                  deleting: false,
                                })
                              }
                              disabled={isSelf}
                              title={isSelf ? "Cannot delete your own account" : "Delete user"}
                              className={`p-1.5 rounded-lg border transition ${
                                isSelf
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              }`}
                            >
                              <MdOutlineDelete className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {(currentPage - 1) * pagination.limit + 1}
                </span>{" "}
                &ndash;{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(
                    currentPage * pagination.limit,
                    pagination.totalUsers,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {pagination.totalUsers}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum =
                      Math.max(
                        1,
                        Math.min(pagination.totalPages - 4, currentPage - 2),
                      ) + i;
                    if (pageNum > pagination.totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                          pageNum === currentPage
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.totalPages, currentPage + 1),
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Change Confirmation Modal */}
        {roleModal.open && roleModal.user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 text-indigo-600 mb-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <MdOutlineAdminPanelSettings className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {roleModal.user.role === "admin"
                    ? "Demote to Standard User?"
                    : "Promote to Administrator?"}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Are you sure you want to change the role of{" "}
                <span className="font-semibold text-gray-900">
                  {roleModal.user.name}
                </span>{" "}
                ({roleModal.user.email}) to{" "}
                <span className="font-semibold uppercase text-indigo-600">
                  {roleModal.user.role === "admin" ? "user" : "admin"}
                </span>
                ?
                {roleModal.user.role !== "admin" &&
                  " This user will gain full access to admin moderation controls."}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setRoleModal({ open: false, user: null, updating: false })
                  }
                  disabled={roleModal.updating}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRoleToggleConfirm}
                  disabled={roleModal.updating}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {roleModal.updating ? "Updating..." : "Confirm Change"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.open && deleteModal.user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <div className="p-2.5 bg-red-50 rounded-xl">
                  <MdWarningAmber className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete User Account?
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                You are about to permanently delete{" "}
                <span className="font-semibold text-gray-900">
                  {deleteModal.user.name}
                </span>{" "}
                ({deleteModal.user.email}).
              </p>
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl mb-5 leading-relaxed">
                This action cannot be undone. All active auctions, bids, and profile records belonging to this user will be purged from the platform.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({ open: false, user: null, deleting: false })
                  }
                  disabled={deleteModal.deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUserConfirm}
                  disabled={deleteModal.deleting}
                  className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {deleteModal.deleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

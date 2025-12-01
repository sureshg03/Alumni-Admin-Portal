import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiX, FiPlus, FiFilter, FiRefreshCw } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const AddDepartment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    departmentId: "",
    departmentName: "",
    email: "",
  });
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    departmentId: "",
    departmentName: "",
    email: "",
  });
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/departments/");
      setDepartments(response.data || []);
      setFilteredDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error.response?.data, error.response?.status);
      toast.error("Failed to load departments: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Handle filter changes
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Apply filters
  useEffect(() => {
    const applyFilters = () => {
      let filtered = departments;
      if (filters.departmentId) {
        filtered = filtered.filter((dept) =>
          dept.department_id.toLowerCase().includes(filters.departmentId.toLowerCase())
        );
      }
      if (filters.departmentName) {
        filtered = filtered.filter((dept) =>
          dept.department_name.toLowerCase().includes(filters.departmentName.toLowerCase())
        );
      }
      if (filters.email) {
        filtered = filtered.filter((dept) =>
          dept.email.toLowerCase().includes(filters.email.toLowerCase())
        );
      }
      setFilteredDepartments(filtered);
    };
    applyFilters();
  }, [filters, departments]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const payload = {
          department_id: formData.departmentId,
          department_name: formData.departmentName,
          email: formData.email,
        };
        let response;
        if (isEditing) {
          response = await axios.put(`/api/update-department/${editId}/`, payload);
          toast.success("Department updated successfully!");
        } else {
          response = await axios.post("/api/add-department/", payload);
          toast.success("Department added successfully!");
        }
        setIsModalOpen(false);
        setFormData({ departmentId: "", departmentName: "", email: "" });
        setIsEditing(false);
        setEditId(null);
        await fetchDepartments();
      } catch (error) {
        console.error("Error saving department:", error.response?.data, error.response?.status);
        toast.error(error.response?.data?.message || "Failed to save department");
      } finally {
        setIsLoading(false);
      }
    },
    [isEditing, editId, formData, fetchDepartments]
  );

  const handleEdit = useCallback((dept) => {
    setFormData({
      departmentId: dept.department_id,
      departmentName: dept.department_name,
      email: dept.email,
    });
    setEditId(dept.department_id);
    setIsEditing(true);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((departmentId) => {
    setDeleteType("single");
    setDeleteId(departmentId);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteAll = useCallback(() => {
    setDeleteType("all");
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      if (deleteType === "single") {
        await axios.delete(`/api/delete-department/${deleteId}/`);
        toast.success("Department deleted successfully!");
      } else if (deleteType === "all") {
        await axios.delete("/api/delete-all-departments/");
        toast.success("All departments deleted successfully!");
      }
      await fetchDepartments();
    } catch (error) {
      console.error(`Error deleting ${deleteType === "single" ? "department" : "all departments"}:`, error.response?.data, error.response?.status);
      toast.error(error.response?.data?.message || `Failed to delete ${deleteType === "single" ? "department" : "all departments"}`);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setDeleteType(null);
      setDeleteId(null);
    }
  }, [deleteType, deleteId, fetchDepartments]);

  const handleRefresh = useCallback(() => {
    fetchDepartments();
    toast.success("Departments refreshed!");
  }, [fetchDepartments]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-gray-100 to-gray-200 text-gray-800">
      <Sidebar />
     <main className="flex-1 p-6 md:p-8 bg-gray-50/95 md:rounded-tl-3xl overflow-y-auto max-h-screen relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23a5b4fc%22 fill-opacity%3D%220.1%22%3E%3Cpath d%3D%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4V8h-4V4h-2zM6 34v4H4v2h4v4h2v-4h4v-2h-4v-4H6zM6 4v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30 md:opacity-50"></div>
        <Toaster position="top-right" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 relative z-10 pt-12 md:pt-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-900 tracking-tight drop-shadow-md">
            Departments
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setFormData({ departmentId: "", departmentName: "", email: "" });
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-indigo-400 w-full sm:w-auto"
              disabled={isLoading}
              aria-label="Add new department"
            >
              <FiPlus className="mr-2" /> Add Department
            </button>
            <button
              onClick={handleDeleteAll}
              className="flex items-center justify-center bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-red-400 w-full sm:w-auto"
              disabled={isLoading || departments.length === 0}
              aria-label="Delete all departments"
            >
              <FiTrash2 className="mr-2" /> Delete All
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center bg-gradient-to-r from-green-500 to-lime-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:from-green-600 hover:to-lime-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-green-400 w-full sm:w-auto"
              disabled={isLoading}
              aria-label="Refresh departments"
            >
              <FiRefreshCw className="mr-2" /> Refresh
            </button>
          </div>
        </div>

        {/* Filter Box */}
        <div className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-xl mb-6 border-2 border-purple-500 transition-all duration-200 relative z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-900 flex items-center mb-4 drop-shadow-sm">
            <FiFilter className="mr-2 text-purple-500" /> Filter Departments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department ID</label>
              <input
                name="departmentId"
                placeholder="Filter by ID"
                value={filters.departmentId}
                onChange={handleFilterChange}
                className="w-full border border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                aria-label="Filter by department ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
              <input
                name="departmentName"
                placeholder="Filter by Name"
                value={filters.departmentName}
                onChange={handleFilterChange}
                className="w-full border border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                aria-label="Filter by department name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                placeholder="Filter by Email"
                value={filters.email}
                onChange={handleFilterChange}
                className="w-full border border-purple-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                aria-label="Filter by email"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3 flex justify-end">
              <button
                onClick={() => setFilters({ departmentId: "", departmentName: "", email: "" })}
                className="text-purple-600 hover:text-purple-800 font-medium transition-all duration-200 text-sm sm:text-base"
                aria-label="Clear all filters"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-8 relative z-10">
            <div className="inline-block h-8 w-8 sm:h-10 sm:w-10 animate-spin rounded-full border-4 border-purple-500 border-r-transparent"></div>
          </div>
        )}
        {filteredDepartments.length === 0 && !isLoading ? (
          <div className="text-center text-gray-600 text-base sm:text-lg font-medium bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-purple-400 relative z-10">
            No departments found. Try adjusting filters or add a new department!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.department_id}
                className="relative bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-purple-500 bg-gradient-to-br from-white to-purple-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-purple-100/30 opacity-60"></div>
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-bl-lg shadow-md">
                  ID: {dept.department_id}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-900 mb-3 pr-16 sm:pr-20 tracking-tight relative z-10">
                  {dept.department_name}
                </h3>
                <p className="text-gray-700 mb-4 break-all flex items-center relative z-10 text-sm sm:text-base">
                  <span className="mr-2 text-purple-600">📧</span> {dept.email}
                </p>
                <div className="flex space-x-3 relative z-10">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="flex items-center bg-indigo-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-indigo-400 text-sm sm:text-base"
                    disabled={isLoading}
                    aria-label={`Edit department ${dept.department_name}`}
                  >
                    <FiEdit className="mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept.department_id)}
                    className="flex items-center bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-red-400 text-sm sm:text-base"
                    disabled={isLoading}
                    aria-label={`Delete department ${dept.department_name}`}
                  >
                    <FiTrash2 className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md sm:max-w-lg mx-4 border-2 border-purple-500 transform transition-all duration-300 animate-slide-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-900 tracking-tight drop-shadow-sm">
                  {isEditing ? "Edit Department" : "Add New Department"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:ring-2 hover:ring-purple-400 rounded-full"
                  disabled={isLoading}
                  aria-label="Close modal"
                >
                  <FiX size={20} sm={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department ID</label>
                  <input
                    name="departmentId"
                    placeholder="Enter Department ID"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full border border-purple-500 px-3 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={isEditing || isLoading}
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                  <input
                    name="departmentName"
                    placeholder="Enter Department Name"
                    value={formData.departmentName}
                    onChange={handleChange}
                    className="w-full border border-purple-500 px-3 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter Email ID"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-purple-500 px-3 py-2 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/70 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                    aria-required="true"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 sm:px-5 sm:py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-gray-400 text-sm sm:text-base"
                    disabled={isLoading}
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-lg hover:from-indigo-800 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-purple-400 text-sm sm:text-base"
                    disabled={isLoading}
                    aria-label={isEditing ? "Update department" : "Add department"}
                  >
                    {isLoading ? "Saving..." : isEditing ? "Update Department" : "Add Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 backdrop-blur-md transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-sm mx-4 border-2 border-red-400 transform transition-all duration-300 animate-slide-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-red-900 tracking-tight drop-shadow-sm">
                  {deleteType === "single" ? "Delete Department" : "Delete All Departments"}
                </h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:ring-2 hover:ring-red-400 rounded-full"
                  disabled={isLoading}
                  aria-label="Close delete modal"
                >
                  <FiX size={20} sm={24} />
                </button>
              </div>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                Are you sure you want to delete {deleteType === "single" ? "this department" : "all departments"}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 sm:px-5 sm:py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-gray-400 text-sm sm:text-base"
                  disabled={isLoading}
                  aria-label="Cancel delete"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-red-400 text-sm sm:text-base"
                  disabled={isLoading}
                  aria-label="Confirm delete"
                >
                  {isLoading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default React.memo(AddDepartment);
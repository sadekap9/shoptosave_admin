import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Grid,
  X
} from 'lucide-react';

// Helper to get initials
const getInitials = (name) => {
  return name.substring(0, 2).toUpperCase();
};

// Helper to get matching avatar gradient
const getAvatarGradient = (name) => {
  const colors = [
    'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
    'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return isoString;
  }
};

const getLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  const baseHost = 'https://api.shoptosave.in';
  const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
  return `${baseHost}${cleanPath}`;
};

let lastFetchTime = 0;

const CategoriesView = ({ triggerToast }) => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dialog States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form input states (Add)
  const [categoryName, setCategoryName] = useState('');
  const [categoryLogo, setCategoryLogo] = useState(null);
  const [categoryStatus, setCategoryStatus] = useState('Active');

  // Form input states (Edit)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState(null);
  const [editStatus, setEditStatus] = useState('Active');

  const fetchCategoriesList = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response && response.success && response.result && response.result.data) {
        const mappedCategories = response.result.data.map((cat) => {
          return {
            id: `CAT-${String(cat.id).padStart(3, '0')}`,
            dbId: cat.id,
            name: cat.category_name,
            logo: cat.logo || '',
            status: cat.status === 1 ? 'Active' : 'Inactive',
            created: formatDateTime(cat.created_at),
          };
        });
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      triggerToast('Failed to load categories list', 'error');
    }
  };

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchTime > 500) {
      lastFetchTime = now;
      fetchCategoriesList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      triggerToast('Please fill in the category name', 'warning');
      return;
    }
    if (!categoryLogo) {
      triggerToast('Please select a category logo file', 'warning');
      return;
    }
    try {
      const response = await categoryService.addCategory(
        categoryName.trim(),
        categoryStatus,
        categoryLogo
      );

      if (response && response.success) {
        await fetchCategoriesList();
        triggerToast(`Category "${categoryName.trim()}" created successfully!`, 'success');

        // Reset fields & close
        setCategoryName('');
        setCategoryLogo(null);
        setOpenAddDialog(false);
      } else {
        triggerToast(response.message || 'Failed to create category', 'error');
      }
    } catch (err) {
      console.error('Add Category API error:', err);
      triggerToast(err.message || 'An error occurred while creating the category', 'error');
    }
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditLogo(null);
    setEditStatus(category.status);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      triggerToast('Please fill in the category name', 'warning');
      return;
    }
    try {
      const databaseId = selectedCategory.dbId;
      const response = await categoryService.updateCategory(
        databaseId,
        editName.trim(),
        editStatus,
        editLogo
      );

      if (response && response.success) {
        await fetchCategoriesList();
        triggerToast(`Category "${editName.trim()}" updated successfully!`, 'success');
        setOpenEditDialog(false);
      } else {
        triggerToast(response.message || 'Failed to update category', 'error');
      }
    } catch (err) {
      console.error('Update Category API error:', err);
      triggerToast(err.message || 'An error occurred while updating the category', 'error');
    }
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      try {
        const databaseId = selectedCategory.dbId;
        const response = await categoryService.deleteCategory(databaseId);
        if (response && response.success) {
          triggerToast(`Category "${selectedCategory.name}" has been deleted.`, 'error');
          setOpenDeleteDialog(false);
          await fetchCategoriesList();
        } else {
          triggerToast(response.message || 'Failed to delete category', 'error');
        }
      } catch (err) {
        console.error('Delete Category API error:', err);
        triggerToast(err.message || 'An error occurred while deleting the category', 'error');
      }
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || category.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {/* Header with Title & Add Button */}
      <div className="flex justify-end items-center mb-8">

        <button
          onClick={() => setOpenAddDialog(true)}
          className="flex items-center gap-2 text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(109,40,217,0.25)]"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Main card Categories directory */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100 bg-white gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search category name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-primary outline-none transition-all text-slate-700 font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active </option>
              <option value="Inactive">Inactive </option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100">
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">ID</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Category</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Created At</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center">Status</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Grid className="w-10 h-10 text-slate-300 opacity-50" />
                      <span className="text-xs font-semibold text-slate-400">No categories found matching criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => {
                  const isActive = category.status === 'Active';
                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-violet-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 pl-6 whitespace-nowrap">
                        <span className="text-xs font-extrabold text-slate-400">
                          {category.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {category.logo ? (
                            <img
                              src={getLogoUrl(category.logo)}
                              alt={category.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-150 shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm flex-shrink-0"
                              style={{ background: getAvatarGradient(category.name) }}
                            >
                              {getInitials(category.name)}
                            </div>
                          )}
                          <span className="text-xs font-bold text-slate-800">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-slate-500 font-medium">
                          {category.created}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                            : 'bg-red-50 text-red-600 border-red-500/10'
                          }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(category)}
                            title="Configure Details"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all duration-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(category)}
                            title="Delete Category"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* DIALOG 1: Add Category */}
      {openAddDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-sm font-extrabold text-slate-900">Create Category</h3>
              <button
                type="button"
                onClick={() => {
                  setCategoryName('');
                  setCategoryLogo(null);
                  setOpenAddDialog(false);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="p-7 space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fashion, Electronics"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Category Logo *
                  </label>
                  <label className="w-full px-3 py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-850 hover:bg-slate-100/60 border border-dashed border-slate-250 hover:border-slate-350 bg-slate-50/50 rounded-lg cursor-pointer transition-all truncate block">
                    {categoryLogo ? categoryLogo.name : 'Choose Logo Image *'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setCategoryLogo(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Visibility Status *
                  </label>
                  <select
                    value={categoryStatus}
                    onChange={(e) => setCategoryStatus(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-primary text-slate-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryName('');
                    setCategoryLogo(null);
                    setOpenAddDialog(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] rounded-xl transition-all shadow-md active:scale-95 duration-200"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: Edit Category */}
      {openEditDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-sm font-extrabold text-slate-900">Modify Category</h3>
              <button
                type="button"
                onClick={() => {
                  setOpenEditDialog(false);
                  setEditLogo(null);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-7 space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fashion, Electronics"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100/50 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Category Logo
                  </label>
                  {editLogo ? (
                    <div className="flex flex-col items-center gap-1 mb-2">
                      <span className="text-[9px] font-bold text-primary block uppercase">New Logo Preview</span>
                      <img
                        src={URL.createObjectURL(editLogo)}
                        alt="New Preview"
                        className="w-[72px] h-[72px] rounded-xl object-cover border-2 border-dashed border-[#6D28D9] shadow-md"
                      />
                    </div>
                  ) : (
                    selectedCategory && selectedCategory.logo && (
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Current Logo</span>
                        <img
                          src={getLogoUrl(selectedCategory.logo)}
                          alt={selectedCategory.name}
                          className="w-[72px] h-[72px] rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                      </div>
                    )
                  )}

                  <label className="w-full px-3 py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-850 hover:bg-slate-100/60 border border-dashed border-slate-250 hover:border-slate-350 bg-slate-50/50 rounded-lg cursor-pointer transition-all truncate block">
                    {editLogo ? editLogo.name : 'Choose New Logo Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setEditLogo(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Visibility Status *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-[#F8FAFC] outline-none focus:border-primary text-slate-700 font-semibold"
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenEditDialog(false);
                    setEditLogo(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] rounded-xl transition-all shadow-md active:scale-95 duration-200"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 3: Delete Confirm Dialog */}
      {openDeleteDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <div className="pt-6 px-6 pb-2">
              <h3 className="text-sm font-extrabold text-red-500 tracking-tight">Delete Category</h3>
            </div>
            <div className="px-6 pb-4">
              <p className="text-xs text-slate-650 leading-relaxed">
                Are you sure you want to delete category <strong>"{selectedCategory?.name}"</strong>?
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setOpenDeleteDialog(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesView;

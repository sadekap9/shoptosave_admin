import React, { useState, useEffect } from 'react';
import { subadminService } from '../services/subadminService';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Users,
  Eye,
  EyeOff,
  Phone,
  Mail
} from 'lucide-react';

// Helper to get initials
const getInitials = (name) => {
  return name.substring(0, 2).toUpperCase();
};

// Helper to get matching avatar gradient
const getAvatarGradient = (name) => {
  const colors = [
    'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
    'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
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

const MENU_ACCESS_STORAGE_KEY = 's2s_subadmin_menu_access';

const getStoredMenuAccess = () => {
  try {
    const data = localStorage.getItem(MENU_ACCESS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to parse sub-admin menu access:', e);
    return {};
  }
};

const saveStoredMenuAccess = (email, menus) => {
  try {
    const data = getStoredMenuAccess();
    data[email.toLowerCase()] = menus;
    localStorage.setItem(MENU_ACCESS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save sub-admin menu access:', e);
  }
};

const deleteStoredMenuAccess = (email) => {
  try {
    const data = getStoredMenuAccess();
    delete data[email.toLowerCase()];
    localStorage.setItem(MENU_ACCESS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to delete sub-admin menu access:', e);
  }
};

const availableMenus = [
  'Dashboard',
  'User Accounts',
  'Gift Cards',
  'Categories',
  'Redeem Orders',
  'Sell Requests',
  'Sync Woohoo',
  'Partner Stores',
  'Earnings Ledger',
  'System Wallets',
];

let lastFetchTime = 0;

const SubAdminsView = ({ triggerToast }) => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [menuFilter, setMenuFilter] = useState('All');

  const fetchSubAdmins = async () => {
    setLoading(true);
    try {
      const response = await subadminService.getSubAdmins();
      if (response && response.success && response.result && response.result.data) {
        const storedAccess = getStoredMenuAccess();
        const mappedSubAdmins = response.result.data.map((sub) => {
          const emailKey = sub.email.toLowerCase();
          const menuAccess = storedAccess[emailKey] || ['Dashboard'];
          return {
            id: `SADM-${String(sub.id).padStart(3, '0')}`,
            dbId: sub.id,
            name: sub.name,
            email: sub.email,
            phone: sub.phone,
            menuAccess: menuAccess,
            status: (sub.is_active !== undefined ? sub.is_active === 1 : sub.status === 1) ? 'Active' : 'Inactive',
            created: formatDateTime(sub.createdAt || sub.created_at),
          };
        });
        setSubAdmins(mappedSubAdmins);
      }
    } catch (error) {
      console.error('Fetch sub-admins error:', error);
      triggerToast(error.message || 'Failed to fetch sub-admins from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchTime > 500) {
      lastFetchTime = now;
      fetchSubAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Form input states (Add)
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subPassword, setSubPassword] = useState('');
  const [subMenuAccess, setSubMenuAccess] = useState(['Dashboard']);
  const [subStatus, setSubStatus] = useState('Active');

  // Form input states (Edit)
  const [selectedSub, setSelectedSub] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState(''); // Optional password update
  const [editMenuAccess, setEditMenuAccess] = useState([]);
  const [editStatus, setEditStatus] = useState('Active');

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!subName.trim() || !subEmail.trim() || !subPhone.trim() || !subPassword.trim()) {
      triggerToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const response = await subadminService.addSubAdmin(
        subName.trim(),
        subEmail.trim(),
        subPhone.trim(),
        subPassword.trim(),
        subStatus
      );

      if (response && response.success) {
        // Save menu access to localStorage mapped by email
        saveStoredMenuAccess(subEmail.trim(), subMenuAccess);

        triggerToast(`Sub-Admin account for "${subName.trim()}" created successfully!`, 'success');

        // Reset fields & close
        setSubName('');
        setSubEmail('');
        setSubPhone('');
        setSubPassword('');
        setSubMenuAccess(['Dashboard']);
        setSubStatus('Active');
        setShowPassword(false);
        setOpenAddDialog(false);

        // Refresh list
        fetchSubAdmins();
      } else {
        triggerToast(response.message || 'Failed to create sub-admin', 'error');
      }
    } catch (err) {
      console.error('Add Sub-Admin error:', err);
      triggerToast(err.message || 'An error occurred while creating the sub-admin', 'error');
    }
  };

  const handleOpenEdit = (sub) => {
    setSelectedSub(sub);
    setEditName(sub.name);
    setEditEmail(sub.email);
    setEditPhone(sub.phone);
    setEditPassword(''); // Blank initially, only updated if typed
    setEditMenuAccess(sub.menuAccess || []);
    setEditStatus(sub.status);
    setShowPassword(false);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim()) {
      triggerToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const dbId = selectedSub.dbId;
      const response = await subadminService.updateSubAdmin(
        dbId,
        editName.trim(),
        editEmail.trim(),
        editPhone.trim(),
        editPassword.trim(),
        editStatus
      );

      if (response && response.success) {
        // If email has changed, we should clean up the old email storage
        if (selectedSub.email.toLowerCase() !== editEmail.trim().toLowerCase()) {
          deleteStoredMenuAccess(selectedSub.email);
        }
        // Save menu access to localStorage mapped by email
        saveStoredMenuAccess(editEmail.trim(), editMenuAccess);

        if (editPassword.trim()) {
          triggerToast(`Account for "${editName}" updated successfully (including password)!`, 'success');
        } else {
          triggerToast(`Account for "${editName}" updated successfully!`, 'success');
        }
        setOpenEditDialog(false);
        // Refresh list
        fetchSubAdmins();
      } else {
        triggerToast(response.message || 'Failed to update sub-admin', 'error');
      }
    } catch (err) {
      console.error('Edit Sub-Admin error:', err);
      triggerToast(err.message || 'An error occurred while updating the sub-admin', 'error');
    }
  };

  const handleOpenDelete = (sub) => {
    setSelectedSub(sub);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSub) {
      try {
        const dbId = selectedSub.dbId;
        const response = await subadminService.deleteSubAdmin(dbId);
        if (response && response.success) {
          // Delete menu access mapping from localStorage
          deleteStoredMenuAccess(selectedSub.email);

          triggerToast(`Sub-Admin account for "${selectedSub.name}" has been deleted.`, 'error');
          setOpenDeleteDialog(false);
          // Refresh list
          fetchSubAdmins();
        } else {
          triggerToast(response.message || 'Failed to delete sub-admin', 'error');
        }
      } catch (err) {
        console.error('Delete Sub-Admin error:', err);
        triggerToast(err.message || 'An error occurred while deleting the sub-admin', 'error');
      }
    }
  };

  const filteredSubAdmins = subAdmins.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
    const matchesMenu = menuFilter === 'All' || (sub.menuAccess && sub.menuAccess.includes(menuFilter));

    return matchesSearch && matchesStatus && matchesMenu;
  });

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      {/* Header with Title & Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sub-Admins
          </h2>
        </div>
        <button
          onClick={() => setOpenAddDialog(true)}
          className="flex items-center gap-2 text-white bg-gradient-to-r from-primary to-secondary hover:from-[#7C3AED] hover:to-[#8B5CF6] px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(109,40,217,0.25)]"
        >
          <Plus className="w-4 h-4" />
          Add Sub-Admin
        </button>
      </div>

      {/* Main card Sub-Admin directory */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100 bg-white gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all duration-200 text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-primary outline-none transition-all text-slate-700 font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            <select
              value={menuFilter}
              onChange={(e) => setMenuFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:border-primary outline-none transition-all text-slate-700 font-semibold"
            >
              <option value="All">All Menus</option>
              {availableMenus.map((menu) => (
                <option key={menu} value={menu}>
                  {menu}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100">
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 pl-6">ID</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Sub-Admin</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Contact Details</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Menu Access</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Created At</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-center">Status</th>
                <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-6 py-3 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-400">Loading sub-admins...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSubAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-slate-300 opacity-50" />
                      <span className="text-xs font-semibold text-slate-400">No sub-admins found matching criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubAdmins.map((sub) => {
                  const isActive = sub.status === 'Active';
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-violet-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 pl-6 whitespace-nowrap">
                        <span className="text-xs font-extrabold text-slate-400">
                          {sub.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm flex-shrink-0"
                            style={{ background: getAvatarGradient(sub.name) }}
                          >
                            {getInitials(sub.name)}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{sub.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-650">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {sub.email}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-650">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {sub.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {sub.menuAccess && sub.menuAccess.map((menu) => (
                            <span
                              key={menu}
                              className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-primary/10 text-primary border border-primary/5 whitespace-nowrap"
                            >
                              {menu}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-slate-500 font-medium">
                          {sub.created}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                            : 'bg-red-50 text-red-600 border-red-500/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            title="Configure Details"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all duration-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(sub)}
                            title="Delete Sub-Admin"
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

      {/* DIALOG 1: Add Sub-Admin */}
      {openAddDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-white">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Register Sub-Admin</h3>
            </div>
            <form onSubmit={handleAddSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. abc@gmail.com"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={subPhone}
                      onChange={(e) => setSubPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={subPassword}
                        onChange={(e) => setSubPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permissions matrix */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Menu Access Permissions
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableMenus.map((menu) => {
                      const isChecked = subMenuAccess.includes(menu);
                      return (
                        <div
                          key={menu}
                          onClick={() => {
                            if (isChecked) {
                              setSubMenuAccess(subMenuAccess.filter((m) => m !== menu));
                            } else {
                              setSubMenuAccess([...subMenuAccess, menu]);
                            }
                          }}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100/70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="h-3.5 w-3.5 text-primary border-slate-300 rounded focus:ring-primary pointer-events-none"
                          />
                          <span className="text-xs font-semibold leading-none">{menu}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status *
                  </label>
                  <select
                    value={subStatus}
                    onChange={(e) => setSubStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-primary text-slate-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenAddDialog(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:from-primary-dark hover:to-secondary-dark transition-colors shadow-md"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: Edit Sub-Admin */}
      {openEditDialog && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-white">
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-[#8B5CF6] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Modify Sub-Admin Account</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                {selectedSub && (
                  <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase mb-0.5">
                      Account Identifier
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 block">
                      ID: {selectedSub.id}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Registered on: <strong className="text-slate-650 font-semibold">{selectedSub.created}</strong>
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. abc@gmail.com"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Reset Password (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Leave blank to keep current"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:border-primary outline-none transition-all text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permissions matrix */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Menu Access Permissions
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableMenus.map((menu) => {
                      const isChecked = editMenuAccess.includes(menu);
                      return (
                        <div
                          key={menu}
                          onClick={() => {
                            if (isChecked) {
                              setEditMenuAccess(editMenuAccess.filter((m) => m !== menu));
                            } else {
                              setEditMenuAccess([...editMenuAccess, menu]);
                            }
                          }}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'border-[#8B5CF6] bg-purple-50/50 text-[#8B5CF6]'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100/70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="h-3.5 w-3.5 text-[#8B5CF6] border-slate-300 rounded focus:ring-[#8B5CF6] pointer-events-none"
                          />
                          <span className="text-xs font-semibold leading-none">{menu}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-primary text-slate-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenEditDialog(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg transition-colors shadow-md animate-fadeIn"
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
              <h3 className="text-sm font-extrabold text-red-500 tracking-tight">Delete SubAdmin</h3>
            </div>
            <div className="px-6 pb-4">
              <p className="text-xs text-slate-650 leading-relaxed">
                Are you sure you want to delete sub-admin <strong>"{selectedSub?.name}"</strong>?
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

export default SubAdminsView;

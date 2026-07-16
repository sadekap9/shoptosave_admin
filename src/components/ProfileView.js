import React, { useState } from 'react';
import {
  Edit3,
  Save,
  X,
  Shield,
  Lock,
  History
} from 'lucide-react';

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ProfileView = ({ adminProfile, onUpdateProfile, triggerToast }) => {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Form Fields State
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [phone, setPhone] = useState(adminProfile.phone);

  // Validation errors
  const [errors, setErrors] = useState({});

  const handleCancel = () => {
    setName(adminProfile.name);
    setEmail(adminProfile.email);
    setPhone(adminProfile.phone);
    setErrors({});
    setEditMode(false);
    triggerToast('Profile changes discarded', 'info');
  };

  const handleSave = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!phone.trim()) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerToast('Please fix the errors in the form', 'error');
      return;
    }

    const initials = getInitials(name);
    const updated = {
      ...adminProfile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarInitials: initials,
    };

    onUpdateProfile(updated);
    setEditMode(false);
    triggerToast('Administrator profile updated successfully!', 'success');
  };

  return (
    <div className="w-full max-w-full box-border animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Administrator Account Profile
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your credentials, edit security configurations, and view workspace status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 items-start">
        {/* LEFT COLUMN: AVATAR & QUICK STATS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          {/* Gradient Avatar Header */}
          <div className="p-8 flex flex-col items-center text-center bg-[#F8FAFC] border-b border-slate-200/80">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-extrabold text-3xl shadow-lg bg-gradient-to-r from-primary to-secondary mb-5">
              {adminProfile.avatarInitials}
            </div>
            <h3 className="font-extrabold text-base text-slate-900 leading-snug">
              {adminProfile.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {adminProfile.email}
            </p>

            <div className="flex gap-2 mt-5 flex-wrap justify-center">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-emerald-50 text-emerald-600 border-emerald-500/10">
                Status: Online
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-primary/10 text-primary border-primary/5">
                Role: Super Admin
              </span>
            </div>
          </div>

          {/* Security details quick stats */}
          <div className="p-6 space-y-4 text-xs font-semibold">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Security &amp; Access Meta
            </span>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Access Group</span>
              <span className="text-slate-900 font-bold">System Admins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Access Level</span>
              <span className="text-primary font-bold">Level 5 (Max)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">2FA Status</span>
              <span className="text-emerald-500 font-bold">Enabled (MFA)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Session Age</span>
              <span className="text-slate-900 font-bold">1h 40m</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL TABS & SETTINGS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Tab bar header */}
          <div className="border-b border-slate-200 bg-white px-6 flex gap-1">
            <button
              onClick={() => setActiveTab(0)}
              className={`px-4 py-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === 0
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              General Info
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`px-4 py-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === 1
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              Security &amp; System Policy
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* TAB 0: GENERAL INFO */}
            {activeTab === 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900">
                    Administrative Identity &amp; Contact Info
                  </h3>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 border border-primary/20 text-primary hover:bg-[#F5F3FF] px-4 py-2 text-xs font-bold rounded-lg transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Full Name
                    </span>
                    {editMode ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-primary outline-none transition-all"
                        />
                        {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name}</span>}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-800 block">{adminProfile.name}</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Role
                    </span>
                    <span className="text-xs font-bold text-slate-450 block">{adminProfile.role}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Email Address
                    </span>
                    {editMode ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-primary outline-none transition-all"
                        />
                        {errors.email && <span className="text-[10px] text-red-500 font-semibold">{errors.email}</span>}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-800 block">{adminProfile.email}</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Phone Number
                    </span>
                    {editMode ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-primary outline-none transition-all"
                        />
                        {errors.phone && <span className="text-[10px] text-red-500 font-semibold">{errors.phone}</span>}
                      </div>
                    ) : (
                      <span className="text-xs font-mono font-bold text-slate-800 block">{adminProfile.phone}</span>
                    )}
                  </div>
                </div>

                {editMode && (
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 text-xs font-bold rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 text-white bg-primary hover:bg-[#5B21B6] px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: SECURITY & SYSTEM POLICY */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <h3 className="font-bold text-sm text-slate-900">
                  Security Architecture &amp; Logging Protocols
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200/60 bg-emerald-500/5 flex gap-3">
                    <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        Multi-Factor Authentication (MFA)
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                        MFA via Google Authenticator is strictly enforced for your administrator account.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/60 bg-primary/5 flex gap-3">
                    <Lock className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        Cryptographic Session Logs
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                        All administrator requests are signed and logged via secure SHA-256 hashing.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/60 bg-slate-50 flex gap-3 md:col-span-2">
                    <History className="w-5 h-5 text-slate-450 flex-shrink-0" />
                    <div className="w-full">
                      <h4 className="text-xs font-bold text-slate-900 mb-1">
                        Recent Security Access Auditing
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal mb-3 font-semibold">
                        The following logins were registered for this identity:
                      </p>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-[10px] text-slate-650 flex-wrap gap-2">
                          <span className="font-bold">2026-05-22 16:59 (Current Session)</span>
                          <span className="text-emerald-500 font-bold">IP: 103.45.12.89 (Delhi, IN)</span>
                        </div>
                        <div className="border-t border-slate-200" />
                        <div className="flex justify-between items-center text-[10px] text-slate-450 flex-wrap gap-2">
                          <span className="font-semibold">2026-05-21 10:14 (Expired)</span>
                          <span className="font-semibold">IP: 103.45.12.89 (Delhi, IN)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;

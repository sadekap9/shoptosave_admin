import React from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import useLoginViewModel from '../viewmodels/useLoginViewModel';

export default function Login({ onLoginSuccess, sessionExpired }) {
  const {
    email,
    password,
    showPassword,
    emailError,
    passwordError,
    isLoading,
    apiError,
    handleEmailChange,
    handlePasswordChange,
    toggleShowPassword,
    handleSubmit,
  } = useLoginViewModel(onLoginSuccess);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_10%_20%,rgba(109,40,217,0.08)_0%,rgba(139,92,246,0.05)_50%,rgba(248,250,252,1)_100%)] relative overflow-hidden px-4">
      {/* Decorative background shapes */}
      <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-purple-700/5 to-purple-500/5 blur-[80px] z-0 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-violet-500/5 to-pink-500/5 blur-[100px] z-0 pointer-events-none" />

      <div className="w-full max-w-[440px] z-10 rounded-[24px] shadow-[0_20px_40px_-15px_rgba(109,40,217,0.1),0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200/80 backdrop-blur-xl bg-white/95 transition-all duration-300 hover:shadow-[0_30px_60px_-20px_rgba(109,40,217,0.15),0_2px_5px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 p-8 sm:p-10 animate-fadeIn">
        {/* Header / Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-[54px] h-[54px] rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-[0_8px_20px_rgba(109,40,217,0.3)] mb-4">
            <ShieldCheck className="w-[30px] h-[30px]" />
          </div>
          <h1 className="text-[2rem] font-[850] text-[#0F172A] tracking-tight leading-none text-center">
            Shop2Save
          </h1>
          <p className="text-[#64748B] font-semibold tracking-wider uppercase text-[0.72rem] mt-2">
            Admin Management Portal
          </p>
        </div>

        {/* Error alerts */}
        {sessionExpired && !apiError && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 text-[0.78rem] font-semibold flex items-start gap-2">
            <span className="mt-0.5 text-base leading-none">⚠️</span>
            <div>Session expired, please login again</div>
          </div>
        )}

        {apiError && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-500 text-[0.78rem] font-semibold flex items-start gap-2">
            <span className="mt-0.5 text-base leading-none">⚠️</span>
            <div>{apiError}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-6">
            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[0.875rem] font-medium text-[#64748B]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${emailError ? 'text-red-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type="email"
                  id="email"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white outline-none transition-all duration-200 text-sm ${
                    emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-200 hover:border-accent focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {emailError && (
                <span className="text-[0.7rem] font-medium text-red-500 mx-2 mt-1">
                  {emailError}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[0.875rem] font-medium text-[#64748B]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${passwordError ? 'text-red-500' : 'text-slate-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-white outline-none transition-all duration-200 text-sm ${
                    passwordError
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-200 hover:border-accent focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <span className="text-[0.7rem] font-medium text-red-500 mx-2 mt-1">
                  {passwordError}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary shadow-[0_4px_14px_rgba(109,40,217,0.2)] transition-all duration-300 hover:from-[#7C3AED] hover:to-[#8B5CF6] hover:shadow-[0_6px_20px_rgba(109,40,217,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In to Admin Portal'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-[0.7rem] font-semibold text-slate-400 pointer-events-none">
        &copy; {new Date().getFullYear()} Shop2Save. All rights reserved.
      </div>
    </div>
  );
}

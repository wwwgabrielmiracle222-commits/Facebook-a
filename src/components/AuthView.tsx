import React, { useState } from 'react';
import { User } from '../types';
import { CURRENT_USER, SAMPLE_USERS } from '../data/initialData';
import { LogIn, UserPlus, Eye, EyeOff, X, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
  darkMode: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, darkMode }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available sample accounts for fast 1-tap login
  const recentAccounts: User[] = [
    CURRENT_USER,
    SAMPLE_USERS.sarah,
    SAMPLE_USERS.david,
    SAMPLE_USERS.maya,
    SAMPLE_USERS.marcus,
  ];

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your mobile number or email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    // Match against known sample users or create custom session
    const normalizedInput = emailOrPhone.trim().toLowerCase();
    const matchedAccount = recentAccounts.find(
      (acc) =>
        acc.name.toLowerCase().includes(normalizedInput) ||
        acc.id.toLowerCase().includes(normalizedInput)
    );

    if (matchedAccount) {
      onLogin(matchedAccount);
    } else {
      // Create user session with the entered identifier
      const customUser: User = {
        id: `user_${Date.now()}`,
        name: emailOrPhone.split('@')[0] || emailOrPhone,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        bio: 'Hello! I am using Facebook A.',
        joinedDate: 'Just now',
        friendsCount: 0,
      };
      onLogin(customUser);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: newUserName.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      bio: 'New to Facebook A! 👋',
      joinedDate: 'Just now',
      friendsCount: 0,
    };

    onLogin(newUser);
    setShowCreateModal(false);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between ${darkMode ? 'bg-[#18191A] text-gray-100' : 'bg-[#F0F2F5] text-slate-900'}`}>
      {/* Top Facebook A Header */}
      <header className="bg-[#1877F2] text-white py-3 px-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-md mx-auto w-full">
          <div className="bg-white text-[#1877F2] font-black text-xl w-8 h-8 rounded flex items-center justify-center shadow-inner tracking-tighter">
            f
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-tight font-sans">facebook</span>
            <span className="text-[10px] uppercase font-semibold text-blue-100 tracking-widest -mt-0.5">a</span>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-4">
        {/* Recent Accounts / 1-Tap Login */}
        <div
          className={`p-4 rounded-xl border shadow-xs transition-colors ${
            darkMode ? 'bg-[#242526] border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3 border-b pb-2 border-gray-100 dark:border-gray-700/80">
            <div>
              <h2 className="font-bold text-sm">Recent Accounts</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Click your picture to log in.</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {recentAccounts.slice(0, 4).map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => onLogin(acc)}
                className={`flex flex-col items-center p-3 rounded-lg border text-center transition-all cursor-pointer group hover:border-blue-400 hover:shadow-xs active:scale-[0.98] ${
                  darkMode
                    ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-800'
                    : 'bg-gray-50 border-gray-200 hover:bg-blue-50/50'
                }`}
              >
                <div className="relative mb-2">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 group-hover:border-blue-500 transition-colors shadow-2xs"
                  />
                  {acc.verified && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold truncate max-w-full text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {acc.name}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  1-Tap Login
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Login Form */}
        <div
          className={`p-4 rounded-xl border shadow-xs transition-colors ${
            darkMode ? 'bg-[#242526] border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h3 className="font-bold text-xs uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">
            Log In to Another Account
          </h3>

          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Mobile number or email"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className={`w-full p-2.5 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-slate-900 placeholder-gray-400'
                }`}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2.5 text-xs rounded-lg border outline-none focus:ring-1 focus:ring-blue-500 pr-9 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-slate-900 placeholder-gray-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
          </form>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-gray-200 dark:border-gray-700 w-full" />
            <span className="absolute bg-white dark:bg-[#242526] px-2 text-[10px] uppercase font-bold text-gray-400">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2.5 bg-[#42B72A] hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
        </div>
      </main>

      {/* Footer with Language Selection & Info */}
      <footer className="max-w-md mx-auto w-full px-4 py-4 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
          <span className="font-semibold text-gray-700 dark:text-gray-200">English (US)</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Español</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Français</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Português</span>
        </div>
        <p className="text-[10px]">Meta © 2026 • Facebook A Web Experience</p>
      </footer>

      {/* Create New Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transition-colors ${
              darkMode ? 'bg-[#242526] text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className="p-3 border-b flex items-center justify-between border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-sm">Create a New Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="First and Last name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-lg border outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                  autoFocus
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newUserName.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#42B72A] hover:bg-green-600 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Join Facebook A
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transition-colors ${
              darkMode ? 'bg-[#242526] text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className="p-3 border-b flex items-center justify-between border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-sm">Find Your Account</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-gray-600 dark:text-gray-300">
                In this demo mode, you can simply click on any of the recent accounts on the home screen to log in immediately with one tap!
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  onLogin(CURRENT_USER);
                }}
                className="w-full py-2 bg-[#1877F2] text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
              >
                Log in as {CURRENT_USER.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

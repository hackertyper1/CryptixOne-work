import React, { useState, useEffect } from 'react';
import { User, SystemSettings, AdminMessage } from '../types';
import { 
  User as UserIcon,
  UserCheck, 
  Lock, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Fingerprint,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

import TopTradersView from './TopTradersView';

interface AccountSectionProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  onLogin: (userOrEmail: string, pass: string) => boolean;
  onSignup: (userData: Omit<User, 'id' | 'depositWallet' | 'profitWallet' | 'activeInvestment' | 'traderName' | 'traderPhone' | 'createdAt'>, pass: string) => void;
  onSocialLogin?: (provider: 'google' | 'facebook') => void;
  systemSettings: SystemSettings;
  onLogout: () => void;
  users: User[];
  adminMessages: AdminMessage[];
  initialMode?: 'login' | 'signup';
  onUpdateSlCode?: (userId: string, slCode: string) => void;
  soundEffectsEnabled?: boolean;
  onToggleSoundEffects?: (enabled: boolean) => void;
}

export default function AccountSection({
  isLoggedIn,
  currentUser,
  onLogin,
  onSignup,
  onSocialLogin,
  systemSettings,
  onLogout,
  users,
  adminMessages,
  initialMode = 'login',
  onUpdateSlCode,
  soundEffectsEnabled = true,
  onToggleSoundEffects
}: AccountSectionProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);

  // Luxury Mobile Settings States
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(`cryptix_biometrics_${currentUser?.username || 'anon'}`);
    return stored ? JSON.parse(stored) : true;
  });
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  // Login inputs
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup inputs
  const [signupName, setSignupName] = useState('');
  const [signupUser, setSignupUser] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupWhatsApp, setSignupWhatsApp] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirmPass, setSignupConfirmPass] = useState('');
  const [signupError, setSignupError] = useState('');
  const [profession, setProfession] = useState('');
  const [dob, setDob] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUser || !loginPass) {
      setLoginError('Please enter both credentials');
      return;
    }
    const success = onLogin(loginUser, loginPass);
    if (!success) {
      setLoginError('Invalid credentials. Check Username/Email and password.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const trimmedName = signupName.trim();
    const trimmedUser = signupUser.trim().toLowerCase();
    const trimmedEmail = signupEmail.trim().toLowerCase();
    const trimmedPhone = signupPhone.trim();

    // 1. Presence check (all fields compulsory)
    if (!trimmedName) {
      setSignupError('Full Name is required and cannot be blank.');
      return;
    }
    if (!trimmedUser) {
      setSignupError('Username is required and cannot be blank.');
      return;
    }
    if (!trimmedEmail) {
      setSignupError('Email address is required and cannot be blank.');
      return;
    }
    if (!trimmedPhone) {
      setSignupError('Mobile Phone Number is required and cannot be blank.');
      return;
    }
    if (!signupPass) {
      setSignupError('Password is required.');
      return;
    }
    if (!signupConfirmPass) {
      setSignupError('Please confirm your password.');
      return;
    }

    // 2. Format checks
    // Full Name: Alphabetic + spaces, min 3 characters
    const nameRegex = /^[A-Za-z\s]{3,50}$/;
    if (!nameRegex.test(trimmedName)) {
      setSignupError('Full Name must contain only alphabets and spaces, and be at least 3 characters long.');
      return;
    }

    // Username: Alphanumeric + underscore, no spaces, min 3 characters
    const userRegex = /^[a-z0-9_]{3,20}$/;
    if (!userRegex.test(trimmedUser)) {
      setSignupError('Username must be 3-20 characters long and can only contain lowercase letters, numbers, and underscores (no spaces).');
      return;
    }

    // Email address: Standard email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setSignupError('Please enter a valid email address (e.g. sandip@gmail.com).');
      return;
    }

    // Mobile Phone No: 10 digits starting with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setSignupError('Mobile Phone Number must be exactly 10 digits and start with 6, 7, 8, or 9.');
      return;
    }

    // Password strength: min 6 characters
    if (signupPass.length < 6) {
      setSignupError('Password must be at least 6 characters long for security compliance.');
      return;
    }

    // Password match check
    if (signupPass !== signupConfirmPass) {
      setSignupError('Passwords do not match. Please verify both passwords.');
      return;
    }

    // 3. Uniqueness checks (against existing users array)
    const isUsernameTaken = users.some(u => u.username.toLowerCase() === trimmedUser);
    if (isUsernameTaken) {
      setSignupError('This Username is already registered. Please choose a different one.');
      return;
    }

    const isEmailTaken = users.some(u => u.email.toLowerCase() === trimmedEmail);
    if (isEmailTaken) {
      setSignupError('This Email Address is already registered. Please log in or use another email.');
      return;
    }

    // If everything is completely correct, proceed to registration
    onSignup({
      name: trimmedName,
      username: trimmedUser,
      email: trimmedEmail,
      phone: trimmedPhone,
      whatsapp: trimmedPhone, // fallback
      profession: 'Trader', // default
      dob: '2000-01-01' // default
    }, signupPass);
  };

  const [view, setView] = useState<'profile' | 'security' | 'messages' | 'top-traders'>('profile');

  if (isLoggedIn && view === 'top-traders') {
    return <TopTradersView currentUser={currentUser} onBack={() => setView('profile')} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto bg-[#0b101f] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-left" id="auth-portal-card">
        <div className="flex justify-center">
          <div className="flex bg-[#050914] p-1 rounded-xl border border-slate-800 space-x-1 w-full text-center">
            <button
              id="btn-switch-login"
              onClick={() => { setAuthMode('login'); setLoginError(''); }}
              className={`flex-1 py-2.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${
                authMode === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="btn-switch-register"
              onClick={() => { setAuthMode('signup'); setSignupError(''); }}
              className={`flex-1 py-2.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${
                authMode === 'signup' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white font-display">Welcome Back</h3>
              <p className="text-xs text-slate-400">Please enter your details to access your account.</p>
            </div>

            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-400 text-xs">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Username or Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  id="login-username"
                  placeholder="Username"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 text-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  id="login-password"
                  placeholder="Password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 text-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3.5 rounded-xl uppercase tracking-widest transition-all"
            >
              Login Now
            </button>

            {/* Social Login Dividers */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                <span className="px-2 bg-[#0b101f] text-slate-500">Or Continue With</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSocialLogin?.('google')}
                className="flex items-center justify-center space-x-2 py-3 bg-[#070b14] border border-slate-800 rounded-xl hover:bg-[#111827] transition-all group"
              >
                <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-color-icon.png" alt="Google" className="w-4 h-4" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Google</span>
              </button>
              <button
                type="button"
                onClick={() => onSocialLogin?.('facebook')}
                className="flex items-center justify-center space-x-2 py-3 bg-[#070b14] border border-slate-800 rounded-xl hover:bg-[#111827] transition-all group"
              >
                <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/facebook-app-round-white-icon.png" alt="Facebook" className="w-4 h-4" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Facebook</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Encrypted Session</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-4" id="register-form">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white font-display">Create Account</h3>
              <p className="text-xs text-slate-400">Join our trading community today.</p>
            </div>

            {signupError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-400 text-xs">
                {signupError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Full Name</label>
              <input
                type="text"
                required
                id="signup-name"
                placeholder="Full Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 text-slate-200 py-3 px-4 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Username</label>
                <input
                  type="text"
                  required
                  id="signup-username"
                  placeholder="Username"
                  value={signupUser}
                  onChange={(e) => setSignupUser(e.target.value.replace(/\s+/g, '').toLowerCase())}
                  className="w-full bg-[#070b14] border border-slate-800 text-slate-200 py-3 px-4 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Email Address</label>
                <input
                  type="email"
                  required
                  id="signup-email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 text-slate-200 py-3 px-4 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Mobile Number</label>
              <input
                type="text"
                required
                id="signup-phone"
                placeholder="Mobile Number"
                maxLength={10}
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-[#070b14] border border-slate-800 text-slate-200 py-3 px-4 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Password</label>
                <input
                  type="password"
                  required
                  id="signup-password"
                  placeholder="Password"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 text-slate-200 py-3 px-4 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Confirm</label>
                <input
                  type="password"
                  required
                  id="signup-confirm-pass"
                  placeholder="Confirm"
                  value={signupConfirmPass}
                  onChange={(e) => setSignupConfirmPass(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 text-slate-200 py-3 px-4 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-signup-submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3.5 rounded-xl uppercase tracking-widest transition-all mt-2"
            >
              Sign Up Now
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                <span className="px-2 bg-[#0b101f] text-slate-500">Fast Registration</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSocialLogin?.('google')}
                className="flex items-center justify-center space-x-2 py-3 bg-[#070b14] border border-slate-800 rounded-xl hover:bg-[#111827] transition-all group"
              >
                <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-color-icon.png" alt="Google" className="w-4 h-4" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Google</span>
              </button>
              <button
                type="button"
                onClick={() => onSocialLogin?.('facebook')}
                className="flex items-center justify-center space-x-2 py-3 bg-[#070b14] border border-slate-800 rounded-xl hover:bg-[#111827] transition-all group"
              >
                <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/facebook-app-round-white-icon.png" alt="Facebook" className="w-4 h-4" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Facebook</span>
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left" id="account-section-container">
      {/* Individual Compliance Marquee */}
      {isLoggedIn && currentUser?.complianceMessages && currentUser.complianceMessages.length > 0 && (
        <div className="bg-red-500/10 border-y border-red-500/20 py-2 overflow-hidden mb-2" id="user-compliance-marquee">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-[10px] md:text-xs font-black text-red-500 uppercase tracking-[0.2em] px-4">
              {currentUser.complianceMessages.map(msg => `*** ${msg} ***`).join(' ')}
            </span>
          </div>
        </div>
      )}

      {/* Account Restriction Alert */}
      {isLoggedIn && currentUser?.isWithdrawalLocked && (
        <div className="bg-rose-600/10 border border-rose-500/20 rounded-[1.5rem] p-5 mb-6 flex flex-col items-center text-center space-y-3 shadow-lg shadow-rose-500/5">
          <div className="p-3 bg-rose-500/20 rounded-full border border-rose-500/30 text-rose-500">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Withdrawal Restricted</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Your account withdrawal status has been restricted due to an institutional audit flag.
            </p>
          </div>
          {currentUser.restrictionReason && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-500/20 w-full">
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-2">Audit Reason:</span>
              <p className="text-xs text-white font-bold italic font-display leading-tight italic">
                "{currentUser.restrictionReason}"
              </p>
            </div>
          )}
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Please reach out to your assigned trader or support for audit resolution.</p>
        </div>
      )}

      {/* Luxury Mobile Account Profile Design - Midnight Premium Theme */}
      <section className="md:hidden bg-[#05070a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8" id="mobile-profile-modern">
        {/* Deep Slate Banner with Ambient Glow */}
        <div className="bg-[#0a0c14] p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -mr-24 -mt-24 blur-[40px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full -ml-16 -mb-16 blur-[30px]" />
          
          <div className="flex items-center space-x-5 relative z-10 w-full">
            {/* Avatar Circle with Ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-md opacity-50" />
              <div className="w-16 h-16 bg-slate-900 border-2 border-white/20 rounded-full flex items-center justify-center text-2xl font-black text-white relative z-10 shadow-2xl">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="text-left flex-grow min-w-0">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                  <h3 className="text-xl font-black text-white tracking-tight truncate max-w-[150px] allow-copy">{currentUser?.name}</h3>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1 flex-shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Verified</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate allow-copy">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Credential Passport Row Blocks */}
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[#0a0c14]/60 p-5 rounded-[1.5rem] border border-white/5 space-y-3.5">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] block font-mono">Institutional Credentials</span>
            
            {/* SL Code */}
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-3" id="sl-code-account-row">
              <span className="text-[11px] text-slate-400 font-bold font-mono uppercase tracking-wider">SL Code</span>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                  <span className="text-[11px] text-slate-300 font-mono uppercase tracking-[0.05em] font-black allow-copy">
                    {currentUser?.slCode || 'SL-568-725'}
                  </span>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
              <span className="text-[11px] text-slate-400 font-bold font-mono uppercase tracking-wider">Username</span>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                <span className="text-[11px] text-slate-300 font-mono tracking-wide font-black allow-copy">{currentUser?.username}</span>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold font-mono uppercase tracking-wider">Mobile No</span>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                <span className="text-[11px] text-slate-300 font-mono tracking-tighter font-black allow-copy">+91 {currentUser?.phone}</span>
              </div>
            </div>
          </div>

          {/* Premium Biometrics and Security Settings (Mobile Only) */}
          <div className="bg-[#0a0c14]/60 p-5 rounded-[1.5rem] border border-white/5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
                <Fingerprint className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] font-mono">Sensory Security Settings</span>
            </div>

            {/* Biometric Toggle Switch */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col text-left">
                <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">FaceID / TouchID Login</span>
                <span className="text-[8.5px] text-slate-500 font-mono">Verified via local hardware enclave keys</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newState = !biometricEnabled;
                  setBiometricEnabled(newState);
                  localStorage.setItem(`cryptix_biometrics_${currentUser?.username || 'anon'}`, JSON.stringify(newState));
                  if (newState) {
                    toast.success("Biometric login activated.", {
                      description: "Hardware key signature successfully registered with Secure Enclave."
                    });
                  } else {
                    toast("Biometric login deactivated.", {
                      description: "Reverted to standard username and password authentication."
                    });
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  biometricEnabled ? 'bg-[#00C087]' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Anti-phishing security key */}
            <div className="flex items-center justify-between border-t border-white/[0.03] pt-3">
              <div className="flex flex-col text-left">
                <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Luxury Sensory Haptics</span>
                <span className="text-[8.5px] text-slate-500 font-mono">Delivers custom high-fidelity haptic feedback</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newState = !hapticsEnabled;
                  setHapticsEnabled(newState);
                  if (newState) {
                    toast.success("Haptic Sensory triggers activated.", {
                      description: "Micro haptic loops synced with physical touch events."
                    });
                  } else {
                    toast("Haptics muted.", {
                      description: "Deactivated sensory haptic physical triggers."
                    });
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hapticsEnabled ? 'bg-[#00C087]' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between border-t border-white/[0.03] pt-3">
              <div className="flex flex-col text-left">
                <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Sound Effects</span>
                <span className="text-[8.5px] text-slate-500 font-mono">Enable trade completion and alert audio alerts</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onToggleSoundEffects) {
                    onToggleSoundEffects(!soundEffectsEnabled);
                    if (!soundEffectsEnabled) {
                      toast.success("Sound Effects enabled.", {
                        description: "Audio alerts will play on trade completion."
                      });
                    } else {
                      toast("Sound Effects muted.", {
                        description: "Muted all website audio alerts."
                      });
                    }
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundEffectsEnabled ? 'bg-[#00C087]' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-3 py-4 bg-rose-500/5 text-rose-500 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest border border-rose-500/10 hover:bg-rose-500/10 transition-all active:scale-[0.98] mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Logout</span>
          </button>
        </div>
      </section>

      {/* 1. Official Verification Details (My Profile) - Desktop Version (Hidden on Mobile) */}
      <section className="hidden md:block bg-[#05070a] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl" id="user-profile-info-card">
        {/* Subtle Luxury Gradient Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full -mr-48 -mt-48 blur-[100px]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-8 mb-10 gap-6 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-xl" />
              <div className="w-24 h-24 bg-slate-900 border-2 border-white/10 rounded-full flex items-center justify-center text-4xl font-black text-white relative z-10 shadow-2xl shadow-blue-500/10">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-3xl font-black text-white tracking-tight allow-copy">
                  {currentUser?.name}
                </h3>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified Institution</span>
                </div>
              </div>
              <p className="text-slate-400 font-medium allow-copy">{currentUser?.email}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Portfolio Tier</span>
            <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-xl">
              <span className="text-sm font-black text-amber-500 uppercase tracking-widest">Elite Member</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl group hover:border-white/10 transition-all">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3">Client Identifier</span>
            <div className="flex items-center space-x-3">
              <UserIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-black text-white font-mono allow-copy">{currentUser?.username}</span>
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl group hover:border-white/10 transition-all">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3">Registered Mobile</span>
            <div className="flex items-center space-x-3">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-black text-white font-mono tracking-tighter allow-copy">+91 {currentUser?.phone}</span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl group hover:border-white/10 transition-all">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3">Unique UID</span>
            <div className="flex items-center space-x-3">
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-black text-white font-mono">{currentUser?.slCode || 'SL423633'}</span>
            </div>
          </div>
        </div>

        <div className="pt-10 mt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            <span>Institutional Account Verified Since: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          
          <button
            onClick={onLogout}
            id="btn-logout-main"
            className="flex items-center space-x-3 px-6 py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border border-rose-500/10 text-xs font-black rounded-2xl uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </section>

      {/* Luxury Advisor & Compliance Sections (Desktop + Mobile Unified Luxury) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Traders Button */}
        <button 
          onClick={() => setView('top-traders')}
          className="group relative flex flex-col items-center justify-center p-8 bg-[#05070a] border border-white/10 rounded-[2.5rem] hover:border-amber-500/30 transition-all overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <TrendingUp className="w-12 h-12 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Global Ranking</span>
          <h4 className="text-xl font-black text-white uppercase tracking-tight">Top Traders Dashboard</h4>
          <div className="mt-4 flex items-center space-x-2 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Real-time Ranking</span>
          </div>
        </button>

        {/* Advisor Card */}
        <section className="bg-[#05070a] border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-amber-500/10 transition-all" />
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <UserCheck className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-left">
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Portfolio Advisor</h4>
              <p className="text-sm font-black text-white">Designated Senior Wealth Manager</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Assigned Officer</span>
              <p className="text-sm font-black text-white">{currentUser?.traderName || systemSettings.traderName || 'Vikram Singhania (Senior Trader)'}</p>
              <div className="mt-2 flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Active & Monitoring</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:+91${currentUser?.traderPhone || systemSettings.traderPhone || '800324109'}`}
                className="flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] rounded-xl uppercase tracking-widest transition-all border border-white/10"
              >
                <Phone className="w-3 h-3" />
                <span>Call Now</span>
              </a>
              <a
                href={`https://wa.me/91${currentUser?.traderPhone || systemSettings.traderWhatsApp || '800324109'}?text=Hello%20Sir,%20I%20am%20registered%20as%20${currentUser?.username}%20on%20CryptixOne.%20Please%20guide%20my%20investment%20portfolio.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[9px] rounded-xl uppercase tracking-widest transition-all shadow-lg"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* Compliance Card with Scroll History */}
        <section className="bg-[#05070a] border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/10 transition-all" />
          
          <div className="flex items-center space-x-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Regulatory Framework</h4>
              <p className="text-sm font-black text-white">Directives & Compliance</p>
            </div>
          </div>
          
          <div className="relative z-10 h-[220px] overflow-y-auto pr-2 custom-scrollbar space-y-3" id="compliance-message-scroll-history">
            {(!currentUser?.complianceMessages || currentUser.complianceMessages.length === 0) && adminMessages.filter(m => m.recipientId === 'all').length === 0 ? (
              <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 text-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic">No active compliance directives found in the current audit cycle.</p>
              </div>
            ) : (
              <>
                {/* Individual Messages */}
                {currentUser?.complianceMessages?.map((msg, idx) => (
                  <div key={`ind-${idx}`} className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl space-y-2 group/msg hover:bg-red-500/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-black text-red-400 uppercase tracking-[0.2em] px-2 py-0.5 bg-red-400/10 rounded-full">Priority Directive</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-bold leading-relaxed">{msg}</p>
                  </div>
                ))}
                
                {/* Broadcast Messages */}
                {adminMessages.filter(m => m.recipientId === 'all').map((msg) => (
                  <div key={msg.id} className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl space-y-2 group/msg hover:bg-blue-500/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] px-2 py-0.5 bg-blue-400/10 rounded-full">System Broadcast</span>
                      <span className="text-[8px] text-slate-500 font-mono">{new Date(msg.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-tight">{msg.subject}</h5>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* Security & Biometrics Card */}
        <section className="bg-[#05070a] border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group md:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          
          <div className="flex items-center space-x-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Fingerprint className="w-6 h-6 text-[#00C087]" />
            </div>
            <div className="text-left">
              <h4 className="text-[10px] font-black text-[#00C087] uppercase tracking-[0.2em] mb-1">Luxury Security</h4>
              <p className="text-sm font-black text-white">Device Sensory Hardware</p>
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            {/* Biometrics */}
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">FaceID / TouchID Toggle</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">Hardware cryptographic signatures</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newState = !biometricEnabled;
                  setBiometricEnabled(newState);
                  localStorage.setItem(`cryptix_biometrics_${currentUser?.username || 'anon'}`, JSON.stringify(newState));
                  if (newState) {
                    toast.success("Biometric verification active.", {
                      description: "Hardware secure element handshake successful."
                    });
                  } else {
                    toast("Biometrics disabled.");
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  biometricEnabled ? 'bg-[#00C087]' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptics */}
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Luxury Sensory Haptics</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">High-fidelity haptic sensory loops</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newState = !hapticsEnabled;
                  setHapticsEnabled(newState);
                  if (newState) {
                    toast.success("High haptic sensation loops activated.");
                  } else {
                    toast("Haptic physical triggers deactivated.");
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hapticsEnabled ? 'bg-[#00C087]' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Sound Effects</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">Enable trade completion and alert audio alerts</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onToggleSoundEffects) {
                    onToggleSoundEffects(!soundEffectsEnabled);
                    if (!soundEffectsEnabled) {
                      toast.success("Sound Effects enabled.");
                    } else {
                      toast("Sound Effects muted.");
                    }
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundEffectsEnabled ? 'bg-[#00C087]' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <div className="w-1.5 h-1.5 bg-[#00C087] rounded-full" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Secure Hardware Enclave Synced</span>
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}

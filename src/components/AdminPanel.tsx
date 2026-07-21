import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Transaction, SystemSettings, ActivityLog, InvestmentRequest, AdminMessage, Post, ActiveTrade } from '../types';
import { formatIndianCurrency } from '../data';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, orderBy, setDoc } from 'firebase/firestore';
import { 
  ShieldCheck, 
  Lock, 
  Settings, 
  Users, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Sliders, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Activity,
  Award,
  BookOpen,
  ClipboardList,
  PieChart,
  MessageSquare,
  Send,
  UserPlus,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  LayoutDashboard
} from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  transactions: Transaction[];
  systemSettings: SystemSettings;
  activityLogs: ActivityLog[];
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onApproveTransaction: (txId: string) => void;
  onRejectTransaction: (txId: string) => void;
  onUpdateUserBalance: (userId: string, deposit: number, profit: number, active: number, traderName: string, traderPhone: string, slCode?: string) => void;
  investmentRequests: InvestmentRequest[];
  onApproveInvestmentRequest: (reqId: string) => void;
  onRejectInvestmentRequest: (reqId: string) => void;
  adminMessages: AdminMessage[];
  onSendMessage: (msg: Omit<AdminMessage, 'id' | 'timestamp' | 'sender' | 'read'>) => void;
}

export default function AdminPanel({
  users,
  transactions,
  systemSettings,
  activityLogs,
  onUpdateSettings,
  onApproveTransaction,
  onRejectTransaction,
  onUpdateUserBalance,
  investmentRequests = [],
  onApproveInvestmentRequest,
  onRejectInvestmentRequest,
  adminMessages,
  onSendMessage
}: AdminPanelProps) {
  // Authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Admin Internal tab Navigation: 'dashboard' | 'transactions' | 'settings' | 'users' | 'logs' | 'investments' | 'messages' | 'traders' | 'posts' | 'trades'
  const [adminTab, setAdminTab] = useState<'dashboard' | 'transactions' | 'settings' | 'users' | 'logs' | 'investments' | 'messages' | 'traders' | 'posts' | 'trades'>('dashboard');
  const [firestorePosts, setFirestorePosts] = useState<Post[]>([]);
  const [adminTrades, setAdminTrades] = useState<ActiveTrade[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFirestorePosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'trades'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAdminTrades(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActiveTrade)));
    });
    return () => unsubscribe();
  }, []);

  const approvePost = async (postId: string) => {
    await updateDoc(doc(db, 'posts', postId), { approved: true });
    toast.success('Post approved');
  };

  const rejectPost = async (postId: string) => {
    await updateDoc(doc(db, 'posts', postId), { approved: false });
    toast.error('Post rejected');
  };

  // Website setting inputs
  const [qrCodeInput, setQrCodeInput] = useState<string>(systemSettings.qrCodeUrl);
  const [scannerUrlInput, setScannerUrlInput] = useState<string>(systemSettings.scannerUrl || systemSettings.qrCodeUrl);
  const [qrCodeImage, setQrCodeImage] = useState<string>(systemSettings.qrCodeImage || '');
  const [upiIdInput, setUpiIdInput] = useState<string>(systemSettings.upiId);
  const [whatsappInput, setWhatsappInput] = useState<string>(systemSettings.supportWhatsApp);
  const [phoneInput, setPhoneInput] = useState<string>(systemSettings.supportPhone);
  const [emailInput, setEmailInput] = useState<string>(systemSettings.companyEmail);
  const [tradeTimeLimitInput, setTradeTimeLimitInput] = useState<number>(systemSettings.tradeTimeLimit || 60);
  const [settingsSuccess, setSettingsSuccess] = useState<boolean>(false);

  // Selector for which payment method to configure in Admin UI
  const [paymentConfigTab, setPaymentConfigTab] = useState<string>('upi');

  // Dynamic states for individual payment methods
  const [upiUpiId, setUpiUpiId] = useState<string>(systemSettings.upiUpiId || 'cryptixone.upi@sbi');
  const [upiQrCode, setUpiQrCode] = useState<string>(systemSettings.upiQrCode || '');

  const [upiQrUpiId, setUpiQrUpiId] = useState<string>(systemSettings.upiQrUpiId || 'cryptixone.qr@sbi');
  const [upiQrQrCode, setUpiQrQrCode] = useState<string>(systemSettings.upiQrQrCode || '');

  const [paytmUpiId, setPaytmUpiId] = useState<string>(systemSettings.paytmUpiId || 'cryptixone.paytm@sbi');
  const [paytmQrCode, setPaytmQrCode] = useState<string>(systemSettings.paytmQrCode || '');

  const [gpayUpiId, setGpayUpiId] = useState<string>(systemSettings.gpayUpiId || 'cryptixone.gpay@sbi');
  const [gpayQrCode, setGpayQrCode] = useState<string>(systemSettings.gpayQrCode || '');

  const [phonepeUpiId, setPhonepeUpiId] = useState<string>(systemSettings.phonepeUpiId || 'cryptixone.pe@sbi');
  const [phonepeQrCode, setPhonepeQrCode] = useState<string>(systemSettings.phonepeQrCode || '');

  const [icashUpiId, setIcashUpiId] = useState<string>(systemSettings.icashUpiId || 'cryptixone.icash@sbi');
  const [icashQrCode, setIcashQrCode] = useState<string>(systemSettings.icashQrCode || '');

  const [gatepayUpiId, setGatepayUpiId] = useState<string>(systemSettings.gatepayUpiId || 'cryptixone.gate@sbi');
  const [gatepayQrCode, setGatepayQrCode] = useState<string>(systemSettings.gatepayQrCode || '');

  // Dynamic states for crypto addresses
  const [binanceAddress, setBinanceAddress] = useState<string>(systemSettings.binanceAddress || 'binance-pay-id-872910291');
  const [tonkeeperAddress, setTonkeeperAddress] = useState<string>(systemSettings.tonkeeperAddress || 'UQCd3v0pP4H8A_UpxX5Wv8G9F_uS0qP9K3d2A1m7S8r5N6tY');
  const [otherCryptoAddress, setOtherCryptoAddress] = useState<string>(systemSettings.otherCryptoAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');

  // Synchronize inputs with settings config fetched in real-time from database
  useEffect(() => {
    setQrCodeInput(systemSettings.qrCodeUrl || '');
    setScannerUrlInput(systemSettings.scannerUrl || systemSettings.qrCodeUrl || '');
    setQrCodeImage(systemSettings.qrCodeImage || '');
    setUpiIdInput(systemSettings.upiId || '');
    setWhatsappInput(systemSettings.supportWhatsApp || '');
    setPhoneInput(systemSettings.supportPhone || '');
    setEmailInput(systemSettings.companyEmail || '');
    setTradeTimeLimitInput(systemSettings.tradeTimeLimit || 60);

    setUpiUpiId(systemSettings.upiUpiId || 'cryptixone.upi@sbi');
    setUpiQrCode(systemSettings.upiQrCode || '');
    setUpiQrUpiId(systemSettings.upiQrUpiId || 'cryptixone.qr@sbi');
    setUpiQrQrCode(systemSettings.upiQrQrCode || '');
    setPaytmUpiId(systemSettings.paytmUpiId || 'cryptixone.paytm@sbi');
    setPaytmQrCode(systemSettings.paytmQrCode || '');
    setGpayUpiId(systemSettings.gpayUpiId || 'cryptixone.gpay@sbi');
    setGpayQrCode(systemSettings.gpayQrCode || '');
    setPhonepeUpiId(systemSettings.phonepeUpiId || 'cryptixone.pe@sbi');
    setPhonepeQrCode(systemSettings.phonepeQrCode || '');
    setIcashUpiId(systemSettings.icashUpiId || 'cryptixone.icash@sbi');
    setIcashQrCode(systemSettings.icashQrCode || '');
    setGatepayUpiId(systemSettings.gatepayUpiId || 'cryptixone.gate@sbi');
    setGatepayQrCode(systemSettings.gatepayQrCode || '');

    setBinanceAddress(systemSettings.binanceAddress || 'binance-pay-id-872910291');
    setTonkeeperAddress(systemSettings.tonkeeperAddress || 'UQCd3v0pP4H8A_UpxX5Wv8G9F_uS0qP9K3d2A1m7S8r5N6tY');
    setOtherCryptoAddress(systemSettings.otherCryptoAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  }, [systemSettings]);

  // Message states
  const [messageRecipient, setMessageRecipient] = useState<string>('all');
  const [messageSubject, setMessageSubject] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [messageType, setMessageType] = useState<'individual' | 'broadcast' | 'announcement'>('broadcast');
  const [msgSuccess, setMsgSuccess] = useState<boolean>(false);

  // Dashboard Stats calculation
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && (t.status === 'completed' || t.status === 'approved'))
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && (t.status === 'completed' || t.status === 'approved'))
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const activeInvestmentPlans = users.filter(u => u.activeInvestment > 0).length;
  const activeUsers = users.length; // Simplified for this prototype

  // User editor states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDeposit, setEditDeposit] = useState<number>(0);
  const [editProfit, setEditProfit] = useState<number>(0);
  const [editActive, setEditActive] = useState<number>(0);
  const [editTraderName, setEditTraderName] = useState<string>('');
  const [editTraderPhone, setEditTraderPhone] = useState<string>('');
  const [editSlCode, setEditSlCode] = useState<string>('');

  // Encrypted Logs Toggle state
  const [decryptLogs, setDecryptLogs] = useState<boolean>(false);

  // Authenticate Admin Submit
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (adminUsername === 'admin' && adminPassword === 'supabase') {
      setIsAdminAuthenticated(true);
    } else {
      setAuthError('Access denied. Invalid high-security administrator credentials.');
    }
  };

  // Handle QR Code Image Upload (General fallback)
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generic helper to upload file QR for a specific setter
  const handleMethodQrUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update Settings Submit
  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      qrCodeUrl: qrCodeInput,
      upiId: upiIdInput,
      supportWhatsApp: whatsappInput,
      supportPhone: phoneInput,
      companyEmail: emailInput,
      scannerUrl: scannerUrlInput,
      qrCodeImage: qrCodeImage,
      tradeTimeLimit: Number(tradeTimeLimitInput) || 60,

      // Specific individual UPI payment methods
      upiUpiId,
      upiQrCode,
      upiQrUpiId,
      upiQrQrCode,
      paytmUpiId,
      paytmQrCode,
      gpayUpiId,
      gpayQrCode,
      phonepeUpiId,
      phonepeQrCode,
      icashUpiId,
      icashQrCode,
      gatepayUpiId,
      gatepayQrCode,

      // Cryptocurrencies (no QR, address changes only)
      binanceAddress,
      tonkeeperAddress,
      otherCryptoAddress
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Handle send message
  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage({
      recipientId: messageRecipient,
      subject: messageSubject,
      content: messageContent,
      type: messageType
    });
    setMsgSuccess(true);
    setMessageSubject('');
    setMessageContent('');
    setTimeout(() => setMsgSuccess(false), 3000);
  };

  const handleTraderUpdate = (userId: string, name: string, phone: string) => {
    // We can reuse onUpdateUserBalance but only update trader details
    const user = users.find(u => u.id === userId);
    if (user) {
      onUpdateUserBalance(
        userId,
        user.depositWallet,
        user.profitWallet,
        user.activeInvestment,
        name,
        phone
      );
    }
  };

  const startEditingUser = (user: User) => {
    setEditingUserId(user.id);
    setEditDeposit(user.depositWallet);
    setEditProfit(user.profitWallet);
    setEditActive(user.activeInvestment);
    setEditTraderName(user.traderName);
    setEditTraderPhone(user.traderPhone);
    setEditSlCode(user.slCode || '');
  };

  // Save User Balance / Trader modifications
  const handleUserSave = (userId: string) => {
    onUpdateUserBalance(userId, editDeposit, editProfit, editActive, editTraderName, editTraderPhone, editSlCode);
    setEditingUserId(null);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-slate-950 border border-red-500/20 rounded-3xl p-6 md:p-8 shadow-2xl text-left" id="admin-auth-card">
        <div className="flex justify-center mb-6">
          <div className="p-3.5 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl md:text-2xl font-black text-white font-display">CryptixOne Administration Gateway</h3>
          <p className="text-xs text-slate-400">Restricted zone. Authentication requires state audit keys & clearance.</p>
        </div>

        <form onSubmit={handleAdminAuth} className="space-y-4" id="admin-login-form">
          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-400 font-sans">
              {authError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Admin Username</label>
            <input
              type="text"
              required
              id="admin-username-input"
              placeholder="admin"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Master Password</label>
            <input
              type="password"
              required
              id="admin-password-input"
              placeholder="••••••••"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            id="btn-admin-submit"
            className="w-full bg-red-500 hover:bg-red-400 text-slate-950 font-black text-xs py-3 rounded-lg uppercase tracking-wider transition-all mt-2"
          >
            Authorize Terminal Access
          </button>
        </form>
      </div>
    );
  }

  // LOGGED IN ADMIN DASHBOARD VIEW
  return (
    <div className="space-y-8 text-left" id="admin-authorized-dashboard">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Administrator Node Connected</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-white tracking-tight font-display">Main Admin Control Terminal</h2>
          <p className="text-xs text-slate-400">Review claims, edit user limits, manage assigned traders, and update website configs.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#070b14] p-1 rounded-lg border border-slate-800 font-mono text-[11px] font-bold overflow-x-auto max-w-full space-x-1">
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'dashboard' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setAdminTab('transactions')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'transactions' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>Verify Payments ({transactions.filter(t => t.status === 'pending').length})</span>
          </button>
          <button
            id="btn-admin-tab-investments"
            onClick={() => setAdminTab('investments')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'investments' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-3 h-3" />
            <span>Investment Requests ({investmentRequests.filter(r => r.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setAdminTab('messages')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'messages' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Messages</span>
          </button>
          <button
            onClick={() => setAdminTab('traders')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'traders' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Traders Management</span>
          </button>
          <button
            onClick={() => setAdminTab('posts')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'posts' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Manage Posts</span>
          </button>
          <button
            id="btn-admin-tab-users"
            onClick={() => setAdminTab('users')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'users' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Clients ({users.length})</span>
          </button>
          <button
            id="btn-admin-tab-trades"
            onClick={() => setAdminTab('trades')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'trades' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Active Contracts ({adminTrades.filter(t => t.status === 'active').length})</span>
          </button>
          <button
            onClick={() => setAdminTab('settings')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'settings' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>Website Setting</span>
          </button>
          <button
            onClick={() => setAdminTab('logs')}
            className={`px-3 py-2 rounded transition-all uppercase flex items-center space-x-1 shrink-0 ${
              adminTab === 'logs' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Secure Audit Logs</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD STATS SECTION */}
      {adminTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="admin-dashboard-stats">
          <div className="bg-[#0b101f] border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Total Registered</p>
            <h4 className="text-2xl font-black text-white font-display">{users.length}</h4>
            <p className="text-[9px] text-slate-600 mt-1">Verified Client Entities</p>
          </div>
          
          <div className="bg-[#0b101f] border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Active Users</p>
            <h4 className="text-2xl font-black text-white font-display">{activeUsers}</h4>
            <p className="text-[9px] text-slate-600 mt-1">Sovereign Node Activity</p>
          </div>

          <div className="bg-[#0b101f] border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <ArrowDownCircle className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Total Deposits</p>
            <h4 className="text-xl font-black text-white font-display">{formatIndianCurrency(totalDeposits)}</h4>
            <p className="text-[9px] text-slate-600 mt-1">Approved Ledger Credits</p>
          </div>

          <div className="bg-[#0b101f] border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <ArrowUpCircle className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Total Withdrawals</p>
            <h4 className="text-xl font-black text-white font-display">{formatIndianCurrency(totalWithdrawals)}</h4>
            <p className="text-[9px] text-slate-600 mt-1">Processed Payouts</p>
          </div>

          <div className="bg-[#0b101f] border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Active Contracts</p>
            <h4 className="text-2xl font-black text-white font-display">{activeInvestmentPlans}</h4>
            <p className="text-[9px] text-slate-600 mt-1">Live Trading Allocations</p>
          </div>
        </div>
      )}

      {/* SECTION A: MANUAL TRANSACTION VERIFICATION CONTROLS */}
      {adminTab === 'transactions' && (
        <div className="space-y-8" id="admin-verification-container">
          {/* Unresolved Requests Card */}
          <div className="bg-[#0b101f] border border-slate-800 rounded-2xl p-5 shadow">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono mb-4">
              Pending Claims (requires Manual Verification)
            </h3>

            {transactions.filter(t => t.status === 'pending').length === 0 ? (
              <div className="text-center py-10 bg-[#050914] rounded-xl border border-dashed border-slate-850">
                <p className="text-xs text-slate-500 font-mono">No pending payments or withdrawals require manual verification.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold">
                      <th className="py-2 px-1">Type</th>
                      <th className="py-2 px-1">User Details</th>
                      <th className="py-2 px-1">Amount</th>
                      <th className="py-2 px-1">UTR / Bank Info</th>
                      <th className="py-2 px-1">Extra Application Info</th>
                      <th className="py-2 px-1 text-right">Verification Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {transactions.filter(t => t.status === 'pending').map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-900/30">
                        <td className="py-3 px-1 uppercase font-bold">
                          {tx.type === 'deposit' ? (
                            <span className="text-cyan-400">Deposit</span>
                          ) : (
                            <span className="text-rose-400">Withdraw</span>
                          )}
                        </td>
                        <td className="py-3 px-1">
                          <p className="font-bold text-slate-200">{tx.detailsForm?.name || tx.username}</p>
                          <p className="text-[10px] text-slate-500">@{tx.username} • Tel: {tx.userPhone}</p>
                        </td>
                        <td className="py-3 px-1 font-bold text-white">{formatIndianCurrency(tx.amount)}</td>
                        <td className="py-3 px-1 text-[11px]">
                          {tx.type === 'deposit' ? (
                            <p className="text-yellow-400 font-bold">UTR: {tx.utr}</p>
                          ) : (
                            <div>
                              {tx.bankDetails?.method === 'bank' && (
                                <>
                                  <p className="text-slate-300 font-bold">Bank: {tx.bankDetails.bankName}</p>
                                  <p className="text-[10px] text-slate-500">Acc: {tx.bankDetails.accountNo}</p>
                                  <p className="text-[10px] text-slate-500">IFSC: {tx.bankDetails.ifsc}</p>
                                </>
                              )}
                              {tx.bankDetails?.method === 'upi' && (
                                <p className="text-emerald-400 font-bold">UPI: {tx.bankDetails.upiId}</p>
                              )}
                              {tx.bankDetails?.method === 'scanner' && (
                                <div className="space-y-1">
                                  <p className="text-amber-400 font-bold">QR Scanner Payout</p>
                                  {tx.bankDetails.scannerImg && (
                                    <div className="relative group">
                                      <img 
                                        src={tx.bankDetails.scannerImg} 
                                        alt="Scanner" 
                                        className="w-16 h-16 object-cover rounded border border-slate-700 cursor-zoom-in" 
                                        onClick={() => window.open(tx.bankDetails.scannerImg, '_blank')}
                                      />
                                      <span className="text-[8px] text-slate-500 block">Click to enlarge</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-1 text-[10px] text-slate-500">
                          {tx.detailsForm ? (
                            <div>
                              <p>DOB: {tx.detailsForm.dob}</p>
                              <p>Work: {tx.detailsForm.profession}</p>
                              <p>WA: {tx.detailsForm.whatsapp}</p>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-1 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            id={`btn-approve-${tx.id}`}
                            onClick={() => onApproveTransaction(tx.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all inline-flex items-center"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                          </button>
                          <button
                            id={`btn-reject-${tx.id}`}
                            onClick={() => onRejectTransaction(tx.id)}
                            className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-2.5 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all inline-flex items-center"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Master Transaction History Log Tab (all payments tracking) */}
          <div className="bg-[#0b101f] border border-slate-800 rounded-2xl p-5 shadow" id="all-payments-history-tab">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono mb-4">
              All Unified Transactions History Logs
            </h3>

            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-mono">No ledger movements recorded in the platform system.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold">
                      <th className="py-2 px-1">ID</th>
                      <th className="py-2 px-1">Date</th>
                      <th className="py-2 px-1">Client</th>
                      <th className="py-2 px-1">Type</th>
                      <th className="py-2 px-1">Amount</th>
                      <th className="py-2 px-1">UTR/Reference</th>
                      <th className="py-2 px-1 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-900/20">
                        <td className="py-3 px-1 text-slate-500">{tx.id}</td>
                        <td className="py-3 px-1">{tx.date}</td>
                        <td className="py-3 px-1 font-bold text-slate-300">
                          {tx.username} <span className="text-[10px] text-slate-500">({tx.userPhone})</span>
                        </td>
                        <td className="py-3 px-1 font-semibold uppercase">
                          {tx.type === 'deposit' ? (
                            <span className="text-cyan-400">Deposit</span>
                          ) : (
                            <span className="text-rose-400">Withdrawal</span>
                          )}
                        </td>
                        <td className="py-3 px-1 font-bold text-slate-200">{formatIndianCurrency(tx.amount)}</td>
                        <td className="py-3 px-1 text-slate-500">{tx.utr || 'Bank Settlement'}</td>
                        <td className="py-3 px-1 text-right">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            tx.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION B: WEBSITE SETTING CONTROLS */}
      {adminTab === 'settings' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6" id="website-setting-form-tab">
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3">
            Website Setting Configuration
          </h3>

          {settingsSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-400 font-sans">
              System credentials, scanner, support phone & WhatsApp updated successfully in real-time.
            </div>
          )}

          <form onSubmit={handleSettingsSave} className="space-y-5" id="settings-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">UPI ID Address</label>
                <input
                  type="text"
                  required
                  id="settings-upi-input"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Payment QR Image URL</label>
                <input
                  type="text"
                  required
                  id="settings-qr-input"
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Scanner QR Image URL</label>
                <input
                  type="text"
                  required
                  id="settings-scanner-input"
                  value={scannerUrlInput}
                  onChange={(e) => setScannerUrlInput(e.target.value)}
                  className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload Official QR Code</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    id="settings-qr-file-upload"
                    onChange={handleQrUpload}
                    className="hidden"
                  />
                  <label 
                    htmlFor="settings-qr-file-upload"
                    className="flex items-center justify-center space-x-2 bg-[#0d1222] border border-slate-800 border-dashed hover:border-red-500 text-slate-400 hover:text-white py-2 px-4 rounded-lg cursor-pointer transition-all w-full text-xs"
                  >
                    <Send className="w-4 h-4 rotate-[-45deg]" />
                    <span>{qrCodeImage ? 'QR Uploaded' : 'Upload QR Image'}</span>
                  </label>
                  {qrCodeImage && (
                    <img 
                      src={qrCodeImage} 
                      alt="Uploaded QR" 
                      className="w-10 h-10 object-cover rounded border border-slate-700" 
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Support WhatsApp Number</label>
                <input
                  type="text"
                  required
                  id="settings-whatsapp-input"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Support Phone Call Number</label>
                <input
                  type="text"
                  required
                  id="settings-phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Company Official Support Email</label>
                <input
                  type="email"
                  required
                  id="settings-email-input"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Trade Duration Limit (Minutes)</label>
                <input
                  type="number"
                  required
                  min="1"
                  id="settings-tradelimit-input"
                  value={tradeTimeLimitInput}
                  onChange={(e) => setTradeTimeLimitInput(Number(e.target.value) || 60)}
                  className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Individual Payment Method Settings */}
            <div className="border-t border-slate-800/60 pt-6 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest font-mono">Individual Payment Method Config</h4>
                <p className="text-[10px] text-slate-500 font-mono">Select and configure dynamic UPI IDs, QR Codes, and Crypto wallet coordinates for individual payment processors.</p>
              </div>

              {/* Selector Tabs */}
              <div className="flex flex-wrap gap-2 pb-1">
                {[
                  { id: 'upi', label: 'Upi' },
                  { id: 'upi_qr', label: 'Upi QR' },
                  { id: 'paytm', label: 'Paytm by UPI' },
                  { id: 'gpay', label: 'Google Pay by UPI' },
                  { id: 'phonepe', label: 'Phone Pay by UPI' },
                  { id: 'icash', label: 'iCash.One' },
                  { id: 'gatepay', label: 'Gate Pay' },
                  { id: 'binance', label: 'Binance Pay' },
                  { id: 'tonkeeper', label: 'Tonkeeper Pay' },
                  { id: 'other_crypto', label: 'Other Cryptos' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentConfigTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border ${
                      paymentConfigTab === item.id
                        ? 'bg-red-500/10 border-red-500 text-red-400 font-black'
                        : 'bg-[#0d1222] border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Form inputs per selection */}
              <div className="bg-[#050913] border border-slate-800/80 p-5 rounded-xl space-y-4">
                {paymentConfigTab === 'upi' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upi ID Address</label>
                      <input
                        type="text"
                        value={upiUpiId}
                        onChange={(e) => setUpiUpiId(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload Upi QR Scanner</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-upi-qr"
                          onChange={(e) => handleMethodQrUpload(e, setUpiQrCode)}
                          className="hidden"
                        />
                        <label
                          htmlFor="upload-upi-qr"
                          className="flex items-center justify-center space-x-2 bg-[#0d1222] border border-slate-850 border-dashed hover:border-red-500 text-slate-400 hover:text-white py-2 px-3 rounded-lg cursor-pointer transition-all text-xs"
                        >
                          <Send className="w-3.5 h-3.5 rotate-[-45deg]" />
                          <span>{upiQrCode ? 'QR Uploaded' : 'Upload QR Image'}</span>
                        </label>
                        {upiQrCode && (
                          <img src={upiQrCode} alt="UPI QR" className="w-8 h-8 object-cover rounded border border-slate-800" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentConfigTab === 'upi_qr' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upi QR ID Address</label>
                      <input
                        type="text"
                        value={upiQrUpiId}
                        onChange={(e) => setUpiQrUpiId(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload Upi QR Scanner</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-upiqr-qr"
                          onChange={(e) => handleMethodQrUpload(e, setUpiQrQrCode)}
                          className="hidden"
                        />
                        <label
                          htmlFor="upload-upiqr-qr"
                          className="flex items-center justify-center space-x-2 bg-[#0d1222] border border-slate-850 border-dashed hover:border-red-500 text-slate-400 hover:text-white py-2 px-3 rounded-lg cursor-pointer transition-all text-xs"
                        >
                          <Send className="w-3.5 h-3.5 rotate-[-45deg]" />
                          <span>{upiQrQrCode ? 'QR Uploaded' : 'Upload QR Image'}</span>
                        </label>
                        {upiQrQrCode && (
                          <img src={upiQrQrCode} alt="UPI QR QR" className="w-8 h-8 object-cover rounded border border-slate-800" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentConfigTab === 'paytm' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Paytm UPI ID</label>
                      <input
                        type="text"
                        value={paytmUpiId}
                        onChange={(e) => setPaytmUpiId(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload Paytm QR Scanner</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-paytm-qr"
                          onChange={(e) => handleMethodQrUpload(e, setPaytmQrCode)}
                          className="hidden"
                        />
                        <label
                          htmlFor="upload-paytm-qr"
                          className="flex items-center justify-center space-x-2 bg-[#0d1222] border border-slate-850 border-dashed hover:border-red-500 text-slate-400 hover:text-white py-2 px-3 rounded-lg cursor-pointer transition-all text-xs"
                        >
                          <Send className="w-3.5 h-3.5 rotate-[-45deg]" />
                          <span>{paytmQrCode ? 'QR Uploaded' : 'Upload QR Image'}</span>
                        </label>
                        {paytmQrCode && (
                          <img src={paytmQrCode} alt="Paytm QR" className="w-8 h-8 object-cover rounded border border-slate-800" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentConfigTab === 'gpay' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Google Pay UPI ID</label>
                      <input
                        type="text"
                        value={gpayUpiId}
                        onChange={(e) => setGpayUpiId(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload Google Pay QR Scanner</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-gpay-qr"
                          onChange={(e) => handleMethodQrUpload(e, setGpayQrCode)}
                          className="hidden"
                        />
                        <label
                          htmlFor="upload-gpay-qr"
                          className="flex items-center justify-center space-x-2 bg-[#0d1222] border border-slate-850 border-dashed hover:border-red-500 text-slate-400 hover:text-white py-2 px-3 rounded-lg cursor-pointer transition-all text-xs"
                        >
                          <Send className="w-3.5 h-3.5 rotate-[-45deg]" />
                          <span>{gpayQrCode ? 'QR Uploaded' : 'Upload QR Image'}</span>
                        </label>
                        {gpayQrCode && (
                          <img src={gpayQrCode} alt="GPay QR" className="w-8 h-8 object-cover rounded border border-slate-800" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentConfigTab === 'phonepe' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Phone Pay UPI ID</label>
                      <input
                        type="text"
                        value={phonepeUpiId}
                        onChange={(e) => setPhonepeUpiId(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload Phone Pay QR Scanner</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-phonepe-qr"
                          onChange={(e) => handleMethodQrUpload(e, setPhonepeQrCode)}
                          className="hidden"
                        />
                        <label
                          htmlFor="upload-phonepe-qr"
                          className="flex items-center justify-center space-x-2 bg-[#0d1222] border border-slate-850 border-dashed hover:border-red-500 text-slate-400 hover:text-white py-2 px-3 rounded-lg cursor-pointer transition-all text-xs"
                        >
                          <Send className="w-3.5 h-3.5 rotate-[-45deg]" />
                          <span>{phonepeQrCode ? 'QR Uploaded' : 'Upload QR Image'}</span>
                        </label>
                        {phonepeQrCode && (
                          <img src={phonepeQrCode} alt="PhonePe QR" className="w-8 h-8 object-cover rounded border border-slate-800" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentConfigTab === 'icash' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">iCash.One UPI ID</label>
                      <input
                        type="text"
                        value={icashUpiId}
                        onChange={(e) => setIcashUpiId(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload iCash.One QR Scanner</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-icash-qr"
                          onChange={(e) => handleMethodQrUpload(e, setIcashQrCode)}
                          className="hidden"
                        />
                        <label
                          htmlFor="upload-icash-qr"
                          className="flex items-center justify-center space-x-2 bg-[#0d1222] border border-slate-850 border-dashed hover:border-red-500 text-slate-400 hover:text-white py-2 px-3 rounded-lg cursor-pointer transition-all text-xs"
                        >
                          <Send className="w-3.5 h-3.5 rotate-[-45deg]" />
                          <span>{icashQrCode ? 'QR Uploaded' : 'Upload QR Image'}</span>
                        </label>
                        {icashQrCode && (
                          <img src={icashQrCode} alt="iCash QR" className="w-8 h-8 object-cover rounded border border-slate-800" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentConfigTab === 'gatepay' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Gate Pay UPI ID</label>
                      <input
                        type="text"
                        value={gatepayUpiId}
                        onChange={(e) => setGatepayUpiId(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload Gate Pay QR Scanner</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="upload-gatepay-qr"
                          onChange={(e) => handleMethodQrUpload(e, setGatepayQrCode)}
                          className="hidden"
                        />
                        <label
                          htmlFor="upload-gatepay-qr"
                          className="flex items-center justify-center space-x-2 bg-[#0d1222] border border-slate-850 border-dashed hover:border-red-500 text-slate-400 hover:text-white py-2 px-3 rounded-lg cursor-pointer transition-all text-xs"
                        >
                          <Send className="w-3.5 h-3.5 rotate-[-45deg]" />
                          <span>{gatepayQrCode ? 'QR Uploaded' : 'Upload QR Image'}</span>
                        </label>
                        {gatepayQrCode && (
                          <img src={gatepayQrCode} alt="Gate Pay QR" className="w-8 h-8 object-cover rounded border border-slate-800" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentConfigTab === 'binance' && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Binance Pay ID / Address</label>
                      <input
                        type="text"
                        value={binanceAddress}
                        onChange={(e) => setBinanceAddress(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <p className="text-[9px] text-amber-500/90 font-mono">⚠️ Info: Binance Pay will only display the copyable Pay ID Address/Code without a QR code as requested.</p>
                  </div>
                )}

                {paymentConfigTab === 'tonkeeper' && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Tonkeeper Pay USDT Address</label>
                      <input
                        type="text"
                        value={tonkeeperAddress}
                        onChange={(e) => setTonkeeperAddress(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <p className="text-[9px] text-amber-500/90 font-mono">⚠️ Info: Tonkeeper Pay USDT will only display the copyable USDT Wallet Address without a QR code as requested.</p>
                  </div>
                )}

                {paymentConfigTab === 'other_crypto' && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Other Cryptocurrencies Address</label>
                      <input
                        type="text"
                        value={otherCryptoAddress}
                        onChange={(e) => setOtherCryptoAddress(e.target.value)}
                        className="w-full bg-[#0d1222] border border-slate-850 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-red-500"
                      />
                    </div>
                    <p className="text-[9px] text-amber-500/90 font-mono">⚠️ Info: Other Cryptocurrencies will only display the copyable Wallet Address without a QR code as requested.</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              id="btn-settings-save"
              className="inline-flex items-center justify-center space-x-1.5 bg-red-500 hover:bg-red-400 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-lg uppercase tracking-wider transition-all shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save System Configurations</span>
            </button>
          </form>
        </section>
      )}

      {/* SECTION C: CLIENTS MANAGEMENT (WITH CUSTOM TRADER & MANUAL LIMITS CONTROL) */}
      {adminTab === 'users' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-5 shadow" id="clients-management-sub-tab">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono mb-4">
            Certified Registered Client Profiles DB
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[9px] font-bold">
                  <th className="py-2 px-1">Name</th>
                  <th className="py-2 px-1">Contacts</th>
                  <th className="py-2 px-1">Balances</th>
                  <th className="py-2 px-1">Designated Portfolio Manager</th>
                  <th className="py-2 px-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-1">
                      <p className="font-bold text-slate-200">{user.name}</p>
                      <p className="text-[10px] text-slate-500">@{user.username} • {user.profession}</p>
                    </td>
                    <td className="py-3 px-1 text-[11px] space-y-0.5">
                      <p className="text-slate-300">Email: {user.email}</p>
                      <p className="text-slate-400">Phone: {user.phone}</p>
                      <p className="text-emerald-400 font-bold">WhatsApp: {user.whatsapp}</p>
                      <p className="text-amber-500 font-bold">Pass: {user.password || 'N/A'}</p>
                    </td>

                    {/* Balances Display (or inline editing form) */}
                    <td className="py-3 px-1">
                      {editingUserId === user.id ? (
                        <div className="space-y-1 w-32">
                          <div className="flex items-center space-x-1">
                            <span className="text-[8px] text-slate-500">DEP:</span>
                            <input
                              type="number"
                              id={`edit-dep-${user.id}`}
                              value={editDeposit}
                              onChange={(e) => setEditDeposit(Number(e.target.value))}
                              className="bg-slate-950 border border-slate-800 text-white text-[10px] py-0.5 px-1 rounded w-full"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-[8px] text-slate-500">PRO:</span>
                            <input
                              type="number"
                              id={`edit-pro-${user.id}`}
                              value={editProfit}
                              onChange={(e) => setEditProfit(Number(e.target.value))}
                              className="bg-slate-950 border border-slate-800 text-white text-[10px] py-0.5 px-1 rounded w-full"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-[8px] text-slate-500">ACT:</span>
                            <input
                              type="number"
                              id={`edit-act-${user.id}`}
                              value={editActive}
                              onChange={(e) => setEditActive(Number(e.target.value))}
                              className="bg-slate-950 border border-slate-800 text-white text-[10px] py-0.5 px-1 rounded w-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5 font-bold text-[11px]">
                          <p className="text-cyan-400">DEP: {formatIndianCurrency(user.depositWallet)}</p>
                          <p className="text-emerald-400">PRO: {formatIndianCurrency(user.profitWallet)}</p>
                          <p className="text-amber-400">ACT: {formatIndianCurrency(user.activeInvestment)}</p>
                        </div>
                      )}
                    </td>

                    {/* Assigned Trader details (or inline editing form) */}
                    <td className="py-3 px-1">
                      {editingUserId === user.id ? (
                        <div className="space-y-1 w-44">
                          <input
                            type="text"
                            placeholder="Trader Name"
                            id={`edit-trader-name-${user.id}`}
                            value={editTraderName}
                            onChange={(e) => setEditTraderName(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded w-full"
                          />
                          <input
                            type="text"
                            placeholder="Trader Call No."
                            id={`edit-trader-phone-${user.id}`}
                            value={editTraderPhone}
                            onChange={(e) => setEditTraderPhone(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded w-full"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-slate-300">{user.traderName || 'Rohit Singhania (Senior Trader)'}</p>
                          <p className="text-[10px] text-emerald-400 font-semibold">Support No.: +91 {user.traderPhone || systemSettings.supportWhatsApp}</p>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-1 text-right whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <div className="space-x-1">
                          <button
                            id={`btn-save-user-${user.id}`}
                            onClick={() => handleUserSave(user.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2 py-1 rounded text-[10px] uppercase transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded text-[10px] uppercase transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-edit-user-${user.id}`}
                          onClick={() => startEditingUser(user)}
                          className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-bold px-3 py-1.5 rounded text-[10px] uppercase transition-all flex items-center ml-auto"
                        >
                          <Sliders className="w-3 h-3 mr-1" /> Edit Profile
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION E: CUSTOM INVESTMENT REQUESTS */}
      {adminTab === 'investments' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="admin-investment-requests">
          <div>
            <h4 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
              Custom Investment Slots & Trading Forms
            </h4>
            <p className="text-xs text-slate-400">All submissions below are isolated from standard transaction histories to protect user dashboards.</p>
          </div>

          {investmentRequests.length === 0 ? (
            <div className="text-center py-10 bg-[#050914] rounded-xl border border-dashed border-slate-850">
              <p className="text-xs text-slate-500 font-mono">No custom investment requests or registration forms found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse font-mono text-[11px] text-slate-400">
                <thead>
                  <tr className="bg-[#070b14] border-b border-slate-800 text-slate-300 uppercase text-[9px] font-bold">
                    <th className="py-3 px-4">Client Profile</th>
                    <th className="py-3 px-4">Profession & DOB</th>
                    <th className="py-3 px-4">Slot Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">UTR Reference</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {investmentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-900/30 transition-all">
                      <td className="py-3.5 px-4 space-y-1">
                        <p className="text-white font-bold">@{req.username}</p>
                        <p className="text-[10px] text-slate-400 font-sans">{req.fullName}</p>
                        <p className="text-[9px] text-slate-500 leading-none font-sans">{req.email} | {req.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="text-slate-300 font-sans">{req.profession}</p>
                        <p className="text-[10px] text-slate-500 font-sans">DOB: {req.dob}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                          {req.planCategory} Contract
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-white font-black font-mono">
                        ₹{req.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="text-cyan-400 font-bold font-mono">{req.utr}</p>
                        <p className="text-[9px] text-slate-500">{req.date}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {req.status === 'pending' && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                            Pending
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                            Approved
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                if (confirm(`Approve ₹${req.amount.toLocaleString()} investment and activate trade for @${req.username}?`)) {
                                  onApproveInvestmentRequest(req.id);
                                }
                              }}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-2.5 py-1.5 rounded text-[10px] uppercase tracking-wider flex items-center space-x-1 transition-all font-mono"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Reject ₹${req.amount.toLocaleString()} investment request for @${req.username}?`)) {
                                  onRejectInvestmentRequest(req.id);
                                }
                              }}
                              className="bg-red-500 hover:bg-red-400 text-slate-950 font-extrabold px-2.5 py-1.5 rounded text-[10px] uppercase tracking-wider flex items-center space-x-1 transition-all font-mono"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : req.status === 'approved' ? (
                          <span className="text-emerald-400 font-bold uppercase text-[9px] flex items-center justify-end space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Trade Active</span>
                          </span>
                        ) : (
                          <span className="text-red-400 font-bold uppercase text-[9px] flex items-center justify-end space-x-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* SECTION F: CUSTOMER COMMUNICATION SYSTEM */}
      {adminTab === 'messages' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8" id="admin-messaging-tab">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* New Message Form */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h4 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  Dispatch Communication
                </h4>
                <p className="text-xs text-slate-400">Send announcements, broadcasts, or individual client alerts.</p>
              </div>

              {msgSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-400">
                  Message dispatched successfully to selected node(s).
                </div>
              )}

              <form onSubmit={handleMessageSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Message Type</label>
                  <select 
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as any)}
                    className="w-full bg-[#070b14] border border-slate-800 text-white font-mono py-2.5 px-3 rounded-lg text-xs outline-none"
                  >
                    <option value="broadcast">Broadcast (All Users)</option>
                    <option value="announcement">Announcement (Pinned)</option>
                    <option value="individual">Individual Private</option>
                  </select>
                </div>

                {messageType === 'individual' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Recipient Client</label>
                    <select 
                      value={messageRecipient}
                      onChange={(e) => setMessageRecipient(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-800 text-white font-mono py-2.5 px-3 rounded-lg text-xs outline-none"
                    >
                      <option value="all">Select User...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Subject Header</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KYC Update Required"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Message Body</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Enter message content..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-400 text-slate-950 font-black text-xs py-3 rounded-lg uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Message</span>
                </button>
              </form>
            </div>

            {/* History of Sent Messages */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                  Communication Logs
                </h4>
                <p className="text-xs text-slate-400">History of dispatched alerts and broadcast announcements.</p>
              </div>

              {adminMessages.length === 0 ? (
                <div className="text-center py-20 bg-[#050914] rounded-2xl border border-dashed border-slate-850">
                  <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-3 opacity-20" />
                  <p className="text-xs text-slate-500 font-mono">No communication records found in transmission logs.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminMessages.map((msg) => (
                    <div key={msg.id} className="bg-[#070b14] border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            msg.type === 'broadcast' ? 'bg-amber-500/20 text-amber-400' : 
                            msg.type === 'announcement' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {msg.type}
                          </span>
                          <h5 className="text-sm font-bold text-white">{msg.subject}</h5>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">{msg.content}</p>
                      <div className="flex items-center space-x-4 pt-2 border-t border-slate-900 mt-2">
                        <span className="text-[10px] text-slate-500">To: <b className="text-slate-300">
                          {msg.recipientId === 'all' ? 'Universal Node (All Users)' : users.find(u => u.id === msg.recipientId)?.username || msg.recipientId}
                        </b></span>
                        <span className="text-[10px] text-emerald-500 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Delivered
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION G: TRADER & WEALTH MANAGER MANAGEMENT */}
      {adminTab === 'traders' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="trader-management-tab">
          <div>
            <h4 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
              Senior Wealth Manager & Trader Configuration
            </h4>
            <p className="text-xs text-slate-400">Configure Designated Senior Wealth Managers for each client node.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-[11px] text-slate-400">
              <thead className="bg-[#070b14] border-b border-slate-800">
                <tr className="text-slate-300 uppercase text-[9px] font-bold">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Designated Master Trader Name</th>
                  <th className="py-3 px-4">Direct Support Line</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {user.name} <span className="text-[9px] text-slate-500 ml-1">@{user.username}</span>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        defaultValue={user.traderName || 'Rohit Singhania (Senior Trader)'}
                        id={`trader-name-input-${user.id}`}
                        className="bg-slate-950 border border-slate-850 text-slate-200 px-3 py-1.5 rounded-lg w-full outline-none focus:border-amber-500/50"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        defaultValue={user.traderPhone || systemSettings.supportWhatsApp}
                        id={`trader-phone-input-${user.id}`}
                        className="bg-slate-950 border border-slate-850 text-emerald-400 px-3 py-1.5 rounded-lg w-full outline-none focus:border-amber-500/50"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const name = (document.getElementById(`trader-name-input-${user.id}`) as HTMLInputElement).value;
                          const phone = (document.getElementById(`trader-phone-input-${user.id}`) as HTMLInputElement).value;
                          handleTraderUpdate(user.id, name, phone);
                          toast.success(`Trader info updated for @${user.username}`);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-lg text-[9px] uppercase tracking-widest transition-all"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {adminTab === 'posts' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="admin-posts-management">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono mb-4">
            Manage Community Posts
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse font-mono text-[11px] text-slate-400">
              <thead>
                <tr className="bg-[#070b14] border-b border-slate-800 text-slate-300 uppercase text-[9px] font-bold">
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Content</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {firestorePosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-900/30 transition-all">
                    <td className="py-3.5 px-4">
                      <p className="text-white font-bold">@{post.authorUsername}</p>
                    </td>
                    <td className="py-3.5 px-4 truncate max-w-xs">{post.content}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${post.approved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {post.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {!post.approved && (
                        <button onClick={() => approvePost(post.id)} className="bg-emerald-500 text-slate-950 font-bold px-2 py-1 rounded text-[10px] uppercase">Approve</button>
                      )}
                      <button onClick={() => rejectPost(post.id)} className="bg-rose-500 text-white font-bold px-2 py-1 rounded text-[10px] uppercase">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION D: SECURE SECRETS ACTIVITY LOG PANEL */}
      {adminTab === 'logs' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 shadow-xl" id="secure-encrypted-activity-logs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
            <div>
              <h4 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                Cryptographic System Activity Logs
              </h4>
              <p className="text-xs text-slate-400">All actions are salt-hashed and AES-256-GCM encrypted for strict security compliance.</p>
            </div>

            {/* Toggle Decrypt button */}
            <button
              onClick={() => setDecryptLogs(!decryptLogs)}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-mono font-bold transition-all"
            >
              {decryptLogs ? (
                <>
                  <EyeOff className="w-4 h-4 text-red-400" />
                  <span>Toggle Encrypted Hashing</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-red-400" />
                  <span>Decrypt Database Ledger</span>
                </>
              )}
            </button>
          </div>

          {/* Activity timeline logs list */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {activityLogs.map((log) => (
              <div 
                key={log.id} 
                className="bg-[#070b14] border border-slate-850 rounded-lg p-3 flex justify-between items-start font-mono text-xs text-slate-400 gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-600">{log.timestamp}</span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 rounded uppercase font-bold">Audit #{log.id.slice(-4)}</span>
                    <span className="text-slate-300 font-bold">@{log.username}</span>
                  </div>
                  
                  {/* Encryption visual representation toggle */}
                  {decryptLogs ? (
                    <p className="text-emerald-400 text-xs font-sans mt-1">
                      ✔ Decrypted Action: <b>{log.action}</b>
                    </p>
                  ) : (
                    <p className="text-slate-500 text-[10px] tracking-wide mt-1 select-none">
                      🔒 Ciphertext: <span className="text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded font-mono">{log.encryptedPayload}</span>
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[8px] uppercase tracking-wider text-red-500 font-bold bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                    ENCRYPTED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION E: ACTIVE CONTRACTS MANAGEMENT TAB */}
      {adminTab === 'trades' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="active-contracts-management-tab">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">
                Active Contracts & Trade Maturity Management
              </h4>
              <p className="text-xs text-slate-400">
                View and manually override remaining countdown times for active trade/investment contracts.
              </p>
            </div>
            <div className="bg-[#070b14] px-4 py-2 rounded-xl border border-slate-800 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                REALTIME DISPATCH ACTIVE
              </span>
            </div>
          </div>

          <div className="bg-[#070b14] rounded-2xl border border-slate-800 p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="py-3 px-4">Trade ID</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Contract / Asset</th>
                    <th className="py-3 px-4">Allocation</th>
                    <th className="py-3 px-4">Est. Yield</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Remaining Duration</th>
                    <th className="py-3 px-4 text-right">Action / Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {adminTrades.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 px-4 text-center text-slate-600">
                        No trade contracts found in the database.
                      </td>
                    </tr>
                  ) : (
                    adminTrades.map((trade) => {
                      const now = Date.now();
                      const isCompleted = trade.status === 'completed' || now >= trade.endTime;
                      const remainingMs = isCompleted ? 0 : trade.endTime - now;
                      const remainingMins = Math.ceil(remainingMs / (60 * 1000));

                      return (
                        <tr key={trade.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">{trade.id}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-300 font-bold">@{trade.username}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-300">{trade.planName || trade.assetName || 'Contract'}</span>
                            <span className="text-[10px] text-slate-500 block">{trade.duration} limit</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#f0b90b] font-bold">
                            ₹{trade.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-emerald-400 font-bold">
                            ₹{trade.estimatedProfit.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              isCompleted 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-amber-500/10 text-amber-500 animate-pulse'
                            }`}>
                              {isCompleted ? 'Completed' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isCompleted ? (
                              <span className="text-slate-600">Matured</span>
                            ) : (
                              <div className="flex items-center space-x-1.5 text-amber-500">
                                <span className="text-[11px] font-bold">{remainingMins} min{remainingMins > 1 ? 's' : ''}</span>
                                <span className="text-[9px] text-slate-600">({Math.round(remainingMs / 1000)}s)</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isCompleted ? (
                              <span className="text-slate-600 text-[10px]">No Override Possible</span>
                            ) : (
                              <div className="flex flex-col items-end space-y-1.5 max-w-[240px] ml-auto">
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="Mins"
                                    className="bg-slate-900 border border-slate-800 text-white rounded px-2 py-1 w-16 text-center text-[11px] outline-none focus:border-red-500"
                                    defaultValue={remainingMins}
                                    id={`override-input-${trade.id}`}
                                  />
                                  <button
                                    onClick={async () => {
                                      const inputEl = document.getElementById(`override-input-${trade.id}`) as HTMLInputElement;
                                      if (inputEl) {
                                        const mins = parseInt(inputEl.value);
                                        if (isNaN(mins) || mins < 1) {
                                          toast.error('Invalid Minutes', { description: 'Please specify a positive integer value.' });
                                          return;
                                        }
                                        try {
                                          const newEndTime = Date.now() + (mins * 60 * 1000);
                                          await updateDoc(doc(db, 'trades', trade.id), {
                                            endTime: newEndTime,
                                            startTime: Date.now() // resets start to now for progress tracking
                                          });
                                          toast.success('Trade Duration Updated!', {
                                            description: `Trade ${trade.id} set to mature in ${mins} minute(s).`
                                          });
                                        } catch (err: any) {
                                          toast.error('Firestore Update Failed', { description: err.message });
                                        }
                                      }
                                    }}
                                    className="bg-red-500 hover:bg-red-400 text-slate-950 px-2 py-1 rounded text-[10px] uppercase font-black"
                                    title="Set remaining minutes from now"
                                  >
                                    Set
                                  </button>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-[9px] text-slate-500 uppercase font-bold mr-1">Increase:</span>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const currentEnd = Math.max(Date.now(), trade.endTime);
                                        const newEndTime = currentEnd + (15 * 60 * 1000);
                                        await updateDoc(doc(db, 'trades', trade.id), {
                                          endTime: newEndTime
                                        });
                                        toast.success('Added 15 Minutes!', {
                                          description: `Trade ${trade.id} extended by 15 mins.`
                                        });
                                      } catch (err: any) {
                                        toast.error('Firestore Update Failed', { description: err.message });
                                      }
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold"
                                  >
                                    +15m
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const currentEnd = Math.max(Date.now(), trade.endTime);
                                        const newEndTime = currentEnd + (30 * 60 * 1000);
                                        await updateDoc(doc(db, 'trades', trade.id), {
                                          endTime: newEndTime
                                        });
                                        toast.success('Added 30 Minutes!', {
                                          description: `Trade ${trade.id} extended by 30 mins.`
                                        });
                                      } catch (err: any) {
                                        toast.error('Firestore Update Failed', { description: err.message });
                                      }
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold"
                                  >
                                    +30m
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const currentEnd = Math.max(Date.now(), trade.endTime);
                                        const newEndTime = currentEnd + (60 * 60 * 1000);
                                        await updateDoc(doc(db, 'trades', trade.id), {
                                          endTime: newEndTime
                                        });
                                        toast.success('Added 1 Hour!', {
                                          description: `Trade ${trade.id} extended by 60 mins.`
                                        });
                                      } catch (err: any) {
                                        toast.error('Firestore Update Failed', { description: err.message });
                                      }
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold"
                                  >
                                    +1h
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

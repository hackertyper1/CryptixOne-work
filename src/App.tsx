import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { TrendingUp } from 'lucide-react';
import Header from './components/Header';
import HomeSection from './components/HomeSection';
import PlanSection from './components/PlanSection';
import TradeSection from './components/TradeSection';
import WalletSection from './components/WalletSection';
import AccountSection from './components/AccountSection';
import AdminPanel from './components/AdminPanel';
import MarketSection from './components/MarketSection';
import SplashScreen from './components/SplashScreen';
import AuthGate from './components/AuthGate';
import { User, ActiveTrade, Transaction, SystemSettings, ActivityLog, InvestmentPlan, InvestmentRequest, AdminMessage } from './types';
import { DEFAULT_SETTINGS, encryptPayload, INVESTMENT_PLANS } from './data';
import { db, auth } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc, 
  query, 
  orderBy, 
  limit,
  getDocs,
  getDoc
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errStr = error instanceof Error ? error.message : String(error);
  if (errStr.includes('resource-exhausted') || errStr.includes('Quota limit exceeded') || errStr.includes('quota')) {
    console.warn('Firestore write quota limit reached. System running in local state fallback mode.');
    return;
  }
  if (errStr.includes('unavailable') || errStr.includes('Could not reach Cloud Firestore')) {
    console.warn('Firestore connection temporarily unavailable. Retrying in background...');
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    }
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  if (errStr.includes('unavailable')) {
    toast.error('System synchronization interrupted. Reconnecting...', { id: 'conn-error' });
  }
};

const synthesizeNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a premium pleasant notification chime (C5 -> E5 -> G5)
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration - 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = ctx.currentTime;
    playNote(523.25, now, 0.2); // C5
    playNote(659.25, now + 0.15, 0.2); // E5
    playNote(783.99, now + 0.3, 0.4); // G5
  } catch (e) {
    console.log('Synth failed:', e);
  }
};

const playMaturitySound = (soundEnabled: boolean) => {
  if (!soundEnabled) return;
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    audio.play().catch(() => {
      synthesizeNotificationSound();
    });
  } catch (err) {
    synthesizeNotificationSound();
  }
};

export default function App() {
  // Navigation State: 'home' | 'plan' | 'trade' | 'market' | 'wallet' | 'account' | 'admin'
  const [activeTab, setActiveTab] = useState<string>(() => {
    const stored = localStorage.getItem('cryptix_active_tab');
    return stored || 'home';
  });

  useEffect(() => {
    localStorage.setItem('cryptix_active_tab', activeTab);
  }, [activeTab]);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileShowHome, setMobileShowHome] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isApk, setIsApk] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkIsApk = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator as any).standalone || 
             document.referrer.includes('android-app://') ||
             window.location.search.includes('apk=1') ||
             window.location.search.includes('apk=true');
    };
    const isRunningAsApk = checkIsApk();
    setIsApk(isRunningAsApk);
  }, []);

  // Core Data Registries
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('cryptix_users');
    return stored ? JSON.parse(stored) : [];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('cryptix_current_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequest[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('cryptix_sound_effects_enabled');
    return stored !== 'false';
  });

  // Selection states
  const [selectedPlanForInvestment, setSelectedPlanForInvestment] = useState<InvestmentPlan | null>(null);

  // 1. Initial Seeding and Firestore Synchronization
  useEffect(() => {
    // Check for secure admin access URL parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === 'admin-portal-2026') {
      setActiveTab('admin');
    }

    // Real-time System Settings
    const settingsRef = doc(db, 'settings', 'config');
    const unsubscribeSettings = onSnapshot(settingsRef, (settingsSnap) => {
      if (settingsSnap.exists()) {
        setSystemSettings(settingsSnap.data() as SystemSettings);
      } else {
        // Seed if missing
        setDoc(settingsRef, DEFAULT_SETTINGS).catch(e => handleFirestoreError(e, OperationType.WRITE, 'settings/config'));
        setSystemSettings(DEFAULT_SETTINGS);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/config');
    });

    // Real-time Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(prev => {
        const map = new Map<string, User>();
        // Add local storage users first
        const storedUsers = localStorage.getItem('cryptix_users');
        if (storedUsers) {
          try {
            JSON.parse(storedUsers).forEach((u: User) => map.set(u.id || u.username, u));
          } catch (e) {}
        }
        prev.forEach(u => map.set(u.id || u.username, u));
        usersData.forEach(u => map.set(u.id || u.username, u));
        const merged = Array.from(map.values());
        localStorage.setItem('cryptix_users', JSON.stringify(merged));
        return merged;
      });
      
      // Update current user if logged in
      const storedCurrentUser = localStorage.getItem('cryptix_current_user');
      if (storedCurrentUser) {
        const parsedUser = JSON.parse(storedCurrentUser);
        setUsers(latestUsers => {
          const freshUser = latestUsers.find(u => u.username === parsedUser.username || u.id === parsedUser.id);
          if (freshUser) {
            setCurrentUser(freshUser);
            localStorage.setItem('cryptix_current_user', JSON.stringify(freshUser));
          }
          return latestUsers;
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // Request Notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // Real-time Transactions
    const unsubscribeTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(50)), (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
      setTransactions(txs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    // Real-time Active Trades
    const unsubscribeTrades = onSnapshot(query(collection(db, 'trades'), limit(200)), (snapshot) => {
      const trades = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActiveTrade));
      setActiveTrades(trades);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'trades');
    });

    // Real-time Logs
    const unsubscribeLogs = onSnapshot(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog));
      setActivityLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'logs');
    });

    // Real-time Investment Requests
    const unsubscribeRequests = onSnapshot(query(collection(db, 'requests'), orderBy('date', 'desc'), limit(50)), (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InvestmentRequest));
      setInvestmentRequests(reqs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'requests');
    });

    // Real-time Admin Messages
    const unsubscribeMessages = onSnapshot(query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(20)), (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AdminMessage));
      setAdminMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });

    return () => {
      unsubscribeSettings();
      unsubscribeUsers();
      unsubscribeTransactions();
      unsubscribeTrades();
      unsubscribeLogs();
      unsubscribeRequests();
      unsubscribeMessages();
    };
  }, []);

  // Redirect guest or logged in user to permitted sections only
  useEffect(() => {
    // Scroll to top on every tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Wait for initial users load before redirecting
    if (users.length === 0 && !currentUser) return;

    if (currentUser) {
      if (activeTab === 'home') {
        setActiveTab('plan'); // redirect logged-in user away from home
      }
    } else {
      if (activeTab !== 'home' && activeTab !== 'account' && activeTab !== 'admin') {
        setActiveTab('home'); // redirect guests away from internal pages
      }
    }
  }, [currentUser, activeTab, users.length]);

  // Check for hidden admin mode in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') {
      setActiveTab('admin');
    }
  }, []);

  // Sync balances and users to Firestore on changes
  const syncUser = async (user: User) => {
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`);
    }
  };

  const syncTransaction = async (tx: Transaction) => {
    try {
      await setDoc(doc(db, 'transactions', tx.id), tx, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `transactions/${tx.id}`);
    }
  };

  const syncTrade = async (trade: ActiveTrade) => {
    try {
      await setDoc(doc(db, 'trades', trade.id), trade, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `trades/${trade.id}`);
    }
  };

  const syncInvestmentRequest = async (req: InvestmentRequest) => {
    try {
      await setDoc(doc(db, 'requests', req.id), req, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `requests/${req.id}`);
    }
  };

  const syncAdminMessage = async (msg: AdminMessage) => {
    try {
      await setDoc(doc(db, 'messages', msg.id), msg, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `messages/${msg.id}`);
    }
  };

  const saveUsersToStorage = async (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('cryptix_users', JSON.stringify(updatedUsers));
    for (const u of updatedUsers) {
      if (u && u.id) {
        syncUser(u);
      }
    }
  };

  const saveTransactionsToStorage = async (updatedTxs: Transaction[]) => {
    setTransactions(updatedTxs);
  };

  const saveTradesToStorage = async (updatedTrades: ActiveTrade[]) => {
    setActiveTrades(updatedTrades);
  };

  const saveInvestmentRequestsToStorage = async (updatedRequests: InvestmentRequest[]) => {
    setInvestmentRequests(updatedRequests);
  };

  const saveAdminMessagesToStorage = async (updated: AdminMessage[]) => {
    setAdminMessages(updated);
  };

  // Delete handlers for Admin Panel
  const handleDeleteTransaction = async (txId: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', txId));
      setTransactions(prev => prev.filter(t => t.id !== txId));
      addLog(`Permanently deleted transaction ${txId} from database`, 'admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `transactions/${txId}`);
    }
  };

  const handleDeleteInvestmentRequest = async (reqId: string) => {
    try {
      await deleteDoc(doc(db, 'requests', reqId));
      setInvestmentRequests(prev => prev.filter(r => r.id !== reqId));
      addLog(`Permanently deleted investment request ${reqId} from database`, 'admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `requests/${reqId}`);
    }
  };

  const handleClearAllRejectedTransactions = async () => {
    const rejectedTxs = transactions.filter(t => t.status === 'rejected');
    for (const tx of rejectedTxs) {
      try {
        await deleteDoc(doc(db, 'transactions', tx.id));
      } catch (e) {
        console.error('Failed to delete rejected tx:', tx.id);
      }
    }
    setTransactions(prev => prev.filter(t => t.status !== 'rejected'));
    
    const rejectedReqs = investmentRequests.filter(r => r.status === 'rejected');
    for (const req of rejectedReqs) {
      try {
        await deleteDoc(doc(db, 'requests', req.id));
      } catch (e) {
        console.error('Failed to delete rejected req:', req.id);
      }
    }
    setInvestmentRequests(prev => prev.filter(r => r.status !== 'rejected'));

    addLog(`Cleared all rejected transactions and requests from database`, 'admin');
  };

  const handlePurgeDatabase = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to purge and delete all transactions, investment requests, and active trade contracts from the database? This will clear all ghost claims and reset active contracts.")) {
      return;
    }
    try {
      const txSnap = await getDocs(collection(db, 'transactions'));
      for (const d of txSnap.docs) {
        await deleteDoc(doc(db, 'transactions', d.id));
      }
      const reqSnap = await getDocs(collection(db, 'requests'));
      for (const d of reqSnap.docs) {
        await deleteDoc(doc(db, 'requests', d.id));
      }
      const tradeSnap = await getDocs(collection(db, 'trades'));
      for (const d of tradeSnap.docs) {
        await deleteDoc(doc(db, 'trades', d.id));
      }
      setTransactions([]);
      setInvestmentRequests([]);
      setActiveTrades([]);
      addLog('Admin purged all transactions, requests, and trades from database', 'admin');
      toast.success('Database Purged Successfully', { description: 'All pending/rejected claims, withdrawal requests, and active contracts have been deleted.' });
    } catch (e: any) {
      handleFirestoreError(e, OperationType.DELETE, 'database/purge');
      toast.error('Database Purge Failed', { description: e.message });
    }
  };

  const handleSendMessage = async (msg: Omit<AdminMessage, 'id' | 'timestamp' | 'sender' | 'read'>) => {
    const id = `MSG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMsg: AdminMessage = {
      ...msg,
      id,
      sender: 'admin',
      timestamp: new Date().toLocaleString(),
      read: false
    };
    syncAdminMessage(newMsg);
    addLog(`Sent ${msg.type} message to ${msg.recipientId}: ${msg.subject}`, 'admin');
  };

  const addLog = async (action: string, username: string) => {
    const id = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: ActivityLog = {
      id,
      timestamp: new Date().toLocaleString(),
      action,
      username,
      encryptedPayload: encryptPayload({ action, username, time: Date.now() })
    };
    try {
      await setDoc(doc(db, 'logs', id), newLog);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `logs/${id}`);
    }
  };

  // 2. Active Trade Countdown Mature & Payout Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasChange = false;
      const updatedTrades = activeTrades.map(trade => {
        if (trade.status === 'active') {
          // Check for halfway progress
          const totalDuration = trade.endTime - trade.startTime;
          const elapsed = now - trade.startTime;
          const progress = elapsed / totalDuration;

          if (progress >= 0.5 && !trade.halfwayNotified) {
            trade.halfwayNotified = true;
            hasChange = true;
            syncTrade(trade); // Persistence
            
            // Only notify if it's the current user's trade
            if (currentUser && currentUser.id === trade.userId) {
              toast.info(`Trade Update: Your ${trade.planName} contract has reached 50% maturity. Portfolio scaling in progress...`, {
                icon: <TrendingUp className="w-4 h-4 text-amber-500" />
              });
            }
          }

          if (now >= trade.endTime) {
            trade.status = 'completed';
            hasChange = true;
            syncTrade(trade); // Persistence

            // Move funds from Active investment to Profit Wallet of client
            const targetUser = users.find(u => u.username === trade.username);
            if (targetUser) {
              const profitEarned = trade.estimatedProfit;
              const refundCapital = trade.amount;
              const updatedUser = {
                ...targetUser,
                profitWallet: targetUser.profitWallet + profitEarned,
                activeInvestment: Math.max(0, targetUser.activeInvestment - refundCapital)
              };

              syncUser(updatedUser); // Persistence
              
              // Update local state for immediate feedback (onSnapshot will also trigger eventually)
              const newUsersList = users.map(u => u.id === updatedUser.id ? updatedUser : u);
              setUsers(newUsersList);

              if (currentUser && currentUser.username === updatedUser.username) {
                setCurrentUser(updatedUser);
                localStorage.setItem('cryptix_current_user', JSON.stringify(updatedUser));
                
                toast.success(`Capital Settlement: +₹${profitEarned}`, {
                  description: `Contract ${trade.id} has matured successfully. Payout added to your yield balance.`,
                  duration: 6000,
                });

                playMaturitySound(soundEffectsEnabled);

                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                  try {
                    new Notification('Contract Matured successfully! 🎉', {
                      body: `Your trade ${trade.id} has matured. Yield +₹${profitEarned.toLocaleString()} added to your balance.`,
                      icon: 'https://cdn-icons-png.flaticon.com/512/2953/2953423.png'
                    });
                  } catch (err) {
                    console.log('Notification dispatch failed:', err);
                  }
                }
              }
            }
            
            addLog(`Micro-Investment contract matured and payouts settled. Yield: +${trade.estimatedProfit}`, trade.username);

            // Record Profit Transaction in History
            const profitTx: Transaction = {
              id: `TX-${Math.floor(2000 + Math.random() * 8000)}`,
              userId: trade.userId,
              username: trade.username,
              userPhone: targetUser?.phone || '',
              type: 'profit',
              amount: trade.estimatedProfit,
              status: 'completed',
              date: new Date().toLocaleString(),
              description: `Matured ${trade.planName} contract yield`
            };
            syncTransaction(profitTx); // Persistence
            setTransactions(prev => [profitTx, ...prev]); // Local state update
          }
        }
        return trade;
      });

      if (hasChange) {
        saveTradesToStorage(updatedTrades);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTrades, users, currentUser]);

  // Sound Alert for Admin Messages
  useEffect(() => {
    if (!currentUser || adminMessages.length === 0) return;
    
    const lastMsg = adminMessages[0];
    const storedLastMsgId = localStorage.getItem('cryptix_last_msg_id');
    
    if (lastMsg.id !== storedLastMsgId) {
      localStorage.setItem('cryptix_last_msg_id', lastMsg.id);
      
      // Check if message is for this user or broadcast
      if (lastMsg.recipientId === currentUser.id || lastMsg.recipientId === 'all') {
        // Play notification sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
        
        toast.info(`Institutional Directive: ${lastMsg.subject}`, {
          description: "New message received from regulatory desk.",
          duration: 8000,
        });
      }
    }
  }, [adminMessages, currentUser]);

  // 3. Authenticate User login
  const handleUserLogin = (userOrEmail: string, pass: string): boolean => {
    const cleaned = userOrEmail.trim().toLowerCase();
    const userMatch = users.find(
      u => u.username.toLowerCase() === cleaned || u.email.toLowerCase() === cleaned
    );

    if (userMatch) {
      // Check password from Firestore user object (fallback to local storage for backward compatibility)
      const storedPass = userMatch.password || localStorage.getItem(`cryptix_pass_${userMatch.username}`);
      if (storedPass === pass) {
        setCurrentUser(userMatch);
        localStorage.setItem('cryptix_current_user', JSON.stringify(userMatch));
        addLog('Client security session authenticated', userMatch.username);
        setActiveTab('plan');
        return true;
      }
    }
    return false;
  };

  // 4. Client Sign Up Handler
  const handleUserSignup = (
    userData: Omit<User, 'id' | 'depositWallet' | 'profitWallet' | 'activeInvestment' | 'traderName' | 'traderPhone' | 'createdAt'>,
    pass: string
  ) => {
    const defaultSlCodes = [
      'SL-568-725',
      'SL-194-836',
      'SL-807-451',
      'SL-632-918',
      'SL-275-604',
      'SL-981-357',
      'SL-416-829',
      'SL-753-102',
      'SL-248-690',
      'SL-875-431'
    ];
    const randomSl = defaultSlCodes[Math.floor(Math.random() * defaultSlCodes.length)];

    const newUser: User = {
      ...userData,
      password: pass,
      id: `usr-${Math.floor(10000 + Math.random() * 90000)}`,
      depositWallet: 0,
      profitWallet: 0,
      activeInvestment: 0,
      traderName: 'Rohit Singhania (Senior Trader)',
      traderPhone: '8696860548',
      slCode: randomSl,
      createdAt: new Date().toISOString()
    };

    // Store password (legacy local storage just in case) and register user
    localStorage.setItem(`cryptix_pass_${newUser.username}`, pass);
    const updatedUsers = [...users, newUser];
    saveUsersToStorage(updatedUsers);
    syncUser(newUser); // Persist to Firestore

    // Automaticaly log in new signup
    setCurrentUser(newUser);
    localStorage.setItem('cryptix_current_user', JSON.stringify(newUser));
    addLog('New client profile registered', newUser.username);
    setActiveTab('plan');
  };

  // 4.1 Social Login Handler
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { googleProvider, facebookProvider } = await import('./lib/firebase');
      
      const authProvider = provider === 'google' ? googleProvider : facebookProvider;
      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        let profile: User;
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            profile = userSnap.data() as User;
          } else {
            throw new Error('Not in Firestore');
          }
        } catch (e) {
          const defaultSlCodes = [
            'SL-568-725', 'SL-194-836', 'SL-807-451', 'SL-632-918', 'SL-275-604',
            'SL-981-357', 'SL-416-829', 'SL-753-102', 'SL-248-690', 'SL-875-431'
          ];
          const randomSl = defaultSlCodes[Math.floor(Math.random() * defaultSlCodes.length)];
          
          profile = {
            id: user.uid,
            name: user.displayName || (provider === 'google' ? 'Google Investor' : 'Facebook Investor'),
            username: user.email?.split('@')[0] || `${provider}_user_${Math.floor(Math.random() * 10000)}`,
            email: user.email || `${provider}_${user.uid}@cryptix.com`,
            phone: user.phoneNumber || '',
            whatsapp: user.phoneNumber || '',
            profession: 'Trader',
            dob: '2000-01-01',
            depositWallet: 0,
            profitWallet: 0,
            activeInvestment: 0,
            traderName: 'Rohit Singhania (Senior Trader)',
            traderPhone: '8696860548',
            slCode: randomSl,
            createdAt: new Date().toISOString()
          };
          setDoc(userDocRef, profile).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${profile.id}`));
          addLog('New social profile registered via ' + provider, profile.username);
        }
        
        const updatedUsers = users.some(u => u.id === profile.id) ? users : [...users, profile];
        saveUsersToStorage(updatedUsers);
        setCurrentUser(profile);
        localStorage.setItem('cryptix_current_user', JSON.stringify(profile));
        addLog('Client social session authenticated', profile.username);
        setActiveTab('plan');
        toast.success(`Welcome, ${profile.name}!`);
        return;
      }
    } catch (error: any) {
      console.warn('Firebase popup sign-in fallback triggered:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled.');
        return;
      }
    }

    // Seamless fallback authentication for preview / restricted domains
    const defaultSlCodes = [
      'SL-568-725', 'SL-194-836', 'SL-807-451', 'SL-632-918', 'SL-275-604',
      'SL-981-357', 'SL-416-829', 'SL-753-102', 'SL-248-690', 'SL-875-431'
    ];
    const randomSl = defaultSlCodes[Math.floor(Math.random() * defaultSlCodes.length)];
    const fallbackId = `soc-${provider}-${Math.floor(10000 + Math.random() * 90000)}`;
    const fallbackName = provider === 'google' ? 'Google Investor' : 'Facebook Investor';
    const fallbackEmail = `${provider}user${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;

    const profile: User = {
      id: fallbackId,
      name: fallbackName,
      username: `${provider}_user_${Math.floor(Math.random() * 10000)}`,
      email: fallbackEmail,
      phone: '',
      whatsapp: '',
      profession: 'Trader',
      dob: '2000-01-01',
      depositWallet: 0,
      profitWallet: 0,
      activeInvestment: 0,
      traderName: 'Rohit Singhania (Senior Trader)',
      traderPhone: '8696860548',
      slCode: randomSl,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = users.some(u => u.id === profile.id) ? users : [...users, profile];
    saveUsersToStorage(updatedUsers);
    setCurrentUser(profile);
    localStorage.setItem('cryptix_current_user', JSON.stringify(profile));
    addLog('Client social session authenticated via ' + provider, profile.username);
    setActiveTab('plan');
    toast.success(`Welcome, ${profile.name}!`);
  };

  // 5. Submit Deposit Claim UTR Form
  const handleDepositSubmit = (tx: Omit<Transaction, 'id' | 'userId' | 'username' | 'userPhone' | 'status' | 'date'>) => {
    if (!currentUser) return;

    const newTx: Transaction = {
      ...tx,
      id: `TX-${Math.floor(2000 + Math.random() * 8000)}`,
      userId: currentUser.id,
      username: currentUser.username,
      userPhone: currentUser.phone,
      status: 'pending',
      date: new Date().toLocaleString()
    };

    const updated = [newTx, ...transactions];
    saveTransactionsToStorage(updated);
    syncTransaction(newTx);
    addLog(`Submitted deposit UTR claim for verification of ${tx.amount} INR`, currentUser.username);
  };

  // 6. Submit Withdrawal Settlement
  const handleWithdrawalSubmit = (amount: number, details: any): boolean => {
    if (!currentUser) return false;

    // Check if user has sufficient Profit Wallet Balance
    if (currentUser.profitWallet < amount) {
      return false;
    }

    // Deduct pending amount immediately for transparency
    const updatedUsers = users.map(user => {
      if (user.username === currentUser.username) {
        const updated = {
          ...user,
          profitWallet: user.profitWallet - amount
        };
        setCurrentUser(updated);
        localStorage.setItem('cryptix_current_user', JSON.stringify(updated));
        return updated;
      }
      return user;
    });
    saveUsersToStorage(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.username === currentUser.username);
    if (updatedUser) syncUser(updatedUser);

    const newTx: Transaction = {
      id: `TX-${Math.floor(2000 + Math.random() * 8000)}`,
      userId: currentUser.id,
      username: currentUser.username,
      userPhone: currentUser.phone,
      type: 'withdrawal',
      amount,
      status: 'pending',
      date: new Date().toLocaleString(),
      bankDetails: details
    };

    const updatedTxs = [newTx, ...transactions];
    saveTransactionsToStorage(updatedTxs);
    syncTransaction(newTx);
    addLog(`Submitted withdrawal request for ${amount} INR via ${details.method}`, currentUser.username);
    return true;
  };

  // 7. Admin Action: Approve Transaction (deposit / withdrawal)
  const handleApproveTransaction = (txId: string) => {
    const txMatch = transactions.find(t => t.id === txId);
    if (!txMatch) return;

    const updatedTxs = transactions.map(t => {
      if (t.id === txId) {
        return { ...t, status: 'completed' as const };
      }
      return t;
    });

    // Update Client Balances
    let targetUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.username === txMatch.username) {
        let updatedUser = { ...u };
        
        if (txMatch.type === 'deposit') {
          // Add funds to deposit wallet
          updatedUser.depositWallet += txMatch.amount;
          
          // Automaticaly launch matched 1-hour Micro-Contract Trade!
          const contractTimeMs = 60 * 60 * 1000; 

          // Find approximate matched plan to fetch estimated profit
          const matchedPlanAmount = txMatch.amount;
          // Calculate high-multiplier profit if not an exact plan size
          const simulatedProfit = Math.round(matchedPlanAmount * 14); 

          const newActiveTrade: ActiveTrade = {
            id: `TRD-${Math.floor(10000 + Math.random() * 90000)}`,
            userId: u.id,
            username: u.username,
            amount: matchedPlanAmount,
            estimatedProfit: simulatedProfit,
            planName: 'Auto Verified',
            duration: '1 Hour',
            startTime: Date.now(),
            endTime: Date.now() + contractTimeMs,
            status: 'active',
            currentProfit: 0
          };

          // Save active trades
          const freshTrades = [newActiveTrade, ...activeTrades];
          saveTradesToStorage(freshTrades);
          syncTrade(newActiveTrade);

          // Update active investment indicator
          updatedUser.activeInvestment += matchedPlanAmount;
          updatedUser.depositWallet = Math.max(0, updatedUser.depositWallet - matchedPlanAmount);
        }

        // Sync currently logged in client profile
        if (currentUser && currentUser.username === u.username) {
          setCurrentUser(updatedUser);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updatedUser));
        }
        targetUser = updatedUser;
        return updatedUser;
      }
      return u;
    });

    saveUsersToStorage(updatedUsers);
    if (targetUser) syncUser(targetUser);

    const updatedTxMatch = { ...txMatch, status: 'completed' as const };
    saveTransactionsToStorage(updatedTxs);
    syncTransaction(updatedTxMatch);
    addLog(`Approved ${txMatch.type} for ₹${txMatch.amount}. Active contract activated automatically.`, 'admin');
  };

  // 8. Admin Action: Reject Claim
  const handleRejectTransaction = (txId: string) => {
    const txMatch = transactions.find(t => t.id === txId);
    if (!txMatch) return;

    const updatedTxs = transactions.map(t => {
      if (t.id === txId) {
        return { ...t, status: 'rejected' as const };
      }
      return t;
    });

    // Refund withdrawal funds if rejected
    let targetUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.username === txMatch.username) {
        let updatedUser = { ...u };
        if (txMatch.type === 'withdrawal') {
          updatedUser.profitWallet += txMatch.amount;
        }
        if (currentUser && currentUser.username === u.username) {
          setCurrentUser(updatedUser);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updatedUser));
        }
        targetUser = updatedUser;
        return updatedUser;
      }
      return u;
    });

    saveUsersToStorage(updatedUsers);
    if (targetUser) syncUser(targetUser);

    const updatedTxMatch = { ...txMatch, status: 'rejected' as const };
    saveTransactionsToStorage(updatedTxs);
    syncTransaction(updatedTxMatch);
    addLog(`Rejected ${txMatch.type} claim of ₹${txMatch.amount} for compliance misalignment`, 'admin');
  };

  // 9. Admin Action: Edit client details manually
  const handleUpdateUserBalance = (
    userId: string,
    deposit: number,
    profit: number,
    active: number,
    traderName: string,
    traderPhone: string,
    slCode?: string,
    isWithdrawalLocked?: boolean,
    restrictionReason?: string
  ) => {
    let targetUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          depositWallet: deposit,
          profitWallet: profit,
          activeInvestment: active,
          traderName,
          traderPhone,
          slCode: slCode || u.slCode,
          isWithdrawalLocked: isWithdrawalLocked !== undefined ? isWithdrawalLocked : u.isWithdrawalLocked,
          restrictionReason: restrictionReason !== undefined ? restrictionReason : u.restrictionReason
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updated));
        }
        targetUser = updated;
        return updated;
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);
    if (targetUser) syncUser(targetUser);
    addLog(`Manually modified balances/details for client ID: ${userId}`, 'admin');
  };

  const handlePushComplianceMessage = (userId: string, message: string) => {
    let targetUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          complianceMessages: [...(u.complianceMessages || []), message]
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updated));
        }
        targetUser = updated;
        return updated;
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);
    if (targetUser) syncUser(targetUser);
    addLog(`Sent compliance message to client ID: ${userId}`, 'admin');
  };

  // 9.1 User Action: Edit SL Code manually
  const handleUpdateSlCode = (userId: string, slCode: string) => {
    let targetUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          slCode
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updated));
        }
        targetUser = updated;
        return updated;
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);
    if (targetUser) syncUser(targetUser);
    addLog(`Manually modified SL Code to: ${slCode}`, currentUser?.username || 'user');
  };

  // 9.5. Market Trade Action: Update current user wallets
  const handleUpdateWallet = (depositChange: number, profitChange: number) => {
    if (!currentUser) return;
    let targetUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        const updated = {
          ...u,
          depositWallet: Math.max(0, u.depositWallet + depositChange),
          profitWallet: Math.max(0, u.profitWallet + profitChange),
        };
        setCurrentUser(updated);
        localStorage.setItem('cryptix_current_user', JSON.stringify(updated));
        targetUser = updated;
        return updated;
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);
    if (targetUser) syncUser(targetUser);
  };

  // 9.6. Real Asset Live Trade Action
  const handleExecuteTrade = (amount: number, estimatedProfit: number, assetName: string, durationLabel: string) => {
    if (!currentUser) return;
    
    // Check balance and deduct from deposit wallet first, then profit wallet if needed
    const totalBalanceAvailable = currentUser.depositWallet + currentUser.profitWallet;
    if (totalBalanceAvailable < amount) return;

    let depositDeduction = 0;
    let profitDeduction = 0;

    if (currentUser.depositWallet >= amount) {
      depositDeduction = amount;
    } else {
      depositDeduction = currentUser.depositWallet;
      profitDeduction = amount - depositDeduction;
    }

    let targetUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        const updated = {
          ...u,
          depositWallet: Math.max(0, u.depositWallet - depositDeduction),
          profitWallet: Math.max(0, u.profitWallet - profitDeduction),
          activeInvestment: u.activeInvestment + amount,
        };
        setCurrentUser(updated);
        localStorage.setItem('cryptix_current_user', JSON.stringify(updated));
        targetUser = updated;
        return updated;
      }
      return u;
    });

    saveUsersToStorage(updatedUsers);
    if (targetUser) syncUser(targetUser);

    // Set simulated countdown durations:
    let durationMs = 60 * 60 * 1000; // default 1 hour
    if (durationLabel === '60s') durationMs = 60 * 1000;
    else if (durationLabel === '3m') durationMs = 3 * 60 * 1000;
    else if (durationLabel === '5m') durationMs = 5 * 60 * 1000;
    else if (durationLabel === '15m') durationMs = 15 * 60 * 1000;
    else if (durationLabel === '1h') durationMs = 60 * 60 * 1000;
    else if (durationLabel === '1D') durationMs = 24 * 60 * 60 * 1000;

    const newActiveTrade: ActiveTrade = {
      id: `TRD-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser.id,
      username: currentUser.username,
      amount: amount,
      estimatedProfit: estimatedProfit,
      planName: `${assetName} Trade`,
      duration: durationLabel,
      startTime: Date.now(),
      endTime: Date.now() + durationMs,
      status: 'active',
      currentProfit: 0
    };

    const freshTrades = [newActiveTrade, ...activeTrades];
    saveTradesToStorage(freshTrades);
    syncTrade(newActiveTrade);
    
    // Record Trade Transaction in History
    const tradeTx: Transaction = {
      id: `TX-${Math.floor(2000 + Math.random() * 8000)}`,
      userId: currentUser.id,
      username: currentUser.username,
      userPhone: currentUser.phone,
      type: 'trade',
      amount: amount,
      status: 'completed',
      date: new Date().toLocaleString(),
      description: `Opened ${assetName} trade contract (${durationLabel})`
    };
    saveTransactionsToStorage([tradeTx, ...transactions]);
    syncTransaction(tradeTx);

    addLog(`Deducted ₹${amount} and launched active ${assetName} trade contract for ${durationLabel}.`, currentUser.username);
  };

  // 10. Admin Action: Save Website Setting Configurations
  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    await setDoc(doc(db, 'settings', 'config'), newSettings);
    addLog('System configs, UPI details, and priority QR code scanners updated', 'admin');
  };

  // 11. User triggers direct investment slot click from home tab
  const handleInvestSelect = (plan: InvestmentPlan) => {
    setSelectedPlanForInvestment(plan);
    setActiveTab('wallet');
    addLog(`Selected investment slot ${plan.category} ₹${plan.amount} - Redirected to payment form`, currentUser?.username || 'anonymous');
  };

  // 13. Submit Custom Investment Request Form (not shown in user's transactions history)
  const handleInvestmentRequestSubmit = (req: Omit<InvestmentRequest, 'id' | 'userId' | 'username' | 'status' | 'date'>) => {
    if (!currentUser) return;
    const newReq: InvestmentRequest = {
      ...req,
      id: `REQ-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser.id,
      username: currentUser.username,
      status: 'pending',
      date: new Date().toLocaleString()
    };
    const updated = [newReq, ...investmentRequests];
    saveInvestmentRequestsToStorage(updated);
    syncInvestmentRequest(newReq);
    addLog(`Submitted custom investment form for ₹${req.amount} via WhatsApp`, currentUser.username);
  };

  // 14. Admin Action: Approve Investment Request
  const handleApproveInvestmentRequest = (reqId: string) => {
    const reqMatch = investmentRequests.find(r => r.id === reqId);
    if (!reqMatch) return;

    const updatedRequests = investmentRequests.map(r => {
      if (r.id === reqId) {
        return { ...r, status: 'approved' as const };
      }
      return r;
    });

    // Update Client Balances
    let targetUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.username === reqMatch.username) {
        let updatedUser = { ...u };
        
        // Find approximate matched plan to fetch estimated profit
        const matchedPlan = INVESTMENT_PLANS.find(p => p.id === reqMatch.planId || p.amount === reqMatch.amount);
        const estimatedProfit = matchedPlan ? matchedPlan.estimatedProfit : Math.round(reqMatch.amount * 14);

        const contractTimeMs = 60 * 60 * 1000; // 1 Hour
        const newActiveTrade: ActiveTrade = {
          id: `TRD-${Math.floor(10000 + Math.random() * 90000)}`,
          userId: u.id,
          username: u.username,
          amount: reqMatch.amount,
          estimatedProfit: estimatedProfit,
          planName: matchedPlan ? `${matchedPlan.category} Contract` : 'Custom Contract',
          duration: '1 Hour',
          startTime: Date.now(),
          endTime: Date.now() + contractTimeMs,
          status: 'active',
          currentProfit: 0
        };

        // Save active trades
        const freshTrades = [newActiveTrade, ...activeTrades];
        saveTradesToStorage(freshTrades);
        syncTrade(newActiveTrade);

        // Record Investment Transaction in History
        const investTx: Transaction = {
          id: `TX-${Math.floor(2000 + Math.random() * 8000)}`,
          userId: u.id,
          username: u.username,
          userPhone: u.phone,
          type: 'investment',
          amount: reqMatch.amount,
          status: 'completed',
          date: new Date().toLocaleString(),
          description: `Started ${matchedPlan ? matchedPlan.category : 'Custom'} Investment Contract`
        };
        saveTransactionsToStorage([investTx, ...transactions]);
        syncTransaction(investTx);

        // Update active investment indicator
        updatedUser.activeInvestment += reqMatch.amount;

        // Sync currently logged in client profile
        if (currentUser && currentUser.username === u.username) {
          setCurrentUser(updatedUser);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updatedUser));
        }
        targetUser = updatedUser;
        return updatedUser;
      }
      return u;
    });

    saveUsersToStorage(updatedUsers);
    if (targetUser) syncUser(targetUser);

    const updatedReqMatch = { ...reqMatch, status: 'approved' as const };
    saveInvestmentRequestsToStorage(updatedRequests);
    syncInvestmentRequest(updatedReqMatch);
    addLog(`Approved investment request of ₹${reqMatch.amount} for @${reqMatch.username}`, 'admin');
  };

  // 15. Admin Action: Reject Investment Request
  const handleRejectInvestmentRequest = (reqId: string) => {
    const reqMatch = investmentRequests.find(r => r.id === reqId);
    if (!reqMatch) return;

    const updatedRequests = investmentRequests.map(r => {
      if (r.id === reqId) {
        return { ...r, status: 'rejected' as const };
      }
      return r;
    });

    const updatedReqMatch = { ...reqMatch, status: 'rejected' as const };
    saveInvestmentRequestsToStorage(updatedRequests);
    syncInvestmentRequest(updatedReqMatch);
    addLog(`Rejected investment request of ₹${reqMatch.amount} for @${reqMatch.username}`, 'admin');
  };

  // 12. Log out current user session
  const handleLogout = () => {
    addLog('Client security session disconnected', currentUser?.username || 'unknown');
    setCurrentUser(null);
    localStorage.removeItem('cryptix_current_user');
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between" id="app-root-container">
      <Toaster position="top-right" theme="dark" richColors closeButton />

      {showSplash && isApk && <SplashScreen onComplete={() => setShowSplash(false)} logoUrl={systemSettings.logoUrl} />}
      
      {!showSplash && isApk && !currentUser && activeTab !== 'admin' && activeTab !== 'account' && (
        <AuthGate 
          logoUrl={systemSettings.logoUrl}
          onSelectLogin={() => {
            setAuthMode('login');
            setActiveTab('account');
          }}
          onSelectSignup={() => {
            setAuthMode('signup');
            setActiveTab('account');
          }}
          onSocialLogin={handleSocialLogin}
        />
      )}

      {/* Header Navigation */}
      {(!showSplash || !isApk) && (!isApk || currentUser || activeTab === 'admin' || activeTab === 'account') && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setAuthMode={(mode) => {
            setAuthMode(mode);
            setActiveTab('account');
          }}
          authMode={authMode}
          isLoggedIn={!!currentUser}
          currentUser={currentUser}
          onLogout={handleLogout}
          supportPhone={systemSettings.supportPhone}
          mobileShowHome={mobileShowHome}
          setMobileShowHome={setMobileShowHome}
          isMobile={isMobile}
          logoUrl={systemSettings.logoUrl}
        />
      )}

      {/* Scrolling Compliance Banner */}
      {currentUser && activeTab !== 'admin' && systemSettings.complianceMessage && (
        <div className="bg-red-600/10 border-y border-red-600/20 overflow-hidden py-2" id="compliance-marquee-container">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-[10px] md:text-xs font-black text-red-500 uppercase tracking-[0.2em] px-4">
              {systemSettings.complianceMessage} • {systemSettings.complianceMessage} • {systemSettings.complianceMessage} • {systemSettings.complianceMessage}
            </span>
          </div>
        </div>
      )}

      <div className="flex-grow w-full">
        {/* Main Content Area */}
        {(!showSplash || !isApk) && (!isApk || currentUser || activeTab === 'admin' || activeTab === 'account') && (
          <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
            {/* Desktop or Mobile view */}
            <>
            {activeTab === 'home' && (
              <HomeSection
                systemSettings={systemSettings}
                isLoggedIn={!!currentUser}
                onNavigateToAuth={(mode) => {
                  setAuthMode(mode || 'signup');
                  setActiveTab('account');
                  setSelectedPlanForInvestment(null);
                }}
                onNavigateToPlans={() => {
                  if (currentUser) {
                    setActiveTab('plan');
                  } else {
                    setAuthMode('signup');
                    setActiveTab('account');
                  }
                }}
              />
            )}

            {activeTab === 'plan' && (
              <PlanSection
                onInvestSelect={handleInvestSelect}
                systemSettings={systemSettings}
              />
            )}

            {activeTab === 'trade' && (
              <TradeSection
                activeTrades={activeTrades}
                isLoggedIn={!!currentUser}
                currentUser={currentUser}
                onExecuteTrade={handleExecuteTrade}
                onNavigateToWallet={(subTab) => {
                  setActiveTab('wallet');
                  // We can add logic to set the specific subtab in WalletSection if needed
                }}
                onNavigateToHome={() => {
                  setActiveTab('account');
                  setSelectedPlanForInvestment(null);
                }}
                onInvestSelect={handleInvestSelect}
                systemSettings={systemSettings}
                onChangeTab={setActiveTab}
              />
            )}

            {activeTab === 'market' && (
              <MarketSection
                currentUser={currentUser}
                onUpdateWallet={handleUpdateWallet}
                addLog={addLog}
                systemSettings={systemSettings}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletSection
                isLoggedIn={!!currentUser}
                currentUser={currentUser}
                systemSettings={systemSettings}
                transactions={transactions}
                activeTrades={activeTrades}
                investmentRequests={investmentRequests}
                onSubmitDeposit={handleDepositSubmit}
                onSubmitWithdrawal={handleWithdrawalSubmit}
                selectedPlanForInvestment={selectedPlanForInvestment}
                setSelectedPlanForInvestment={setSelectedPlanForInvestment}
                onNavigateToAuth={() => {
                  setActiveTab('account');
                  setSelectedPlanForInvestment(null);
                }}
                onNavigateToTrade={() => setActiveTab('trade')}
                onNavigateToPlans={() => setActiveTab('plan')}
                onInvestmentRequestSubmit={handleInvestmentRequestSubmit}
                isApk={isApk}
              />
            )}

            {activeTab === 'account' && (
              <AccountSection
                isLoggedIn={!!currentUser}
                currentUser={currentUser}
                onLogin={handleUserLogin}
                onSignup={handleUserSignup}
                onSocialLogin={handleSocialLogin}
                systemSettings={systemSettings}
                onLogout={handleLogout}
                users={users}
                adminMessages={adminMessages}
                initialMode={authMode}
                onUpdateSlCode={handleUpdateSlCode}
                soundEffectsEnabled={soundEffectsEnabled}
                onToggleSoundEffects={(enabled) => {
                  setSoundEffectsEnabled(enabled);
                  localStorage.setItem('cryptix_sound_effects_enabled', JSON.stringify(enabled));
                }}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel
                users={users}
                transactions={transactions}
                systemSettings={systemSettings}
                activityLogs={activityLogs}
                onUpdateSettings={handleUpdateSettings}
                onApproveTransaction={handleApproveTransaction}
                onRejectTransaction={handleRejectTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateUserBalance={handleUpdateUserBalance}
                onUpdateUsersBatch={saveUsersToStorage}
                onPushComplianceMessage={handlePushComplianceMessage}
                investmentRequests={investmentRequests}
                onApproveInvestmentRequest={handleApproveInvestmentRequest}
                onRejectInvestmentRequest={handleRejectInvestmentRequest}
                onDeleteInvestmentRequest={handleDeleteInvestmentRequest}
                onClearAllRejectedTransactions={handleClearAllRejectedTransactions}
                onPurgeDatabase={handlePurgeDatabase}
                adminMessages={adminMessages}
                onSendMessage={handleSendMessage}
              />
            )}
          </>
        </main>
      )}
      </div>

      {/* Luxury Footer bar with regulatory clearance - Render ONLY on Desktop Home page */}
      {activeTab === 'home' && !isMobile && (
        <footer className="bg-[#050811] border-t border-slate-800/80 py-8 text-xs text-slate-500 font-mono" id="app-footer">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {/* Logo Brand */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-300 font-sans uppercase tracking-widest">CryptixOne Asset Group</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Regulated micro-yield allocations licensed in compliance with digital assets protocols and secure national ledger auditing. Partner of SBI Finance.
              </p>
            </div>

            {/* Links / T&C */}
            <div className="space-y-1 text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Official Links</span>
              <p className="hover:text-slate-300 transition-all cursor-pointer">Sovereign Asset Disclosures</p>
              <p className="hover:text-slate-300 transition-all cursor-pointer">SBI Finance of India Terms</p>
              <p className="hover:text-slate-300 transition-all cursor-pointer">Digital UTR Claims Protocol</p>
            </div>

            {/* Contact support */}
            <div className="space-y-1 text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Central Compliance Desk</span>
              <p className="text-slate-400">Email: <span className="text-amber-500 font-bold">{systemSettings.companyEmail}</span></p>
              <p className="text-slate-400">WhatsApp Hotlines: <span className="text-emerald-400 font-bold">+91 {systemSettings.supportWhatsApp}</span></p>
              <p className="text-[10px] text-slate-600 uppercase mt-2">© 2026 CryptixOne.com. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

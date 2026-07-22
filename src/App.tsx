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
import { db } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  getDocs,
  getDoc
} from 'firebase/firestore';

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
  const [users, setUsers] = useState<User[]>([]);
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
        setDoc(settingsRef, DEFAULT_SETTINGS);
        setSystemSettings(DEFAULT_SETTINGS);
      }
    }, (error) => {
      console.error("Settings snapshot error:", error);
    });

    // Real-time Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data() } as User));
      setUsers(usersData);
      
      // Update current user if logged in
      const storedCurrentUser = localStorage.getItem('cryptix_current_user');
      if (storedCurrentUser) {
        const parsedUser = JSON.parse(storedCurrentUser);
        const freshUser = usersData.find(u => u.username === parsedUser.username);
        if (freshUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('cryptix_current_user', JSON.stringify(freshUser));
        }
      }
    }, (error) => {
      console.error("Users snapshot error:", error);
    });

    // Request Notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // Real-time Transactions
    const unsubscribeTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('date', 'desc')), (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
      setTransactions(txs);
    }, (error) => {
      console.error("Transactions snapshot error:", error);
    });

    // Real-time Active Trades
    const unsubscribeTrades = onSnapshot(collection(db, 'trades'), (snapshot) => {
      const trades = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActiveTrade));
      setActiveTrades(trades);
    }, (error) => {
      console.error("Trades snapshot error:", error);
    });

    // Real-time Logs
    const unsubscribeLogs = onSnapshot(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog));
      setActivityLogs(logs);
    }, (error) => {
      console.error("Logs snapshot error:", error);
    });

    // Real-time Investment Requests
    const unsubscribeRequests = onSnapshot(query(collection(db, 'requests'), orderBy('date', 'desc')), (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InvestmentRequest));
      setInvestmentRequests(reqs);
    }, (error) => {
      console.error("Requests snapshot error:", error);
    });

    // Real-time Admin Messages
    const unsubscribeMessages = onSnapshot(query(collection(db, 'messages'), orderBy('timestamp', 'desc')), (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AdminMessage));
      setAdminMessages(msgs);
    }, (error) => {
      console.error("Messages snapshot error:", error);
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
  const saveUsersToStorage = async (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    // Sync each user to Firestore
    for (const user of updatedUsers) {
      await setDoc(doc(db, 'users', user.id), user);
    }
  };

  const saveTransactionsToStorage = async (updatedTxs: Transaction[]) => {
    setTransactions(updatedTxs);
    for (const tx of updatedTxs) {
      await setDoc(doc(db, 'transactions', tx.id), tx);
    }
  };

  const saveTradesToStorage = async (updatedTrades: ActiveTrade[]) => {
    setActiveTrades(updatedTrades);
    for (const trade of updatedTrades) {
      await setDoc(doc(db, 'trades', trade.id), trade);
    }
  };

  const saveInvestmentRequestsToStorage = async (updatedRequests: InvestmentRequest[]) => {
    setInvestmentRequests(updatedRequests);
    for (const req of updatedRequests) {
      await setDoc(doc(db, 'requests', req.id), req);
    }
  };

  const saveAdminMessagesToStorage = async (updated: AdminMessage[]) => {
    setAdminMessages(updated);
    for (const msg of updated) {
      await setDoc(doc(db, 'messages', msg.id), msg);
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
    await setDoc(doc(db, 'messages', id), newMsg);
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
    await setDoc(doc(db, 'logs', id), newLog);
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
            
            // Move funds from Active investment to Profit Wallet of client
            const updatedUsers = users.map(user => {
              if (user.username === trade.username) {
                const profitEarned = trade.estimatedProfit;
                const refundCapital = trade.amount;
                const newProfit = user.profitWallet + profitEarned;
                const newActive = Math.max(0, user.activeInvestment - refundCapital);
                
                const updatedUser = {
                  ...user,
                  profitWallet: newProfit,
                  activeInvestment: newActive
                };

                // If currently logged in user is this user, sync current user state
                if (currentUser && currentUser.username === user.username) {
                  setCurrentUser(updatedUser);
                  localStorage.setItem('cryptix_current_user', JSON.stringify(updatedUser));
                  
                  // Alert the user of the maturity payout
                  toast.success(`Capital Settlement: +₹${profitEarned}`, {
                    description: `Contract ${trade.id} has matured successfully. Payout added to your yield balance.`,
                    duration: 6000,
                  });

                  // Play custom maturity sound
                  playMaturitySound(soundEffectsEnabled);

                  // Dispatch device Web Notification
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
                return updatedUser;
              }
              return user;
            });
            
            saveUsersToStorage(updatedUsers);
            addLog(`Micro-Investment contract matured and payouts settled. Yield: +${trade.estimatedProfit}`, trade.username);
          }
        }
        return trade;
      });

      if (hasChange) {
        saveTradesToStorage(updatedTrades);
      }
    }, 1000);

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

    // Automaticaly log in new signup
    setCurrentUser(newUser);
    localStorage.setItem('cryptix_current_user', JSON.stringify(newUser));
    addLog('New client profile registered', newUser.username);
    setActiveTab('plan');
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
    const updatedUsers = users.map(u => {
      if (u.username === txMatch.username) {
        let updatedUser = { ...u };
        
        if (txMatch.type === 'deposit') {
          // Add funds to deposit wallet
          updatedUser.depositWallet += txMatch.amount;
          
          // Automaticaly launch matched 1-hour Micro-Contract Trade!
          // This ensures immediate real-time feedback and high satisfaction!
          const simulated1HourDuration = 60 * 60 * 1000; // 1 Hour
          // For easy demonstration/testing, if contract is less than ₹10k, let it countdown in 3 minutes (180 secs)
          // or keep standard 1 hour. Let's make it 10 minutes so it has nice speed, or standard 1 hour.
          // Let's do a fast-track 1-hour contract timer (simulated: 10 mins / 600s) so they see quick payouts!
          // We can set actual 1-hour countdown.
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

          // Update active investment indicator
          updatedUser.activeInvestment += matchedPlanAmount;
          updatedUser.depositWallet = Math.max(0, updatedUser.depositWallet - matchedPlanAmount);
        } else {
          // Withdrawal completes (payout already deducted on submission)
        }

        // Sync currently logged in client profile
        if (currentUser && currentUser.username === u.username) {
          setCurrentUser(updatedUser);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
      }
      return u;
    });

    saveUsersToStorage(updatedUsers);
    saveTransactionsToStorage(updatedTxs);
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
        return updatedUser;
      }
      return u;
    });

    saveUsersToStorage(updatedUsers);
    saveTransactionsToStorage(updatedTxs);
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
    isWithdrawalLocked?: boolean
  ) => {
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
          isWithdrawalLocked: isWithdrawalLocked !== undefined ? isWithdrawalLocked : u.isWithdrawalLocked
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updated));
        }
        return updated;
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);
    addLog(`Manually modified balances/details for client ID: ${userId}`, 'admin');
  };

  // 9.1 User Action: Edit SL Code manually
  const handleUpdateSlCode = (userId: string, slCode: string) => {
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
        return updated;
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);
    addLog(`Manually modified SL Code to: ${slCode}`, currentUser?.username || 'user');
  };

  // 9.5. Market Trade Action: Update current user wallets
  const handleUpdateWallet = (depositChange: number, profitChange: number) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        const updated = {
          ...u,
          depositWallet: Math.max(0, u.depositWallet + depositChange),
          profitWallet: Math.max(0, u.profitWallet + profitChange),
        };
        setCurrentUser(updated);
        localStorage.setItem('cryptix_current_user', JSON.stringify(updated));
        return updated;
      }
      return u;
    });
    saveUsersToStorage(updatedUsers);
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
        return updated;
      }
      return u;
    });

    saveUsersToStorage(updatedUsers);

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

        // Update active investment indicator
        updatedUser.activeInvestment += reqMatch.amount;

        // Sync currently logged in client profile
        if (currentUser && currentUser.username === u.username) {
          setCurrentUser(updatedUser);
          localStorage.setItem('cryptix_current_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
      }
      return u;
    });

    saveUsersToStorage(updatedUsers);
    saveInvestmentRequestsToStorage(updatedRequests);
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

    saveInvestmentRequestsToStorage(updatedRequests);
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

      {showSplash && isApk && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {!showSplash && isApk && !currentUser && activeTab !== 'admin' && activeTab !== 'account' && (
        <AuthGate 
          onSelectLogin={() => {
            setAuthMode('login');
            setActiveTab('account');
          }}
          onSelectSignup={() => {
            setAuthMode('signup');
            setActiveTab('account');
          }}
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
                onUpdateUserBalance={handleUpdateUserBalance}
                investmentRequests={investmentRequests}
                onApproveInvestmentRequest={handleApproveInvestmentRequest}
                onRejectInvestmentRequest={handleRejectInvestmentRequest}
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

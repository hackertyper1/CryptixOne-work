export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  whatsapp: string;
  profession?: string;
  dob?: string;
  depositWallet: number;
  profitWallet: number;
  activeInvestment: number;
  traderName: string;
  traderPhone: string;
  createdAt: string;
}

export interface InvestmentPlan {
  id: string;
  amount: number;
  duration: string; // e.g. "1 Hour" or "7 Days"
  estimatedProfit: number;
  category: 'Today' | 'Small' | 'Elite' | 'Premium';
  badge?: string;
  isVip?: boolean;
}

export interface ActiveTrade {
  id: string;
  userId: string;
  username: string;
  amount: number;
  estimatedProfit: number;
  planName: string;
  duration: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  status: 'active' | 'completed';
  currentProfit: number; // floating real-time profit
  halfwayNotified?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  userPhone: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected' | 'approved';
  date: string;
  utr?: string;
  bankDetails?: {
    accountNo: string;
    bankName: string;
    ifsc: string;
    upiId?: string;
    scannerImg?: string;
    method: 'upi' | 'bank' | 'scanner';
  };
  detailsForm?: {
    name: string;
    phone: string;
    email: string;
    whatsapp: string;
    profession: string;
    dob: string;
  };
}

export interface SystemSettings {
  qrCodeUrl: string;
  upiId: string;
  supportWhatsApp: string;
  supportPhone: string;
  companyEmail: string;
  scannerUrl?: string; // explicitly for the scanner update
  qrCodeImage?: string; // base64 or url for the admin uploaded QR code
}

export interface AdminMessage {
  id: string;
  sender: 'admin';
  recipientId: string; // 'all' for broadcast
  subject: string;
  content: string;
  timestamp: string;
  type: 'individual' | 'broadcast' | 'announcement';
  read: boolean;
}

export interface InvestmentRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  amount: number;
  utr: string;
  profession: string;
  dob: string;
  planId: string;
  planCategory: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  username: string;
  encryptedPayload: string; // simulated encrypted log for high security compliance
}

export interface Post {
  id: string;
  authorName: string;
  authorUsername: string;
  content: string;
  approved: boolean;
  likes: number;
  createdAt: number;
}

export interface StockTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  trend: 'up' | 'down';
  logo: string;
}

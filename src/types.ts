export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  whatsapp: string;
  password?: string;
  profession?: string;
  dob?: string;
  depositWallet: number;
  profitWallet: number;
  activeInvestment: number;
  traderName: string;
  traderPhone: string;
  slCode?: string;
  isWithdrawalLocked?: boolean;
  restrictionReason?: string; // Reason why account/withdrawal is restricted
  complianceMessages?: string[]; // Array of manual messages from admin
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
  type: 'deposit' | 'withdrawal' | 'investment' | 'trade' | 'profit' | 'loss';
  amount: number;
  status: 'pending' | 'completed' | 'rejected' | 'approved';
  date: string;
  description?: string; // For trade/investment details
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
  traderName?: string;
  traderPhone?: string;
  traderWhatsApp?: string;
  companyEmail: string;
  scannerUrl?: string; // explicitly for the scanner update
  qrCodeImage?: string; // base64 or url for the admin uploaded QR code
  tradeTimeLimit?: number; // duration limit in minutes
  complianceMessage?: string; // Scrolling banner text

  // Individual payment UPI IDs and QR images
  upiUpiId?: string;
  upiQrCode?: string;

  upiQrUpiId?: string;
  upiQrQrCode?: string;

  paytmUpiId?: string;
  paytmQrCode?: string;

  gpayUpiId?: string;
  gpayQrCode?: string;

  phonepeUpiId?: string;
  phonepeQrCode?: string;

  icashUpiId?: string;
  icashQrCode?: string;

  gatepayUpiId?: string;
  gatepayQrCode?: string;

  // Crypto addresses (no QR codes)
  binanceAddress?: string;
  tonkeeperAddress?: string;
  otherCryptoAddress?: string;
  logoUrl?: string;
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
  address?: string;
  paymentApp?: string;
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
}

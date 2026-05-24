// Common
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

// Auth
export type UserRole = 'USER' | 'ADMIN'
export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  createdAt: string
  lastLoginAt?: string
}
export interface AuthResponse {
  token: string
  user: User
}
export interface LoginRequest {
  email: string
  password: string
}
export interface SignupRequest {
  email: string
  password: string
  name: string
}
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

// Transaction
export type TransactionType = 'INCOME' | 'EXPENSE'
export interface Transaction {
  id: number
  amount: number
  type: TransactionType
  categoryId: number
  categoryName: string
  paymentMethodId?: number
  paymentMethodName?: string
  paymentMethodType?: PaymentMethodType
  description?: string
  transactionDate: string
  createdAt: string
}
export interface TransactionCreateRequest {
  amount: number
  type: TransactionType
  categoryId: number
  paymentMethodId?: number
  description?: string
  transactionDate: string
}

// Category
export interface Category {
  id: number
  name: string
  type: TransactionType
  isDefault: boolean
}

// Budget
export interface BudgetResponse {
  id: number
  categoryId: number
  categoryName: string
  year: number
  month: number
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  usageRatio: number
}

// Statistics
export interface CategoryStatistics {
  categoryId: number
  categoryName: string
  amount: number
  ratio: number
}
export interface MonthlyStatisticsResponse {
  year: number
  month: number
  totalIncome: number
  totalExpense: number
  netSaving: number
  incomeByCategory: CategoryStatistics[]
  expenseByCategory: CategoryStatistics[]
}
export interface AnnualStatisticsResponse {
  year: number
  totalIncome: number
  totalExpense: number
  netSaving: number
  monthly: { month: number; income: number; expense: number; net: number }[]
}
export interface CategoryTrendResponse {
  categoryId: number
  categoryName: string
  trend: { year: number; month: number; amount: number }[]
}

// Investment
export type TradeType = 'BUY' | 'SELL'
export interface StockTransaction {
  id: number
  ticker: string
  stockName: string
  type: TradeType
  quantity: number
  price: number
  fee: number
  tradedAt: string
  memo?: string
}
export interface PortfolioResponse {
  ticker: string
  stockName: string
  holdingQuantity: number
  avgPurchasePrice: number
  totalInvestment: number
  realizedPnl: number
  realizedPnlRate: number
}
export interface StockQuoteResponse {
  ticker: string
  stockName: string
  currentPrice: number
  change: number
  changePercent: number
  highPrice: number
  lowPrice: number
  openPrice: number
  previousClose: number
}

// Asset
export interface StockAssetSummary {
  ticker: string
  stockName: string
  holdingQuantity: number
  avgPurchasePrice: number
  totalInvestment: number
}
export interface AssetSummaryResponse {
  totalIncome: number
  totalExpense: number
  cashBalance: number
  stockInvestment: number
  realizedStockPnl: number
  grossAssets: number
  totalDebt: number
  netAssets: number
  stockPortfolio: StockAssetSummary[]
  loans: LoanResponse[]
}

// Loan
export interface LoanResponse {
  id: number
  name: string
  lender?: string
  principal: number
  remainingBalance: number
  interestRate?: number
  startDate: string
  endDate?: string
  includeInAssets: boolean
  memo?: string
  createdAt: string
  updatedAt: string
}

// Payment Method
export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'BANK_TRANSFER' | 'OTHER'
export interface PaymentMethod {
  id: number
  name: string
  type: PaymentMethodType
  createdAt: string
}
export interface PaymentMethodStats {
  paymentMethodId: number
  paymentMethodName: string
  paymentMethodType: PaymentMethodType
  totalAmount: number
  categories: { categoryId: number; categoryName: string; amount: number }[]
}

// Recurring Transaction
export interface RecurringTransaction {
  id: number
  name: string
  type: TransactionType
  categoryId: number
  categoryName: string
  paymentMethodId?: number
  paymentMethodName?: string
  amount: number
  description?: string
  dayOfMonth: number
  startDate: string
  endDate?: string
  isActive: boolean
}

// Savings Goal
export interface SavingsGoal {
  id: number
  name: string
  targetAmount: number
  savedAmount: number
  remainingAmount: number
  progressRate: number
  targetDate: string
  memo?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

// Net Worth Snapshot
export interface NetWorthSnapshot {
  id: number
  snapshotDate: string
  cashBalance: number
  stockInvestment: number
  realizedStockPnl: number
  grossAssets: number
  totalDebt: number
  netAssets: number
  memo?: string
  createdAt: string
}

// Trading Journal
export interface TradingJournal {
  id: number
  ticker: string
  stockName: string
  tradeType: TradeType
  tradeDate: string
  quantity: number
  price: number
  totalAmount: number
  reason: string
  strategy?: string
  reflection?: string
  createdAt: string
  updatedAt: string
}

import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Target,
  CreditCard,
  RefreshCw,
  PiggyBank,
  TrendingUp,
  BookOpen,
  Landmark,
  Wallet,
  Tag,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/transactions', icon: ArrowLeftRight, label: '거래 관리' },
  { to: '/statistics', icon: BarChart3, label: '통계' },
  { to: '/budget', icon: Target, label: '예산 관리' },
  { to: '/payment-methods', icon: CreditCard, label: '결제 수단' },
  { to: '/recurring', icon: RefreshCw, label: '정기 거래' },
  { to: '/savings', icon: PiggyBank, label: '저축 목표' },
  { to: '/investment', icon: TrendingUp, label: '투자' },
  { to: '/journal', icon: BookOpen, label: '매매 일지' },
  { to: '/loans', icon: Landmark, label: '대출' },
  { to: '/net-worth', icon: Wallet, label: '자산 현황' },
  { to: '/categories', icon: Tag, label: '카테고리' },
]

const Sidebar: React.FC = () => {
  return (
    <div className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 bottom-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-blue-600">YoonCount Book</h1>
        <p className="text-xs text-gray-400 mt-0.5">개인 가계부</p>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar

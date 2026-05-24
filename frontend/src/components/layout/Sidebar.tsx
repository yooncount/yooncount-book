import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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
  Settings,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

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
  { to: '/settings', icon: Settings, label: '설정' },
]

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    logout()
    navigate('/login', { replace: true })
  }

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

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Shield size={16} />
            관리자
          </NavLink>
        )}
      </nav>

      {user && (
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `mx-2 mb-3 mt-2 rounded-xl border border-gray-100 p-3 flex items-center gap-3 transition-colors group ${
              isActive ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'
            }`
          }
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-blue-600">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              {isAdmin && <Shield size={11} className="text-purple-600 shrink-0" />}
            </div>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="로그아웃"
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
          >
            <LogOut size={14} />
          </button>
          <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 shrink-0 -ml-1" />
        </NavLink>
      )}
    </div>
  )
}

export default Sidebar

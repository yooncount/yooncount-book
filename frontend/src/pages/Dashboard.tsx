import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import dayjs from 'dayjs'
import { getAssetSummary } from '../api/assets'
import { getMonthlyStatistics } from '../api/statistics'
import { getTransactions } from '../api/transactions'
import { getSavingsGoals } from '../api/savings'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'
import { formatAmount, formatDate, formatPercent } from '../utils/format'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

const now = dayjs()
const currentYear = now.year()
const currentMonth = now.month() + 1

const Dashboard: React.FC = () => {
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets-summary'],
    queryFn: getAssetSummary,
  })

  const { data: monthlyStats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics-monthly', currentYear, currentMonth],
    queryFn: () => getMonthlyStatistics(currentYear, currentMonth),
  })

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', currentYear, currentMonth],
    queryFn: () => getTransactions({ year: currentYear, month: currentMonth }),
  })

  const { data: savingsGoals, isLoading: savingsLoading } = useQuery({
    queryKey: ['savings-goals'],
    queryFn: getSavingsGoals,
  })

  const isLoading = assetsLoading || statsLoading || txLoading || savingsLoading

  if (isLoading) return <LoadingSpinner />

  const recentTx = (transactions ?? []).slice(-5).reverse()
  const expenseByCategory = monthlyStats?.expenseByCategory ?? []
  const pieData = expenseByCategory.filter((c) => c.amount > 0).map((c) => ({
    name: c.categoryName,
    value: c.amount,
  }))

  const activeGoals = (savingsGoals ?? []).filter((g) => !g.isCompleted).slice(0, 5)

  const statCards = [
    {
      label: '총 자산 (Gross)',
      value: formatAmount(assets?.grossAssets ?? 0),
      icon: Wallet,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '순 자산',
      value: formatAmount(assets?.netAssets ?? 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: '이달 수입',
      value: formatAmount(monthlyStats?.totalIncome ?? 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: '이달 지출',
      value: formatAmount(monthlyStats?.totalExpense ?? 0),
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="text-sm text-gray-500 mt-1">
          {now.format('YYYY년 MM월')} 현황
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon size={18} className={color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Expense Pie Chart */}
        <Card title={`${now.format('MM월')} 지출 카테고리`} className="col-span-1">
          {pieData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">지출 내역이 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatAmount(val)} />
                <Legend formatter={(val) => <span className="text-xs">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card title="최근 거래" className="col-span-2">
          {recentTx.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">이달 거래가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {recentTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'}>
                      {tx.type === 'INCOME' ? '수입' : '지출'}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {tx.description || tx.categoryName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(tx.transactionDate)} · {tx.categoryName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}
                    {formatAmount(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Savings Goals */}
      <Card title="저축 목표 진행 현황">
        {activeGoals.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">진행 중인 저축 목표가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">{goal.name}</span>
                  <span className="text-xs text-gray-400">{formatPercent(goal.progressRate)}</span>
                </div>
                <ProgressBar value={goal.progressRate} className="mb-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatAmount(goal.savedAmount)} / {formatAmount(goal.targetAmount)}</span>
                  <span className="flex items-center gap-1">
                    <PiggyBank size={11} />
                    {formatDate(goal.targetDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default Dashboard

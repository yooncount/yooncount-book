import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import dayjs from 'dayjs'
import { getMonthlyStatistics, getAnnualStatistics, getCategoryTrend } from '../api/statistics'
import { getCategories } from '../api/categories'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatAmount, formatPercent } from '../utils/format'

const now = dayjs()
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

const Statistics: React.FC = () => {
  const [tab, setTab] = useState<'monthly' | 'annual' | 'trend'>('monthly')
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)
  const [trendCategoryId, setTrendCategoryId] = useState<number | null>(null)
  const [trendMonths, setTrendMonths] = useState(6)

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.year() - 2 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery({
    queryKey: ['statistics-monthly', year, month],
    queryFn: () => getMonthlyStatistics(year, month),
    enabled: tab === 'monthly',
  })

  const { data: annualStats, isLoading: annualLoading } = useQuery({
    queryKey: ['statistics-annual', year],
    queryFn: () => getAnnualStatistics(year),
    enabled: tab === 'annual',
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['statistics-trend', trendCategoryId, trendMonths],
    queryFn: () => getCategoryTrend(trendCategoryId!, trendMonths),
    enabled: tab === 'trend' && trendCategoryId !== null,
  })

  const tabs = [
    { key: 'monthly', label: '월별' },
    { key: 'annual', label: '연간' },
    { key: 'trend', label: '카테고리 추이' },
  ] as const

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">통계</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Monthly Tab */}
      {tab === 'monthly' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>

          {monthlyLoading ? <LoadingSpinner /> : (
            <>
              {/* Summary Row */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="!p-4">
                  <p className="text-xs text-gray-500">총 수입</p>
                  <p className="text-xl font-bold text-green-600">{formatAmount(monthlyStats?.totalIncome ?? 0)}</p>
                </Card>
                <Card className="!p-4">
                  <p className="text-xs text-gray-500">총 지출</p>
                  <p className="text-xl font-bold text-red-500">{formatAmount(monthlyStats?.totalExpense ?? 0)}</p>
                </Card>
                <Card className="!p-4">
                  <p className="text-xs text-gray-500">순 저축</p>
                  <p className={`text-xl font-bold ${(monthlyStats?.netSaving ?? 0) >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {formatAmount(monthlyStats?.netSaving ?? 0)}
                  </p>
                </Card>
              </div>

              {/* Income Bar */}
              <Card title="수입/지출 비교">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={[
                      { name: '수입', value: monthlyStats?.totalIncome ?? 0, fill: '#10b981' },
                      { name: '지출', value: monthlyStats?.totalExpense ?? 0, fill: '#ef4444' },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₩${(v / 10000).toFixed(0)}만`} />
                    <Tooltip formatter={(v: number) => formatAmount(v)} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {[
                        { name: '수입', value: monthlyStats?.totalIncome ?? 0, fill: '#10b981' },
                        { name: '지출', value: monthlyStats?.totalExpense ?? 0, fill: '#ef4444' },
                      ].map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Pie Charts */}
              <div className="grid grid-cols-2 gap-6">
                <Card title="수입 카테고리 분포">
                  {(monthlyStats?.incomeByCategory ?? []).length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-12">수입 내역이 없습니다.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={monthlyStats?.incomeByCategory?.filter(c => c.amount > 0).map(c => ({ name: c.categoryName, value: c.amount }))}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={90}
                          dataKey="value"
                        >
                          {(monthlyStats?.incomeByCategory ?? []).map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatAmount(v)} />
                        <Legend formatter={(val) => <span className="text-xs">{val}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card>

                <Card title="지출 카테고리 분포">
                  {(monthlyStats?.expenseByCategory ?? []).length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-12">지출 내역이 없습니다.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={monthlyStats?.expenseByCategory?.filter(c => c.amount > 0).map(c => ({ name: c.categoryName, value: c.amount }))}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={90}
                          dataKey="value"
                        >
                          {(monthlyStats?.expenseByCategory ?? []).map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatAmount(v)} />
                        <Legend formatter={(val) => <span className="text-xs">{val}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* Annual Tab */}
      {tab === 'annual' && (
        <div className="space-y-6">
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>

          {annualLoading ? <LoadingSpinner /> : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Card className="!p-4">
                  <p className="text-xs text-gray-500">연간 수입</p>
                  <p className="text-xl font-bold text-green-600">{formatAmount(annualStats?.totalIncome ?? 0)}</p>
                </Card>
                <Card className="!p-4">
                  <p className="text-xs text-gray-500">연간 지출</p>
                  <p className="text-xl font-bold text-red-500">{formatAmount(annualStats?.totalExpense ?? 0)}</p>
                </Card>
                <Card className="!p-4">
                  <p className="text-xs text-gray-500">순 저축</p>
                  <p className={`text-xl font-bold ${(annualStats?.netSaving ?? 0) >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    {formatAmount(annualStats?.netSaving ?? 0)}
                  </p>
                </Card>
              </div>

              <Card title="월별 수입/지출 (누적 막대)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(annualStats?.monthly ?? []).map(m => ({
                    name: `${m.month}월`,
                    수입: m.income,
                    지출: m.expense,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₩${(v / 10000).toFixed(0)}만`} />
                    <Tooltip formatter={(v: number) => formatAmount(v)} />
                    <Legend />
                    <Bar dataKey="수입" fill="#10b981" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="지출" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="월별 상세">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-3 font-medium">월</th>
                        <th className="pb-3 font-medium text-right">수입</th>
                        <th className="pb-3 font-medium text-right">지출</th>
                        <th className="pb-3 font-medium text-right">순 저축</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(annualStats?.monthly ?? []).map((m) => (
                        <tr key={m.month} className="border-b border-gray-50">
                          <td className="py-2.5 text-gray-700">{m.month}월</td>
                          <td className="py-2.5 text-right text-green-600">{formatAmount(m.income)}</td>
                          <td className="py-2.5 text-right text-red-500">{formatAmount(m.expense)}</td>
                          <td className={`py-2.5 text-right font-medium ${m.net >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                            {formatAmount(m.net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Trend Tab */}
      {tab === 'trend' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={trendCategoryId ?? ''}
              onChange={(e) => setTrendCategoryId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">카테고리 선택</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={trendMonths}
              onChange={(e) => setTrendMonths(Number(e.target.value))}
            >
              <option value={3}>최근 3개월</option>
              <option value={6}>최근 6개월</option>
              <option value={12}>최근 12개월</option>
            </select>
          </div>

          {!trendCategoryId ? (
            <p className="text-center text-gray-400 py-16">카테고리를 선택하세요.</p>
          ) : trendLoading ? (
            <LoadingSpinner />
          ) : (
            <Card title={`${trendData?.categoryName ?? ''} 추이`}>
              {(trendData?.trend ?? []).length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-12">데이터가 없습니다.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={(trendData?.trend ?? []).map((t) => ({
                      name: `${t.year}.${String(t.month).padStart(2, '0')}`,
                      금액: t.amount,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₩${(v / 10000).toFixed(0)}만`} />
                    <Tooltip formatter={(v: number) => formatAmount(v)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="금액"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default Statistics

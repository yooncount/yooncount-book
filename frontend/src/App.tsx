import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Statistics from './pages/Statistics'
import Budget from './pages/Budget'
import Categories from './pages/Categories'
import PaymentMethods from './pages/PaymentMethods'
import Recurring from './pages/Recurring'
import SavingsGoals from './pages/SavingsGoals'
import Investment from './pages/Investment'
import TradingJournal from './pages/TradingJournal'
import Loans from './pages/Loans'
import NetWorth from './pages/NetWorth'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="budget" element={<Budget />} />
          <Route path="categories" element={<Categories />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="recurring" element={<Recurring />} />
          <Route path="savings" element={<SavingsGoals />} />
          <Route path="investment" element={<Investment />} />
          <Route path="journal" element={<TradingJournal />} />
          <Route path="loans" element={<Loans />} />
          <Route path="net-worth" element={<NetWorth />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

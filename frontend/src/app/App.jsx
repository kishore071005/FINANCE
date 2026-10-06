import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import OverviewPage from '../features/overview/OverviewPage.jsx'
import RevenuePage from '../features/revenue/RevenuePage.jsx'
import ExpensesPage from '../features/expenses/ExpensesPage.jsx'
import SalariesPage from '../features/salaries/SalariesPage.jsx'
import SubscriptionsPage from '../features/subscriptions/SubscriptionsPage.jsx'
import DomainsPage from '../features/domains/DomainsPage.jsx'
import VendorsPage from '../features/vendors/VendorsPage.jsx'
import BudgetsPage from '../features/budgets/BudgetsPage.jsx'
import ReportsPage from '../features/reports/ReportsPage.jsx'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Finance Dashboard</h1>
        </header>
        <nav className="app-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/overview">Overview</NavLink>
          <NavLink to="/revenue">Revenue</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          <NavLink to="/salaries">Salaries</NavLink>
          <NavLink to="/subscriptions">Subscriptions</NavLink>
          <NavLink to="/domains">Domains</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
          <NavLink to="/budgets">Budgets</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </nav>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/revenue" element={<RevenuePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/salaries" element={<SalariesPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/domains" element={<DomainsPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>Finance Dashboard - Foundation Setup</p>
        </footer>
      </div>
    </Router>
  )
}

function Placeholder({ title }) {
  return (
    <div className="home-page">
      <h2>{title}</h2>
      <p>{title} module - Foundation setup completed</p>
      <div className="empty">No data available yet</div>
    </div>
  )
}

export default App
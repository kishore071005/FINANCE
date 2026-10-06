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
          <div className="brand">
            <img src="/harvik-logo.jpeg" alt="HARVIK — Finance Dashboard" className="brand-logo" />
            <div className="brand-text">
              <h1>Finance Dashboard</h1>
              <p>Track &bull; Analyze &bull; Elevate</p>
            </div>
          </div>
          <div className="header-actions">
            <span className="brand-badge">
              <span className="pulse-dot" />
              Live &bull; All systems go
            </span>
            <NavLink to="/overview" className="btn-primary">View Overview</NavLink>
          </div>
        </header>
        <nav className="app-nav">
          <div className="app-nav-inner">
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
          </div>
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
          <p><strong>Finance Dashboard</strong> &mdash; Track &bull; Analyze &bull; Elevate &nbsp;|&nbsp; Revenue, Expenses, Salaries, Budgets, Reports</p>
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
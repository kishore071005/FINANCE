import Loading from '../components/common/Loading.jsx'
import Empty from '../components/common/Empty.jsx'
import Error from '../components/common/Error.jsx'

function Home() {
  return (
    <div className="home-page">
      <h2>Welcome to Finance Dashboard</h2>
      <p>Phase 0 - Foundation Setup Complete</p>
      <div style={{ marginTop: '2rem' }}>
        <Loading message="Loading dashboard..." />
        <Empty message="No recent activity to display" />
        <Error message="An example error state" />
      </div>
    </div>
  )
}

export default Home
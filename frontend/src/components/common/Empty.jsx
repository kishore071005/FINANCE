function Empty({ message = 'No data available' }) {
  return (
    <div className="empty">
      <p>{message}</p>
    </div>
  )
}

export default Empty
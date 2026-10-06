function Error({ message = 'An error occurred' }) {
  return (
    <div className="error">
      <p>{message}</p>
    </div>
  )
}

export default Error
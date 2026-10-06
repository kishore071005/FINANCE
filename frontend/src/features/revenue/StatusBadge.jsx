const STATUS_CLASS = {
  'Pending': 'status-pending',
  'Partially Paid': 'status-partial',
  'Paid': 'status-paid',
  'Overdue': 'status-overdue'
};

function StatusBadge({ status }) {
  const className = STATUS_CLASS[status] || 'status-unknown';
  return <span className={`status-badge ${className}`}>{status}</span>;
}

export default StatusBadge;

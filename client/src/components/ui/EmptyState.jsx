import { Search } from 'lucide-react';

function EmptyState({ icon: Icon = Search, title = 'Nothing here', message = '', action = null, actionLabel = '', onAction = null }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={64} strokeWidth={1.5} color="var(--gray-400)" />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
import React, { useState } from 'react';
import { Theme } from '../../../types/theme';
import { Plus, Edit2, Save, X, Clock } from 'lucide-react';
import { NotificationDuration, DURATION_OPTIONS } from '../../../types/security';
import { generateHiddenId } from '../../../utils/generateHiddenId';

interface ErrorNotificationsProps {
  currentTheme: Theme;
}

const ErrorNotifications: React.FC<ErrorNotificationsProps> = ({ currentTheme }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    duration: 'timed' as NotificationDuration,
    timeout: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const notification = {
      id: `err-${notifications.length + 1}`,
      hidden_id: generateHiddenId(),
      type: 'error',
      ...formValues
    };
    setNotifications([...notifications, notification]);
    setShowForm(false);
    setFormValues({
      name: '',
      description: '',
      duration: 'timed',
      timeout: 5
    });
  };

  return (
    <div className="p-6">
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6"
        style={{ 
          backgroundColor: '#ef4444', // Red color for errors
          color: 'white'
        }}
      >
        <Plus size={16} />
        Add Error Notification
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-6 text-primary">
              {editingId ? 'Edit Error Notification' : 'New Error Notification'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Description
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Duration Mode
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formValues.duration}
                  onChange={(e) => setFormValues({ 
                    ...formValues, 
                    duration: e.target.value as NotificationDuration
                  })}
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  {DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {formValues.duration === 'timed' && (
                <div>
                  <label className="block text-sm mb-1 text-secondary">
                    Timeout (seconds)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    value={formValues.timeout}
                    onChange={(e) => setFormValues({ ...formValues, timeout: parseInt(e.target.value) })}
                    className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                    min={1}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormValues({
                      name: '',
                      description: '',
                      duration: 'timed',
                      timeout: 5
                    });
                  }}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm text-white"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  {editingId ? 'Save Changes' : 'Create Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="p-4 rounded-lg border transition-all text-primary border-theme bg-surface"
            style={{ borderColor: '#ef4444' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{notification.name}</span>
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#ef444420' }}>
                  {notification.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingId(notification.id);
                    setFormValues({
                      name: notification.name,
                      description: notification.description,
                      duration: notification.duration,
                      timeout: notification.timeout || 5
                    });
                    setShowForm(true);
                  }}
                  className="p-1 rounded hover:bg-opacity-80 text-secondary"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setNotifications(notifications.filter(n => n.id !== notification.id))}
                  className="p-1 rounded hover:bg-opacity-80 text-secondary"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-secondary mb-2">
              {notification.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-secondary">
              <Clock size={12} />
              <span>
                {notification.duration === 'timed' 
                  ? `Auto-dismiss after ${notification.timeout}s`
                  : notification.duration === 'acknowledge'
                  ? 'Requires acknowledgment'
                  : 'Persistent until dismissed'
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorNotifications;
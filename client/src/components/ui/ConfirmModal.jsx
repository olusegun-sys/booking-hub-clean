import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

function ConfirmModal({ isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, isDanger = true, loading = false }) {
  if (!isOpen) return null;

  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    },
    onClick: function(e) {
      if (e.target === e.currentTarget) onCancel();
    }
  },
    React.createElement('div', {
      style: {
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '450px',
        width: '100%',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.2s ease',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }
    },
      React.createElement('div', {
        style: {
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDanger ? '#fef2f2' : '#f8fafc'
        }
      },
        React.createElement('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        },
          React.createElement('div', {
            style: {
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isDanger ? '#fee2e2' : '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          },
            React.createElement(AlertTriangle, {
              size: 18,
              color: isDanger ? '#dc2626' : '#4f46e5'
            })
          ),
          React.createElement('h3', {
            style: {
              fontSize: '18px',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0
            }
          }, title || (isDanger ? 'Delete Item' : 'Confirm Action'))
        ),
        React.createElement('button', {
          onClick: onCancel,
          style: {
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8'
          },
          onMouseEnter: function(e) { e.currentTarget.style.backgroundColor = '#f1f5f9'; },
          onMouseLeave: function(e) { e.currentTarget.style.backgroundColor = 'transparent'; }
        }, React.createElement(X, { size: 16 }))
      ),
      React.createElement('div', {
        style: {
          padding: '24px'
        }
      },
        React.createElement('p', {
          style: {
            fontSize: '14px',
            color: '#334155',
            lineHeight: '1.6',
            margin: 0,
            whiteSpace: 'pre-line'
          }
        }, message)
      ),
      React.createElement('div', {
        style: {
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: '#f8fafc'
        }
      },
        React.createElement('button', {
          onClick: onCancel,
          disabled: loading,
          style: {
            padding: '8px 20px',
            backgroundColor: 'white',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }
        }, cancelLabel || 'Cancel'),
        React.createElement('button', {
          onClick: onConfirm,
          disabled: loading,
          style: {
            padding: '8px 20px',
            backgroundColor: isDanger ? '#dc2626' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1
          }
        },
          loading ? React.createElement('span', { style: { width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' } }) : null,
          confirmLabel || (isDanger ? 'Delete' : 'Confirm')
        )
      )
    )
  );
}

export default ConfirmModal;

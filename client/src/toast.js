import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#065f46',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 20px',
      borderRadius: '12px',
    },
  });
};

export const showError = (message) => {
  toast.error(message || 'Something went wrong. Please try again.', {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#991b1b',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 20px',
      borderRadius: '12px',
    },
  });
};
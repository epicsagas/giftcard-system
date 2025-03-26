/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'primary': {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.btn': {
          padding: '.5rem 1rem',
          borderRadius: '.375rem',
          fontWeight: '600',
          display: 'inline-block',
          transition: 'all 150ms ease',
          cursor: 'pointer',
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.5)',
          },
          '&:disabled': {
            opacity: '0.65',
            pointerEvents: 'none',
          },
        },
        '.btn-primary': {
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#4338ca',
          },
        },
        '.btn-secondary': {
          backgroundColor: '#f3f4f6',
          color: '#1f2937',
          '&:hover': {
            backgroundColor: '#e5e7eb',
          },
        },
        '.card': {
          backgroundColor: '#ffffff',
          borderRadius: '.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        },
        '.form-label': {
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '500',
          color: '#374151',
        },
        '.form-input': {
          display: 'block',
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '1rem',
          lineHeight: '1.5',
          color: '#374151',
          backgroundColor: '#ffffff',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db',
          transition: 'border-color 150ms ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: '#6366f1',
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
          },
        },
        '.form-error': {
          marginTop: '0.25rem',
          fontSize: '0.875rem',
          color: '#ef4444',
        },
        '.gift-card': {
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
        '.gift-card-header': {
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        '.gift-card-body': {
          padding: '1rem',
        },
        '.gift-card-footer': {
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        '.gift-card-label': {
          fontSize: '0.75rem',
          fontWeight: '500',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
        },
        '.gift-card-amount': {
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#374151',
        },
        '.gift-card-qr': {
          width: '200px',
          height: '200px',
          margin: '0 auto',
          padding: '0.5rem',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          },
        },
      })
    },
  ],
}
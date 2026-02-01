module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          primary: '#FFFFFF',    // Pure White
          secondary: '#E5E5E5',   // Light Gray
          dark: '#000000',        // Pure Black
          darker: '#0a0a0a',      // Near Black
          accent: '#B8B8B8',      // Medium Gray
          purple: '#FFFFFF',      // White (Player X)
          ghost: '#F5F5F5'        // Very Light Gray
        }
      },
      fontFamily: {
        'cyber': ['"Space Mono"', '"Roboto Mono"', 'monospace']
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)',
        'neon-pink': '0 0 20px rgba(229, 229, 229, 0.3)',
        'neon-purple': '0 0 20px rgba(255, 255, 255, 0.3)',
        'neon-green': '0 0 20px rgba(229, 229, 229, 0.3)',
        'glass': '0 8px 32px 0 rgba(255, 255, 255, 0.1)'
      },
      backdropBlur: {
        'glass': '16px'
      }
    },
  },
  plugins: [],
}

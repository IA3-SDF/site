module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        app: 'var(--bg-app)',
        card: 'var(--bg-card)',
        surface: 'var(--bg-secondary)',
        textMain: 'var(--text-main)',
        textBody: 'var(--text-body)',
        muted: 'var(--text-muted)',
        borderSubtle: 'var(--border-subtle)'
      }
    },
  },
  plugins: [],
}

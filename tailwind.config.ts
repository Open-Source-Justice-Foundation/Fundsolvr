import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
export default config

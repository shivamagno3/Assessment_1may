// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,jsx}'],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ['Syne', 'system-ui', 'sans-serif'],
//         mono: ['JetBrains Mono', 'monospace'],
//       },
//       colors: {
//         ink: {
//           50: '#f5f5f0',
//           100: '#e8e8e0',
//           200: '#d0d0c4',
//           300: '#ababab',
//           400: '#878787',
//           500: '#636363',
//           600: '#4a4a4a',
//           700: '#333333',
//           800: '#1f1f1f',
//           900: '#0f0f0f',
//           950: '#080808',
//         },
//         acid: {
//           DEFAULT: '#c8ff00',
//           dark: '#9ec800',
//         },
//         ember: {
//           DEFAULT: '#ff4d1c',
//           dark: '#cc3e16',
//         },
//         sky: {
//           DEFAULT: '#00c8ff',
//           dark: '#009ec8',
//         }
//       },
//       animation: {
//         'slide-in': 'slideIn 0.3s ease-out',
//         'fade-in': 'fadeIn 0.4s ease-out',
//         'pop': 'pop 0.2s ease-out',
//       },
//       keyframes: {
//         slideIn: {
//           '0%': { transform: 'translateX(-16px)', opacity: '0' },
//           '100%': { transform: 'translateX(0)', opacity: '1' },
//         },
//         fadeIn: {
//           '0%': { opacity: '0', transform: 'translateY(8px)' },
//           '100%': { opacity: '1', transform: 'translateY(0)' },
//         },
//         pop: {
//           '0%': { transform: 'scale(0.95)' },
//           '100%': { transform: 'scale(1)' },
//         }
//       }
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // ✅ added ts/tsx support
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      colors: {
        ink: {
          50: '#f5f5f0',
          100: '#e8e8e0',
          200: '#d0d0c4',
          300: '#ababab',
          400: '#878787',
          500: '#636363',
          600: '#4a4a4a',
          700: '#333333',
          800: '#1f1f1f',
          900: '#0f0f0f',
          950: '#080808',
        },

        acid: {
          DEFAULT: '#c8ff00',
          dark: '#9ec800',
        },

        ember: {
          DEFAULT: '#ff4d1c',
          dark: '#cc3e16',
        },

        sky: {
          DEFAULT: '#00c8ff',
          dark: '#009ec8',
        }
      },

      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pop': 'pop 0.2s ease-out',
      },

      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },

        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        pop: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },

  plugins: [],
};
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    react(),
    checker({ typescript: false }) // Disable TypeScript type-checking
  ]
<<<<<<< HEAD
})
=======
})
>>>>>>> b29e959e4d0250b525df9c052c553bea413bb994

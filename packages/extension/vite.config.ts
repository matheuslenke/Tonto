import { resolve } from 'path'
import { defineConfig, type UserConfig } from 'vite'

const isMinify = process.env.VITE_MINIFY === 'true'
const buildTarget = process.env.VITE_BUILD_TARGET || 'node'

// Base configuration shared between both builds
const baseConfig = {
  sourcemap: !isMinify,
  minify: isMinify,
  target: 'es6'
}

// Node.js extension build configuration
const nodeConfig: UserConfig = {
  build: {
    lib: {
      entry: {
        'extension/main': resolve(__dirname, 'src/extension/main.ts'),
        'language/main': resolve(__dirname, 'src/language/main.ts')
      },
      formats: ['cjs']
    },
    outDir: 'pack',
    ...baseConfig,
    rollupOptions: {
      external: ['vscode', 'ontouml-js'],
      output: {
        entryFileNames: '[name].js',
        format: 'cjs'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
}

// Browser webview build configuration
const browserConfig: UserConfig = {
  build: {
    lib: {
      entry: resolve(__dirname, '../webview/src/main.ts'),
      formats: ['es']
    },
    outDir: 'pack/diagram',
    ...baseConfig,
    rollupOptions: {
      external: ['ontouml-js'],
      output: {
        entryFileNames: 'main.js',
        format: 'es'
      }
    }
  },
  css: {
    modules: false
  }
}

// Export the appropriate configuration based on environment variable
export default defineConfig(() => {
  if (buildTarget === 'browser') {
    return browserConfig
  }
  
  return nodeConfig
})
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: [
      'vuetify'
    ]
  },
  modules: [
    'nuxt-graphql-client',
    '@nuxt/eslint',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    //...
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  runtimeConfig: {
    public: {
      // GQL_HOST: 'http://localhost:8082/graphql'
    }
  },

  'graphql-client': {
    clients: {
        default: {
            host: 'http://nginx:80/graphql',
            clientHost: 'http://localhost:8082/graphql',
        }
    }
}
})
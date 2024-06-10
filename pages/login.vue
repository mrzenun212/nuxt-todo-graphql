<template>
  <div>
    <v-card
      class="mx-auto pa-12 pb-8 mt-12"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <div class="text-subtitle-1 text-medium-emphasis">Account</div>

      <v-text-field
        v-model="credentials.email"
        density="compact"
        placeholder="Email address"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Password

        
      </div>

      <v-text-field
        v-model="credentials.password"
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="compact"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visible = !visible"
      ></v-text-field>

      <v-btn
        @click="handleLogin"
        class="mb-8"
        color="blue"
        size="large"
        variant="tonal"
        block
      >
        Log In
      </v-btn>

      <!-- <v-card-text class="text-center">
        <a
          class="text-blue text-decoration-none"
          href="#"
          rel="noopener noreferrer"
          target="_blank"
        >
          Sign up now <v-icon icon="mdi-chevron-right"></v-icon>
        </a>
      </v-card-text> -->
    </v-card>
  </div>
</template>

<script>
definePageMeta({
  middleware: ['guest'],
})
const { setUser, setUserToken } = useAuth()

export default {
  data: () => ({
    visible: false,
    credentials: {
      email: null,
      password: null
    }
  }),

  methods: {
    async handleLogin() {
      try {
        const result = await GqlLogin(this.credentials)
        setUser(result.login.user.name)
        setUserToken(result.login.token)
        this.afterLogin(result.login.token)
        window.location.pathname = '/my-todo'
      } catch (error) {
        console.error(error)
      }
    },
    afterLogin(token) {
        console.log('token', token)
        useGqlToken(token)
        console.log('token', useGqlToken(token))
    }
  }
}
</script>
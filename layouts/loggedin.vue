<template>
  <div>
    <VApp>
      <VMain>
        <ClientOnly>
          <VAppBar app>
              <VToolbarTitle>My App</VToolbarTitle>
              <v-btn  @click="handleLogout" icon>
                  <v-icon>mdi-logout</v-icon>
              </v-btn>
          </VAppBar>
        </ClientOnly>
        <slot />
      </VMain>
    </VApp>
  </div>
</template>

<script>
const { removeUser, getUserToken } = useAuth()

export default {

  methods: {
    async handleLogout() {
      try {
        console.log('getUserToken', getUserToken)
        await useGqlToken(getUserToken)
        const result = await GqlLogout(this.credentials)
        removeUser()
        window.location.pathname = '/'
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
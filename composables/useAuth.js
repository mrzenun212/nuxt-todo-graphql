export function useAuth() {
  function setUser(name) {
    localStorage.setItem('user', JSON.stringify({ name }))
  }

  function setUserToken(token) {
    localStorage.setItem('user-token', JSON.stringify({ token }))
  }

  function getUser() {
    return JSON.parse(localStorage.getItem('user'))
  }

  function getUserToken() {
    return JSON.parse(localStorage.getItem('user-token'))
  }

  function removeUser() {
    localStorage.removeItem('user')
    localStorage.removeItem('user-token')
  }

  const isLoggedIn = computed(() => {
    if (process.client) {
      return !!localStorage.getItem('user')
    }
  })

  return { setUser, setUserToken, getUser, getUserToken, removeUser, isLoggedIn }
}
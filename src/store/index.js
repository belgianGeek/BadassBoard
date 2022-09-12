import { createStore } from 'vuex'

export default createStore({
  state: {
    connectedUser: {},
    date: new Date().toISOString().substr(0,10)
  },
  mutations: {
    RETRIEVE_USER_DATA(state, payload) {
      state.connectedUser = payload;
    }
  },
  actions: {
  },
  modules: {
  }
})

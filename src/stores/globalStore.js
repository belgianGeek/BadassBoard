import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    /* connectedUser: {},
    date: new Date().toISOString().substring(0, 10),*/
    invidiousInstances: [],
    YTsearchResults: []
  }),
  actions: {
    addInvidiousInstance(instance) {
      this.invidiousInstances.push(instance);
      console.log(instance);
    }
  }
});

/*getters: {
    getInvidiousInstances: (state) => {
      state.invidiousInstances;
    },
    getUserData: (state, payload) => {
      state.connectedUser = payload;
    },
    updateInvidiousInstances: (state, payload) => {
      state.invidiousInstances = payload;
    },
  },*/
import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    /* connectedUser: {},
    date: new Date().toISOString().substring(0, 10),*/
    audio: {
      author: '',
      isDisplayed: false,
      isPlaying: false,
      thumbnail: '',
      url: ''
    },
    invidiousInstances: [],
    search: {
      query: ''
    },
    YTsearchResults: [],
    wallpaper: '/wallpaper.jpg'
  }),
  actions: {
    addInvidiousInstance(instance) {
      this.invidiousInstances.push(instance);
      return ;
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

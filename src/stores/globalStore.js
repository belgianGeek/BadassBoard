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
    search: {
      query: ''
    },
    YTsearchResults: [],
    wallpaper: '/wallpaper.jpg'
  })
});

/*getters: {
    getUserData: (state, payload) => {
      state.connectedUser = payload;
    }
    }
  }*/

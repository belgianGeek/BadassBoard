import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    /* connectedUser: {},
    date: new Date().toISOString().substring(0, 10),*/
    audio: {
      author: '',
      currentStreamNb: 0,
      isDisplayed: false,
      isPlaying: false,
      streamType: '',
      thumbnail: '',
      totalStreamsNb: 0,
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

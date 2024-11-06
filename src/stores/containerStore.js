import { defineStore } from "pinia";
import axios from "axios";

export const useContainerStore = defineStore("container", {
  state: () => ({
    content: {
      length: 0,
      containers: []
    }
  }),
  actions: {
    getContent (index) {
      axios.get(
        `http://${window.location.hostname}:3000/api/content/get/${index}`
      ).then(response => {    
        if (response.data.success) {
          response.data.isModified = false;
    
          if (response.data.type === "rss") {
            response.data.inputValue = response.data.reference;
            response.data.containerPageNumber = 1;
          } else if (response.data.type === "weather") {
            response.data.inputValue = response.data.reference;
          }
    
          this.content.containers.push(response.data);
        } else {
          this.content.containers.push({
            type: 'error',
            msg: response.data.msg
          })
        }
      });
    },
    async getContentLength() {
      let response = await axios.get(
        `http://${window.location.hostname}:3000/api/content/length`
      );
    
      this.content.length = response.data;
    
      for (let i = 0; i < this.content.length; i++) {
        this.getContent(i);
      }
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

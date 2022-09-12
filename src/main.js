import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
// import './registerServiceWorker';
import router from './router';
import store from './store';

createApp(App).use(store).use(router).mount('#app');

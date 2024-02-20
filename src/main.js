import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
// import './registerServiceWorker';
import router from './router';
import { createPinia } from 'pinia';
const pinia = createPinia();

createApp(App).use(pinia).use(router).mount('#app');

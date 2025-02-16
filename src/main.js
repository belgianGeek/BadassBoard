import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
// import './registerServiceWorker';
import router from './router';

import { createHead } from '@unhead/vue';
const head = createHead();

import { createPinia } from 'pinia';
const pinia = createPinia();

createApp(App).use(pinia).use(head).use(router).mount('#app');

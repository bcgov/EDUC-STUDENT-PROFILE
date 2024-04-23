import { createApp } from 'vue';
import vuetify from './plugins/vuetify';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router).use(vuetify).mount('#app');

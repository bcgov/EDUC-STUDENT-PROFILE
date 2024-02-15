import { createApp } from 'vue';
import { createMetaManager } from 'vue-meta';
import vuetify from 'vuetify';
import moment from 'moment';
import App from './App';
import router from './router';
import { createPinia } from 'pinia';

const app = createApp(App);
const pinia = createPinia();

app.provide('$moment', moment);
app.use(router).use(createMetaManager()).use(pinia).use(vuetify);

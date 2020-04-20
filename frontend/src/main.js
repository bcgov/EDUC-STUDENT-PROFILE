import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import App from './App';
import router from './router';
import store from './store';
import IdleVue from 'idle-vue';
import StaticConfig from '@/common/staticConfig';

Vue.config.productionTip = false;
const eventsHub = new Vue();
Vue.use(IdleVue, {
  eventEmitter: eventsHub,
  store,
  idleTime: StaticConfig.VUE_APP_IDLE_TIMEOUT_IN_MILLIS, // 30 minutes
  startAtIdle: false
});
new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app');

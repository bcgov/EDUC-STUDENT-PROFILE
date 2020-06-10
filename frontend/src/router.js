import Vue from 'vue';
import VueRouter from 'vue-router';

import moment from 'moment';

import Home from '@/components/Home.vue';
import Logout from './components/Logout';
import SessionExpired from './components/SessionExpired';
import RequestPage from '@/components/RequestPage.vue';
import Verification from '@/components/Verification.vue';
import ErrorPage from '@/components/ErrorPage.vue';
import LoginError from '@/components/LoginError.vue';

Vue.prototype.moment = moment;

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/request',
      name: 'request',
      component: RequestPage
    },
    {
      path: '/verification/:status',
      name: 'verification',
      component: Verification
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorPage
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    },
    {
      path: '/session-expired',
      name: 'session-expired',
      component: SessionExpired
    },
    {
      path: '/login-error',
      name: 'login-error',
      component: LoginError
    },
    {
      path: '*',
      name: 'notfound',
      redirect: '/'
    }
  ]
});

export default router;

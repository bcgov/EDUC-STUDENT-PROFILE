import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';

import moment from 'moment';

import Home from '@/components/Home.vue';
import Logout from './components/Logout';
import SessionExpired from './components/SessionExpired';
//import PenRequestPage from '@/components/gmp/RequestPage.vue';
import StudentRequestPage from '@/components/ump/RequestPage.vue';
//import PenRequestVerification from '@/components/gmp/Verification.vue';
import StudentRequestVerification from '@/components/ump/Verification.vue';
import ErrorPage from '@/components/ErrorPage.vue';
import LoginError from '@/components/LoginError.vue';
import RouterView from '@/components/RouterView.vue';
import Ump from '@/components/ump/Ump.vue';
//import Gmp from '@/components/ump/Gmp.vue';

Vue.prototype.moment = moment;

Vue.use(VueRouter);
Vue.use(VueMeta);

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
      path: '/ump',
      component: RouterView,
      children: [
        {
          path: '',
          name: 'ump',
          component: Ump
        },
        {
          path: 'request',
          name: 'student-request',
          component: StudentRequestPage
        },
        {
          path: 'verification/:status',
          name: 'student-request-verification',
          component: StudentRequestVerification
        },
      ]
    },
    // {
    //   path: '/gmp',
    //   name: 'gmp',
    //   component: Gmp,
    //   children: [
    //     {
    //       path: 'request',
    //       name: 'pen-request',
    //       component: PenRequestPage
    //     },
    //     {
    //       path: 'verification/:status',
    //       name: 'pen-request-verification',
    //       component: PenRequestVerification
    //     },
    //   ]
    // },
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

import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';

import moment from 'moment';

import Home from '@/components/Home.vue';
import Logout from './components/Logout';
import SessionExpired from './components/SessionExpired';
import PenRequestPage from '@/components/gmp/RequestPage.vue';
import StudentRequestPage from '@/components/ump/RequestPage.vue';
import PenRequestVerification from '@/components/gmp/Verification.vue';
import StudentRequestVerification from '@/components/ump/Verification.vue';
import ErrorPage from '@/components/ErrorPage.vue';
import LoginError from '@/components/LoginError.vue';
import RouterView from '@/components/RouterView.vue';
import Ump from '@/components/ump/Ump.vue';
import Gmp from '@/components/gmp/Gmp.vue';
import CurrentInfo from './components/ump/CurrentInfo';
import RequestForm from './components/ump/RequestForm';
import RequestSummary from './components/ump/RequestSummary';
import RequestSubmission from './components/ump/RequestSubmission';
import authStore from './store/modules/auth';
import store from './store/index';
import {pick, values} from 'lodash';
import { PenRequestStatuses, StudentRequestStatuses } from '@/utils/constants';

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
          component: Ump,
          beforeEnter: (to, from, next) => {
            const hasInflightGMPRequest = !store.getters['penRequest/request'] && values(pick(PenRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV'])).some(status => status === store.getters['penRequest/request']);
            if(authStore.state.isAuthenticated && !store.getters['studentRequest/request'] && !hasInflightGMPRequest) {
              store.commit('setRequestType','studentRequest');
              next('ump/request');
            } else {
              next();
            }
          },
        },
        {
          path: 'request',
          component: StudentRequestPage,
          children: [
            {
              path: '',
              name: 'step1',
              component: CurrentInfo,
              beforeEnter: checkRequestExists
            },
            {
              path: 'requestForm',
              name: 'step2',
              component: RequestForm,
              beforeEnter: checkRequestExists
            },
            {
              path: 'requestSummary',
              name: 'step3',
              component: RequestSummary,
              beforeEnter: checkRequestExists
            },
            {
              path: 'requestSubmission',
              name: 'step4',
              component: RequestSubmission
            }
          ]
        },
        {
          path: 'verification/:status',
          name: 'student-request-verification',
          component: StudentRequestVerification
        },
      ]
    },
    {
      path: '/gmp',
      component: RouterView,
      children: [
        {
          path: '',
          name: 'gmp',
          component: Gmp
        },
        {
          path: 'request',
          name: 'pen-request',
          component: PenRequestPage
        },
        {
          path: 'verification/:status',
          name: 'pen-request-verification',
          component: PenRequestVerification
        },
      ]
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

function checkRequestExists(to, from, next) {
  if(authStore.state.isAuthenticated && (!store.getters['studentRequest/request'] || store.getters['studentRequest/request'].studentRequestStatusCode === StudentRequestStatuses.COMPLETED)) {
    store.commit('setRequestType','studentRequest');
    next();
  } else {
    next('/ump');
  }
}

export default router;

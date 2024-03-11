import { createRouter, createWebHistory } from 'vue-router';

import HomePage from './components/HomePage.vue';
import LogoutContainer from './components/LogoutContainer.vue';
import SessionExpired from './components/SessionExpired.vue';
import PenRequestPage from './components/gmp/RequestPage.vue';
import StudentRequestPage from './components/ump/RequestPage.vue';
import PenRequestVerification from './components/gmp/Verification.vue';
import StudentRequestVerification from './components/ump/Verification.vue';
import ErrorPage from './components/ErrorPage.vue';
import LoginError from './components/LoginError.vue';
import RouterView from './components/RouterView.vue';
import UmpContainer from './components/ump/UmpContainer.vue';
import GmpContainer from './components/gmp/GmpContainer.vue';
import CurrentInfo from './components/ump/CurrentInfo.vue';
import StudentRequestForm from './components/ump/RequestForm.vue';
import StudentRequestSummary from './components/ump/RequestSummary.vue';
import StudentRequestSubmission from './components/ump/RequestSubmission.vue';
import PenRequestForm from './components/gmp/RequestForm.vue';
import PenRequestSummary from './components/gmp/RequestSummary.vue';
import PenRequestSubmission from './components/gmp/RequestSubmission.vue';
import { pick, values } from 'lodash';
import { PenRequestStatuses, StudentRequestStatuses } from './utils/constants';
import LoginRedirect from './components/LoginRedirect.vue';
import BackendSessionExpired from './components/BackendSessionExpired.vue';
import { useAuthStore } from './store/auth';
import { useUmpStore } from './store/ump';
import { useGmpStore } from './store/gmp';
import { usePenRequestStore, useStudentRequestStore } from './store/request';
import { useRootStore } from './store/root';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: {
        requiresAuth: true
      },

    },
    {
      path: '/ump',
      component: RouterView,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'ump',
          component: UmpContainer,
          meta: {
            requiresAuth: true
          },
          beforeEnter: (_to, _from, next) => {
            const rootStore = useRootStore();
            const umpStore = useUmpStore();
            const penRequest = usePenRequestStore();
            const studentRequest = useStudentRequestStore();
            const authStore = useAuthStore();

            umpStore.$reset();
            const hasInflightGMPRequest = penRequest.request
              && values(pick(PenRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV']))
                .some(status => status === penRequest.request.penRequestStatusCode);
            if(authStore.isAuthenticated && !studentRequest.request && !hasInflightGMPRequest) {
              rootStore.setRequestType('studentRequest');
              next('ump/request');
            } else {
              next();
            }
          },
        },
        {
          path: 'request',
          component: StudentRequestPage,
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: '',
              name: 'step1',
              component: CurrentInfo,
              beforeEnter: checkStudentRequestExists,
              meta: {
                requiresAuth: true,
                notRefreshUserInfo: true
              },
            },
            {
              path: 'requestForm',
              name: 'step2',
              component: StudentRequestForm,
              beforeEnter: checkStudentRequestExists,
              meta: {
                requiresAuth: true,
                notRefreshUserInfo: true
              },
            },
            {
              path: 'requestSummary',
              name: 'step3',
              component: StudentRequestSummary,
              beforeEnter: checkStudentRequestExists,
              meta: {
                requiresAuth: true,
                notRefreshUserInfo: true
              },
            },
            {
              path: 'requestSubmission',
              name: 'step4',
              component: StudentRequestSubmission,
              meta: {
                requiresAuth: true,
                notRefreshUserInfo: true
              },
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
          component: GmpContainer,
          meta: {
            requiresAuth: true
          },
          beforeEnter: (_to, _from, next) => {
            const rootStore = useRootStore();
            const gmpStore = useGmpStore();
            const penRequest = usePenRequestStore();
            const studentRequest = useStudentRequestStore();
            const authStore = useAuthStore();

            gmpStore.$reset();
            const hasInflightOrCompletedUMPRequest = studentRequest.request
              && values(pick(StudentRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV', 'COMPLETED']))
                .some(status => status === studentRequest.request.studentRequestStatusCode);
            if (authStore.isAuthenticated
                && ((!penRequest.request
                && !hasInflightOrCompletedUMPRequest) || hasCompletedPenRequestButNoStudentLinkage())) {
              rootStore.setRequestType('penRequest');
              next('gmp/request');
            } else {
              next();
            }
          },
        },
        {
          path: 'request',
          component: PenRequestPage,
          meta: {
            requiresAuth: true
          },
          children: [
            {
              path: '',
              name: 'gmp-step1',
              component: PenRequestForm,
              beforeEnter: checkPenRequestExists,
              meta: {
                requiresAuth: true
              },
            },
            {
              path: 'requestSummary',
              name: 'gmp-step2',
              component: PenRequestSummary,
              beforeEnter: checkPenRequestExists,
              meta: {
                requiresAuth: true
              },
            },
            {
              path: 'requestSubmission',
              name: 'gmp-step3',
              component: PenRequestSubmission,
              meta: {
                requiresAuth: true
              },
            }
          ]
        },
        {
          path: 'verification/:status',
          name: 'pen-request-verification',
          component: PenRequestVerification,
          meta: {
            requiresAuth: true
          },
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
      component: LogoutContainer
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
      path: '/login',
      name: 'login',
      component: LoginRedirect
    },
    {
      path: '/:catchAll(.*)',
      name: 'notfound',
      redirect: '/',
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/token-expired',
      name: 'backend-session-expired',
      component: BackendSessionExpired
    }

  ]
});

function checkStudentRequestExists(_to, _from, next) {
  const rootStore = useRootStore();
  const studentRequest = useStudentRequestStore();
  const authStore = useAuthStore();
  if (authStore.isAuthenticated
    && (!studentRequest.request || ['COMPLETED', 'ABANDONED', 'REJECTED']
      .includes(studentRequest.request.studentRequestStatusCode))) {
    rootStore.setRequestType('studentRequest');
    next();
  } else {
    next('/ump');
  }
}

function hasCompletedPenRequestButNoStudentLinkage() {
  const rootStore = useRootStore();
  const penRequest = usePenRequestStore();
  return penRequest?.request?.penRequestStatusCode === PenRequestStatuses.MANUAL && !rootStore.student;
}

function checkPenRequestExists(_to, _from, next) {
  const rootStore = useRootStore();
  const penRequest = usePenRequestStore();
  const authStore = useAuthStore();

  if (authStore.isAuthenticated
    && (!penRequest.request || ['ABANDONED', 'REJECTED'].includes(penRequest?.request?.penRequestStatusCode)
      || hasCompletedPenRequestButNoStudentLinkage())) {
    rootStore.setRequestType('penRequest');
    next();
  } else {
    next('/gmp');
  }
}

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && authStore.isAuthenticated) {
    authStore.getJwtToken().then(() => {
      if (!authStore.isAuthenticated) {
        next('/token-expired');
      } else if (to.meta.notRefreshUserInfo) {
        next();
      } else {
        authStore.getUserInfo().then(next).catch(() => next('error'));
      }
    }).catch(() => {
      next('/token-expired');
    });
  }
  else{
    next();
  }
});

export default router;

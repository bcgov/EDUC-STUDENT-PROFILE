import { defineStore } from 'pinia';
import { useStudentRequestStore, usePenRequestStore } from './request';
import { useRootStore } from './root';

import ApiService from '../common/apiService';
import AuthService from '../common/authService';

function isFollowUpVisit({jwtToken}) {
  return !!jwtToken;
}

function isExpiredToken(jwtToken) {
  const now = Date.now().valueOf() / 1000;
  const jwtPayload = jwtToken.split('.')[1];
  const payload = JSON.parse(window.atob(jwtPayload));
  return payload.exp <= now;
}

async function refreshToken({getters, commit, dispatch}) {
  if (isExpiredToken(getters.jwtToken)) {
    dispatch('logout');
    return;
  }

  const response = await AuthService.refreshAuthToken(getters.jwtToken);
  if (response.jwtFrontend) {
    commit('setJwtToken', response.jwtFrontend);
    ApiService.setAuthHeader(response.jwtFrontend);
  } else {
    throw 'No jwtFrontend';
  }
}

async function getInitialToken({commit}) {
  const response = await AuthService.getAuthToken();

  if (response.jwtFrontend) {
    commit('setJwtToken', response.jwtFrontend);
    ApiService.setAuthHeader(response.jwtFrontend);
  } else {
    throw 'No jwtFrontend';
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    acronyms: [],
    isAuthenticated: false,
    userInfo: null,
    error: false,
    isLoading: true,
    loginError: false,
    jwtToken: localStorage.getItem('jwtToken'),
  }),
  actions: {
    setJwtToken(token = null) {
      if (token) {
        this.isAuthenticated = true;
        this.jwtToken = token;
        localStorage.setItem('jwtToken', token);
      } else {
        this.isAuthenticated = false;
        this.jwtToken = null;
        localStorage.removeItem('jwtToken');
      }
    },
    setUserInfo(userInfo) {
      if(userInfo){
        this.userInfo = userInfo;
      } else {
        this.userInfo = null;
      }
    },
    setLoginError() {
      this.loginError = true;
    },
    setError(error) {
      this.error = error;
    },
    setLoading(isLoading) {
      this.isLoading = isLoading;
    },
    loginErrorRedirect(){
      this.setLoginError();
    },
    logout() {
      this.setJwtToken();
      this.setUserInfo();
    },
    async getUserInfo(){
      const studentRequest = useStudentRequestStore();
      const penRequest = usePenRequestStore();
      const rootStore = useRootStore();
      const userInfoRes = await ApiService.getUserInfo();

      this.setUserInfo(userInfoRes.data);
      studentRequest.setRequest(userInfoRes.data.studentRequest);
      penRequest.setRequest(userInfoRes.data.penRequest);
      rootStore.setStudent(userInfoRes.data.student);
    },
    //retrieves the json web token from local storage. If not in local storage, retrieves it from API
    async getJwtToken(context) {
      context.commit('setError', false);
      if (isFollowUpVisit(context.getters)) {
        await refreshToken(context);
      } else {  //inital login and redirect
        await getInitialToken(context);
      }
    },
  }
});

import { defineStore } from 'pinia';
import { useStudentRequestStore, usePenRequestStore } from './request';
import { useRootStore } from './root';

import ApiService from '../common/apiService';
import AuthService from '../common/authService';

function isExpiredToken(jwtToken) {
  const now = Date.now().valueOf() / 1000;
  const jwtPayload = jwtToken.split('.')[1];
  const payload = JSON.parse(window.atob(jwtPayload));
  return payload.exp <= now;
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
        ApiService.setAuthHeader(token);
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
      if (userInfo) {
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
    loginErrorRedirect() {
      this.setLoginError();
    },
    logout() {
      this.setJwtToken();
      this.setUserInfo();
    },
    async getUserRequests() {
      const studentRequest = useStudentRequestStore();
      const penRequest = usePenRequestStore();

      const userInfoRes = await ApiService.getUserInfo();

      studentRequest.setRequest(userInfoRes.data.studentRequest);
      penRequest.setRequest(userInfoRes.data.penRequest);
    },
    async getUserInfo() {
      const rootStore = useRootStore();
      const userInfoRes = await ApiService.getUserInfo();

      this.setUserInfo(userInfoRes.data);
      rootStore.setStudent(userInfoRes.data.student);
    },
    async getInitialToken() {
      const { jwtFrontend } = await AuthService.getAuthToken();

      if (jwtFrontend) { return this.setJwtToken(jwtFrontend); }
      throw 'No jwtFrontend';
    },
    async refreshToken() {
      if (isExpiredToken(this.jwtToken)) { return this.logout(); }

      const { jwtFrontend } = await AuthService.refreshAuthToken(this.jwtToken);

      if (jwtFrontend) { return this.setJwtToken(jwtFrontend); }
      throw 'No jwtFrontend';
    },
    async getJwtToken() {
      this.setError(false);

      // initial login and redirect
      if (this.jwtToken) { return this.refreshToken(); }
      return this.getInitialToken();
    },
  }
});

import { defineStore } from 'pinia';
import ApiService from '../common/apiService';

export const useConfigStore = defineStore('config', {
  state: () => ({
    numDaysAllowedInDraftStatus: null,
    frontEnd: {
      bannerEnvironment: '',
      bannerColor: '',
      bceidRegUrl: '',
      idleTimeoutInMillis: 10000,
      journeyBuilder: ''
    }
  }),
  actions: {
    setNumDaysAllowedInDraftStatus(numDaysAllowedInDraftStatus) {
      this.numDaysAllowedInDraftStatus = numDaysAllowedInDraftStatus;
    },
    setFrontEndConfig(config) {
      this.frontEnd = config;
    },
    async getNumDaysAllowedInDraftStatus() {
      const response = await ApiService.getConfig('scheduler:numDaysAllowedInDraftStatus');
      this.setNumDaysAllowedInDraftStatus(response);
    },
    async getFrontEndConfig() {
      const response = await ApiService.getConfig('frontendConfig');
      this.setFrontEndConfig(response);
    }
  }
});

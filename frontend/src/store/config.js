import { defineStore } from 'pinia';
import ApiService from '../common/apiService';

export const useConfigStore = defineStore('config', {
  state: () => ({
    scheduler: {
      numDaysAllowedInDraftStatus: -1
    },
    frontendConfig: {
      bannerEnvironment: '',
      bannerColor: '',
      bceidRegUrl: '',
      idleTimeoutInMillis: 10000,
      journeyBuilder: ''
    }
  }),
  actions: {
    async getConfig() {
      const { scheduler, frontendConfig } = await ApiService.getConfig();
      this.scheduler = scheduler;
      this.frontendConfig = frontendConfig;
    }
  }
});

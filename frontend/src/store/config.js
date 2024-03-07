import { defineStore } from 'pinia';
import ApiService from '../common/apiService';

export const useConfigStore = defineStore('config', {
  state: () => ({
    numDaysAllowedInDraftStatus: null,
  }),
  actions: {
    setNumDaysAllowedInDraftStatus(numDaysAllowedInDraftStatus) {
      this.numDaysAllowedInDraftStatus = numDaysAllowedInDraftStatus;
    },
    async getNumDaysAllowedInDraftStatus() {
      const response = await ApiService.getConfig('scheduler:numDaysAllowedInDraftStatus');
      this.setNumDaysAllowedInDraftStatus(response);
    }
  }
});

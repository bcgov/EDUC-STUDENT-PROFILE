import { defineStore } from 'pinia';

export const useGmpStore = defineStore('gmp', {
  state: () => ({
    requestData: {},
    declared: false,
    accepted: false
  }),
  actions: {
    setRequestData(requestData) {
      this.requestData = requestData;
    },
    clearGmpState() {
      this.requestData = {};
      this.declared = false;
    }
  }
});

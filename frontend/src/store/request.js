import ApiService from '../common/apiService';
import { useRootStore } from './root';
import { defineStore } from 'pinia';

function createRequestStore(id) {
  return defineStore(id, {
    state: () => ({
      statuses: null,
      request: null,
    }),
    getters: {
      requestID: () => {
        const rootStore = useRootStore();
        return this.request && this.request[`${rootStore.requestType}ID`];
      },
    },
    actions: {
      setStatuses(statuses) {
        this.statuses = statuses;
      },
      setRequest(request = null) {
        this.request = request;
      },
      async postRequest(request){
        const rootStore = useRootStore();
        try {
          const response = await ApiService.postRequest(request, rootStore.requestType);
          if(response.status !== 200){
            return false;
          }
          this.setRequest(response.data);
          return response.data;
        } catch(e) {
          console.log('Error while accessing API - ' + e);
          return false;
        }
      },
      async getCodes(requestType) {
        const response = await ApiService.getCodes(requestType);
        this.setStatuses(response.data.statusCodes);
      },
    },
  });
}

export const usePenRequestStore = createRequestStore('penRequest');
export const useStudentRequestStore = createRequestStore('studentRequest');

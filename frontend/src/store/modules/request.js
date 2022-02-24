import ApiService from '@/common/apiService';
import document from '@/store/modules/document.js';
import comment from '@/store/modules/comment.js';

export default {
  namespaced: true,
  state: () => ({
    statuses: null,
    request: null,
  }),
  getters: {
    statuses: state => state.statuses,
    request: state => state.request,
    requestID: (state, getters, rootState, rootGetters) => state.request && state.request[`${rootGetters.requestType}ID`],
  },
  mutations: {
    setStatuses: (state, statuses) => {
      state.statuses = statuses;
    },
    setRequest: (state, request = null) => {
      state.request = request;
    },
  },
  actions: {
    async postRequest({commit, rootGetters}, request){
      try {
        const response = await ApiService.postRequest(request, rootGetters.requestType);
        if(response.status !== 200){
          return false;
        }
        commit('setRequest', response.data);
        return response.data;
      } catch(e) {
        console.log('Error while accessing API - ' + e);
        return false;
      }
    },
    async getCodes({commit}, requestType) {
      const response = await ApiService.getCodes(requestType);
      commit('setStatuses', response.data.statusCodes);
    },
    //getRequest: (_context, { requestId, requestType }) => getData(ApiService.getRequest, requestId),
  },
  modules: {
    document, 
    comment,
  }
};

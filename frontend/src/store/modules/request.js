import ApiService from '@/common/apiService';
import {getData} from '@/store/modules/helpers';
import { find, pick, mapKeys } from 'lodash';

export default {
  namespaced: true,
  state: {
    genders: null,
    statuses: null,
    request: null,
    student: null,
  },
  getters: {
    genders: state => state.genders,
    genderInfo: state => genderCode => find(state.genders, ['genderCode', genderCode]),
    statuses: state => state.statuses,
    request: state => state.request,
    requestID: state => state.request.requestID,
    student: state => state.student,
  },
  mutations: {
    setGenders: (state, genders) => {
      state.genders = genders;
    },
    setStatuses: (state, statuses) => {
      state.statuses = statuses;
    },
    setRequest: (state, request) => {
      // request.requestStatusCode = 'REJECTED';
      // request.failureReason = 'Can not find your record';

      // request.requestStatusCode = 'DRAFT';
      // request.statusUpdateDate = '2020-02-05T22:23:18.000+0000';

      // request.requestStatusCode = 'INITREV';

      // request.requestStatusCode = 'SUBSREV';

      // request.requestStatusCode = 'RETURNED';

      // request.requestStatusCode = 'AUTO';

      // request = null;

      state.request = request;
    },
    setStudent: (state, student) => {
      // student = {
      //   pen: '123456',
      //   legalFirstName: 'James',
      //   legalMiddleNames: 'Wayne',
      //   legalLastName: 'Duke',
      //   sexCode: 'M',
      //   sexLabel: 'Male',
      //   dob: '1998-01-01',
      //   genderCode: 'M',
      //   email: 'test@test.com'
      // };
      state.student = student;
    },
  },
  actions: {
    async postRequest(_context, { requestData, recordedData }){
      let request = pick(requestData, ['legalLastName', 'legalFirstName', 'legalMiddleNames', 'dob', 'genderCode', 'email']);
      const recorded = mapKeys(recordedData, (_, key) => {
        return 'recorded' + key.slice(0,1).toUpperCase() + key.slice(1);
      });
      request = { ...request, ...recorded };
      try {
        const response = await ApiService.postRequest(request);
        if(response.status !== 200){
          return false;
        }
        return response.data;
      } catch(e) {
        console.log('Error while accessing API - ' + e);
        return false;
      }
    },
    async getCodes({commit}) {
      const response = await ApiService.getCodes();
      commit('setGenders', response.data.genderCodes);
      commit('setStatuses', response.data.statusCodes);
    },
    getRequest: (_context, requestId) => getData(ApiService.getRequest, requestId),
  }
};

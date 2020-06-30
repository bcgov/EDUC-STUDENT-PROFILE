import { shallowMount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Vue from 'vue';
import RequestForm from '@/components/ump/RequestForm.vue';

describe('RequestForm.vue', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    Vue.use(Vuetify);
    Vue.use(Vuex);

    const actions = {
      postRequest: jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false)
    };

    let genderCodes = [
      {label:'Male', genderCode:'M'},
      {label:'Female', genderCode:'F'},
      {label:'Gender Diverse', genderCode:'X'},
      {label:'Unknown', genderCode:'U'},
    ];

    let student = {
      pen: '123456',
      legalFirstName: 'James',
      legalMiddleNames: 'Wayne',
      legalLastName: 'Duke',
      sexCode: 'M',
      sexLabel: 'Male',
      genderCode: 'M',
      dob: '1989-06-04'
    };

    const recordedData = {
      pen: '123456',
      legalFirstName: 'James',
      legalMiddleNames: 'Wayne',
      legalLastName: 'Duke',
      genderCode: 'M',
      dob: '1989-06-04',
      email: 'james@test.com'
    }

    // const request = {
    //   legalFirstName: 'James',
    //   legalMiddleNames: 'Wayne',
    //   legalLastName: 'Duke',
    //   genderCode: 'M',
    //   dob: '1989-09-04',
    //   email: 'wayne@test.com'
    // }
    const requestType = 'studentRequest';
    const rootGetters = {
      requestType: jest.fn().mockReturnValue(requestType),
      student: jest.fn().mockReturnValue(student),
    };

    const umpGetters = {
      recordedData: jest.fn().mockReturnValue(recordedData),
    };
    
    const requestGetters = {
      genders: jest.fn().mockReturnValue(genderCodes),
    };

    const authGetters = {
      userInfo: jest.fn().mockReturnValue({accountType: 'BCEID'}),
    };

    store = new Vuex.Store({
      modules: {
        root: {
          getters: rootGetters,
        },
        auth: {
          namespaced: true,
          getters: authGetters, 
        },
        [requestType]: {
          namespaced: true,
          actions,
          getters: requestGetters,
        },
        ump: {
          namespaced: true,
          getters: umpGetters,
        },
      }
    });

    wrapper = shallowMount(RequestForm, {
      Vue: Vue,
      store,
    });
  });

  test('expect v-card', () => {
    expect(wrapper.html()).toContain('<v-card');
  });

  // test('submit form with positive API response', () => {
  //   const mockValidate = jest.fn();
  //   wrapper.vm.validate = mockValidate;
  //   wrapper.setData({
  //     userPost: {
  //       digitalID: 21,
  //       legalLastName: 'Testerson',
  //       legalFirstName: 'Test',
  //       legalMiddleNames: null,
  //       usualLastName: null,
  //       usualFirstName: null,
  //       dataSourceCode: null,
  //       usualMiddleName: null,
  //       maidenName: null,
  //       pastNames: null,
  //       dob: '2019-09-08',
  //       genderCode: 'Male',
  //       email: 'fake@email.com',
  //       lastBCSchool: null,
  //       lastBCSchoolStudentNumber: null,
  //       currentSchool: null
  //     }
  //   });
  //   wrapper.vm.submitRequestForm();
  // });

  // test('submit form with failed API response', () => {
  //   const mockValidate = jest.fn();
  //   wrapper.vm.validate = mockValidate;
  //   wrapper.setData({
  //     userPost: {
  //       digitalID: 21,
  //       legalLastName: 'Testerson',
  //       legalFirstName: 'Test',
  //       legalMiddleNames: null,
  //       usualLastName: null,
  //       usualFirstName: null,
  //       dataSourceCode: 'BCEID',
  //       usualMiddleName: null,
  //       maidenName: null,
  //       pastNames: null,
  //       dob: '2019-09-08',
  //       genderCode: 'Female',
  //       email: 'fake@email.com',
  //       lastBCSchool: null,
  //       lastBCSchoolStudentNumber: null,
  //       currentSchool: null
  //     }
  //   });
  //   wrapper.vm.submitRequestForm();
  // });

});

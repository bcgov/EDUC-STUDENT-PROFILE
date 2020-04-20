import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import Vuex from 'vuex';
jest.mock('../../../src/common/staticConfig', () => {
  return {
    VUE_APP_BCEID_REG_URL: 'https://bceid.ca/'
  };
});
import Home from '../../../src/components/Home.vue';
import store from '../../../src/store/index';

describe('Home.vue', () => {
  let wrapper;
  
  beforeEach(() => {

    Vue.use(Vuetify);
    Vue.use(Vuex);

    wrapper = mount(Home, {
      Vue,
      store
    });
  });

  it('Check that text body exists', () => {
    expect(wrapper.html()).toContain('v-progress-circular');
  });

  it('Check that computed properties are accurate', () => {
    expect(wrapper.vm.hasRequest).toBeFalsy();
    expect(wrapper.vm.hasPen).toBeFalsy();
  });
});

import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import ApiService from '@/common/apiService';
import documentStore from '@/store/modules/document';
import { cloneDeep } from 'lodash';
import MockAdapter from 'axios-mock-adapter';
import { ApiRoutes } from '@/utils/constants.js';

const mockAxios = new MockAdapter(ApiService.apiAxios);

describe('document.js', () => {
  const spy = jest.spyOn(ApiService.apiAxios, 'get');
  let store;

  beforeEach(() => {
    ApiService.apiAxios.interceptors.response.eject(ApiService.intercept);
    const localVue = createLocalVue();
    localVue.use(Vuex);

    store = new Vuex.Store(cloneDeep(documentStore));
  });
  afterEach(() => {
    spy.mockClear();
  });

  it('User should get true response on successful post', async () => {
    mockAxios.onPost(ApiRoutes.FILE_UPLOAD).reply(200, {
      status: 200
    });

    var response = await store.dispatch('uploadFile');
    expect(response).toBeTruthy();
  });

  it('User should get false response on failed post', async () => {
    mockAxios.onPost(ApiRoutes.FILE_UPLOAD).reply(400, {
      status: 400
    });

    await expect(store.dispatch('uploadFile')).rejects.toThrow(Error);
  });
});

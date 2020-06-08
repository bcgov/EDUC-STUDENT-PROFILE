import Vue from 'vue';
import Vuex from 'vuex';
import auth from '@/store/modules/auth.js';
import request from '@/store/modules/request.js';
import document from '@/store/modules/document.js';
import comment from '@/store/modules/comment.js';
import config from '@/store/modules/config.js';
Vue.use(Vuex);

export default new Vuex.Store({
  modules: { auth, request, document, comment , config}
});

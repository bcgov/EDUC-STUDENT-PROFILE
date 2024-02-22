import '@fortawesome/fontawesome-free/css/all.css';
import {
  VApp,
  VAvatar,
  VSpacer,
  VList,
  VListItem,
  VListItemTitle,
  VMenu,
  VSkeletonLoader,
  VBtn,
  VLayout,
  VChip,
  VToolbarTitle,
  VCard,
  VCardText,
  VCardTitle,
  VAppBar,
  VFooter,
  VCol,
  VRow,
  VToolbar,
  VContainer
} from 'vuetify/components';
import { createVuetify } from 'vuetify';

export default new createVuetify({
  theme: {
    light: true,
    dark: false
  },
  icons: {
    iconfont: 'fa',
    values: {
      login: 'fas fa-user-clock',
      fast: 'fas fa-shipping-fast',
      sign_in: 'fas fa-sign-in-alt',
      info1: 'fas fa-info-circle',
      downArrow: 'fas fa-angle-down',
      upArrow: 'fas fa-angle-up',
      user: 'far fa-user',
      copy: 'fas fa-copy',
      search: 'fas fa-search',
      error: 'fas fa-exclamation-triangle',
      lock: 'fas fa-lock',
      info2: 'fas fa-info-circle fa-10x',
      question: 'fas fa-question-circle fa-10x'
    }
  },
  components: {
    VApp,
    VAvatar,
    VSpacer,
    VList,
    VListItem,
    VListItemTitle,
    VMenu,
    VSkeletonLoader,
    VBtn,
    VLayout,
    VChip,
    VToolbarTitle,
    VCard,
    VCardText,
    VCardTitle,
    VAppBar,
    VFooter,
    VCol,
    VRow,
    VToolbar,
    VContainer
  }
});

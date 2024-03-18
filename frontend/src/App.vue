<template>
  <v-app id="app">
    <MsieBanner v-if="isIE" />
    <HeaderToolbar />
    <div
      v-if="bannerColor !== ''"
      id="bannerEnvironment"
    >
      <v-container>
        <v-row>
          <v-col>
            <h3>{{ bannerEnvironment }} Environment</h3>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <ModalIdle v-if="isAuthenticated" />
    <router-view />
    <FooterComponent />
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from './store/auth';
import { useStudentRequestStore, usePenRequestStore } from './store/request';
import HttpStatus from 'http-status-codes';

import HeaderToolbar from './components/HeaderToolbar.vue';
import FooterComponent from './components/FooterComponent.vue';
import ModalIdle from './components/ModalIdle.vue';
import MsieBanner from './components/MsieBanner.vue';

export default {
  name: 'App',
  components: {
    HeaderToolbar,
    FooterComponent,
    ModalIdle,
    MsieBanner
  },
  data() {
    return {
      bannerEnvironment: import.meta.env.VITE_BANNER_ENVIRONMENT,
      bannerColor: import.meta.env.VITE_BANNER_COLOR
    };
  },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated', 'loginError', 'isLoading']),
    isIE() {
      return /Trident\/|MSIE/.test(window.navigator.userAgent);
    }
  },
  async created() {
    this.setLoading(true);
    this.getJwtToken().then(() =>
      Promise.all([
        this.getPenRequestCodes('penRequest'),
        this.getStudentRequestCodes('studentRequest'),
        this.getUserInfo()
      ])
    ).catch(e => {
      if (!e.response || e.response.status !== HttpStatus.UNAUTHORIZED) {
        this.logout();
        this.$router.replace({name: 'error', query: { message: `500_${e.data || 'ServerError'}` } });
      }
    }).finally(() => {
      this.setLoading(false);
    });
  },
  methods: {
    ...mapActions(useAuthStore, ['setLoading', 'getJwtToken', 'getUserInfo', 'logout']),
    ...mapActions(useStudentRequestStore, { getStudentRequestCodes: 'getCodes'}),
    ...mapActions(usePenRequestStore, { getPenRequestCodes: 'getCodes'}),
  }
};
</script>

<style>
#bannerEnvironment {
  background: v-bind(bannerColor);
  color: white;
}

.v-application {
  font-family: 'BCSans', Verdana, Arial, sans-serif !important;
}

.v-application a {
  color: #1976d2
}

.v-card--flat {
  background-color: transparent !important;
}
.theme--light.application {
  background: #f1f1f1;
}
h1 {
  font-size: 1.25rem;
}
.v-toolbar__title {
  font-size: 1rem;
}

.v-btn {
    text-transform: none !important;
}

.v-alert .v-icon {
    padding-left: 0;
}

.v-alert.bootstrap-success {
  color: #234720;
  background-color: #d9e7d8 !important;
  border-color: #accbaa !important;
}

.v-alert.bootstrap-info {
  color: #4e6478;
  background-color: #eaf2fa !important;
  border-color: #b8d4ee !important;
}

.v-alert.bootstrap-warning {
  color: #81692c;
  background-color: #fef4dd !important;
  border-color: #fbdb8b !important;
}

.v-alert.bootstrap-error {
  color: #712024;
  background-color: #f7d8da !important;
  border-color: #eeaaad !important;
}

.row {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  margin-top: auto !important;
  margin-bottom: auto !important;
}

@media screen and (max-width: 370px) {

  .v-toolbar__title {
    font-size: 0.9rem;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 0.9rem;
  }

  .v-application {
    line-height: 1.3;
  }
}

@media screen and (min-width: 371px) and (max-width: 600px) {
  .v-toolbar__title {
    font-size: 0.9rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 1rem;
  }

  .v-application {
    line-height: 1.3;
  }
}

@media screen and (min-width: 601px) and (max-width: 700px) {
  .v-toolbar__title {
    font-size: 1rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 1.2rem;
  }
}

.theme--light.v-btn.v-btn--disabled:not(.v-btn--text):not(.v-btn--outlined) {
  background-color: rgba(0,0,0,.12)!important;
}

</style>

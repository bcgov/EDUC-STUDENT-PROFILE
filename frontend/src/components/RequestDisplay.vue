<template>
  <v-row>
    <v-col>
      <h1>{{ title }}</h1>
    </v-col>
  </v-row>
  <v-row v-if="alertMessage">
    <v-col>
      <v-alert
        v-model="alert"
        density="compact"
        variant="outlined"
        closable
        :class="alertType"
        width="100%"
      >
        {{ alertMessage }}
      </v-alert>
    </v-col>
  </v-row>
  <v-row>
    <v-col><slot name="message" /></v-col>
  </v-row>
  <v-row>
    <v-col>
      <StatusCard
        :can-create-request="canCreateRequest"
        :new-request-text="newRequestText"
        @success-alert="setSuccessAlert"
        @error-alert="setErrorAlert"
      />
    </v-col>
  </v-row>
  <ChatBox
    v-if="status !== requestStatuses.DRAFT
      && status !== requestStatuses.INITREV
      && status !== requestStatuses.ABANDONED"
    :comment-documents="commentDocuments"
  />
  <v-row>
    <v-col>
      <slot
        v-if="status !== requestStatuses.ABANDONED"
        name="request"
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col
      cols="12"
      class="text-right"
    >
      <v-btn
        id="Home"
        color="#003366"
        class="text-white align-self-center"
        to="home"
      >
        Home
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'pinia';
import { useRootStore } from '../store/root';
import { getRequestStore } from '../store/request';
import { RequestStatuses } from '../utils/constants';

import ChatBox from './ChatBox.vue';
import StatusCard from './StatusCard.vue';

export default {
  components: {
    ChatBox,
    StatusCard
  },
  props: {
    title: {
      type: String,
      required: true
    },
    canCreateRequest: {
      type: Function,
      required: true
    },
    newRequestText: {
      type: String,
      required: true
    },
    commentDocuments: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      submitting: false,

      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {
    ...mapState(useRootStore, ['requestType']),
    status() {
      return this.request[`${this.requestType}StatusCode`];
    },
    request() {
      return getRequestStore().request;
    },
    requestStatuses() {
      return RequestStatuses;
    },
  },
  mounted() {
    window.scrollTo(0,0);
  },
  methods: {
    setSuccessAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
  }
};
</script>

<style scoped>

@media screen and (max-width: 600px) {

  .request-display-header {
    display: flex;
    justify-content: center;
  }

  .request-display-header h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

</style>

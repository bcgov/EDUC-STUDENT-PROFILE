<template>
  <v-card class="mx-0 mt-2 mb-5 px-6 py-2 px-sm-10 py-sm-5">  
    <v-row class="flex-grow-0 pb-5">
      <v-card
        height="100%"
        width="100%"
        elevation="0"
        color="#036"
        class="text-white"
      >
        <v-card-title class="request-display-header px-1 px-sm-5">
          <h1>{{ title }}</h1>
        </v-card-title>
      </v-card>
    </v-row>
    <v-row>
      <v-alert
        v-model="alert"
        density="compact"
        variant="outlined"
        closable
        :class="alertType"
        class="mb-5"
        width="100%"
      >
        {{ alertMessage }}
      </v-alert>
    </v-row>
    <v-row class="pb-5">
      <slot name="message" />
    </v-row>
    <v-row>
      <StatusCard
        :can-create-request="canCreateRequest"
        :new-request-text="newRequestText"
        @success-alert="setSuccessAlert"
        @error-alert="setErrorAlert"
      />
    </v-row>
    <v-row>
      <ChatBox
        v-if="status !== requestStatuses.DRAFT
          && status !== requestStatuses.INITREV
          && status !== requestStatuses.ABANDONED"
        :comment-documents="commentDocuments"
      />
    </v-row>
    <v-row>
      <slot
        v-if="status !== requestStatuses.ABANDONED"
        name="request"
      />
    </v-row>
    <v-row
      justify="end"
      class="py-1"
    >
      <v-col
        cols="12"
        sm="2"
        class="d-flex justify-end align-self-center py-0 px-0 pr-4 pt-3"
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
  </v-card>
</template>

<script>
import { mapState } from 'pinia';
import { useRootStore } from '../store/root';
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
      return this.$store.getters[`${this.requestType}/request`];
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

<template>
  <v-card class="mx-0 mt-2 mb-5 px-6 py-2 px-sm-10 py-sm-5">  
    <v-row class="flex-grow-0 pb-5">
      <v-card height="100%" width="100%" elevation=0 color="#036" class="white--text">
        <v-card-title class="request-display-header px-1 px-sm-5">
          <h1>{{status === requestStatuses.RETURNED ? 'Provide More Info for PEN Request' : 'PEN Request Status'}}</h1>
        </v-card-title>
      </v-card>
    </v-row>
    <v-row>
      <v-alert
        dense
        outlined
        dismissible
        v-model="alert"
        :class="alertType"
        class="mb-5"
        width="100%"
      >
        {{ alertMessage }}
      </v-alert>
    </v-row>
    <v-row class="pb-5">
      <MessageCard></MessageCard>
    </v-row>
    <v-row>
      <StatusCard @success-alert="setSuccessAlert" @error-alert="setErrorAlert"></StatusCard>
    </v-row>
    <v-row>
      <Chat v-if="status !== requestStatuses.DRAFT || status !== requestStatuses.INITREV"></Chat>
    </v-row>
    <v-row>
      <RequestCard></RequestCard>
    </v-row>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { RequestStatuses } from '@/utils/constants';
import Chat from './Chat';
import RequestCard from './RequestCard';
import MessageCard from './MessageCard';
import StatusCard from './StatusCard';

export default {
  name: 'requestDisplay',
  components: {
    Chat,
    RequestCard,
    MessageCard,
    StatusCard
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
    ...mapGetters('request', ['request']),
    status() {
      return this.request.requestStatusCode;
    },
    requestStatuses() {
      return RequestStatuses;
    },
  },
  mounted() {
    window.scrollTo(0,0);
  },
  methods: {
    ...mapMutations('request', ['setRequest']),
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

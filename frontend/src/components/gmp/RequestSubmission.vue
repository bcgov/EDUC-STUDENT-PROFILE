<template>
  <div
    v-if="request"
    class="px-6"
  >
    <v-row>
      <v-alert
        v-model="alert"
        dense
        outlined
        dismissible
        width="100%"
        :class="`pa-3 mb-3 ${alertType}`"
      >
        {{ alertMessage }}
      </v-alert>
    </v-row>

    <v-row class="pb-5">
      <MessageCard />
    </v-row>
    <v-row>
      <StatusCard
        @success-alert="setSuccessAlert" 
        @error-alert="setErrorAlert"
      />
    </v-row>
    <v-row>
      <RequestCard :request="request" />
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
          class="white--text align-self-center"
          to="home"
        >
          Home
        </v-btn>
      </v-col> 
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { usePenRequestStore } from '../../store/request';
import StatusCard from '../StatusCard';
import MessageCard from './MessageCard';
import RequestCard from './RequestCard';

export default {
  name: 'RequestSubmission',
  components: {
    StatusCard,
    MessageCard,
    RequestCard
  },
  data() {
    return {
      alert: false,
      alertMessage: null,
      alertType: null,
    };
  },
  computed: {
    ...mapState(usePenRequestStore, ['request']),
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

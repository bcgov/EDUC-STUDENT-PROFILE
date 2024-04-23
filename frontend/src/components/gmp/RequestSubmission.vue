<template>
  <div
    v-if="request"
    class="px-6"
  >
    <v-row>
      <v-alert
        v-model="alert"
        density="compact"
        variant="outlined"
        closable
        width="100%"
        :class="`pa-3 mb-3 ${alertType}`"
      >
        {{ alertMessage }}
      </v-alert>
    </v-row>

    <v-row>
      <v-col>
        <MessageCard />
      </v-col>
    </v-row>
    <v-row>
      <StatusCard
        @success-alert="setSuccessAlert" 
        @error-alert="setErrorAlert"
      />
    </v-row>
    <RequestCard :request="request" />
    <v-row>
      <v-col
        class="text-right"
        cols="12"
      >
        <v-btn
          id="Home"
          color="#003366"
          class="text-white"
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

import StatusCard from '../StatusCard.vue';
import MessageCard from './MessageCard.vue';
import RequestCard from './RequestCard.vue';

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

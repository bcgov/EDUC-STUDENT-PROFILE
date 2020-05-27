<template>
  <div>
    <!-- <v-row align-content="center" class="flex-grow-0 pb-5">
      <v-card style="margin-right: 1.4rem;margin-left: 1.4rem" height="100%" width="100%" elevation=0 color="#036"
              class="white--text">
        <v-card-title class="py-3 pl-5"><h1>UpdateMyPENInfo Summary Page</h1></v-card-title>
      </v-card>
    </v-row> -->

    <v-alert
      dense
      outlined
      dismissible
      v-model="alert"
      class="pa-3 mb-3 mx-3 bootstrap-error"
    >
      {{ alertMessage }}
    </v-alert>

    <v-alert outlined class="pa-3 mb-3 mx-3 bootstrap-warning">
      <h3>Guidance:</h3>
      <ul class="pt-2">
        <li>Please review your information below before completing the request. If requested updates are incorrect or need to be adjusted further, use the <strong>Back</strong> button to return to UpdateMyPENInfo form</li>
        <li>If your name and/or gender has been legally changed, proof of this change may be requested</li>
      </ul>
    </v-alert>

    <RequestCard :request="request" class="px-3">
      <template v-slot:hint>
        <v-row no-gutters>
          <p>
            <strong>
              Please confirm that the information below correctly summarizes the requested changes to your PEN Information
            </strong>
          </p>
        </v-row>
        <v-row no-gutters>
          <p class="mb-0">
            <strong>
              My PEN Information should be changed to:
            </strong>
          </p>
        </v-row>
      </template>
      <template v-slot:actions>
        <v-card-actions class="justify-end px-0">
          <v-btn
            color="#003366"
            class="white--text align-self-center"
            id="previous-step"
            @click="previousStep"
          >
            Back
          </v-btn>
          <v-btn
            color="#003366"
            class="white--text align-self-center"
            id="next-step"
            @click="submitRequest"
            :loading="submitting"
          >
            {{ emailChanged ? 'Next' : 'Submit' }}
          </v-btn>
        </v-card-actions>
      </template>
    </RequestCard>
  </div>
</template>

<script>
import {mapMutations, mapActions } from 'vuex';
import moment from 'moment';
import RequestCard from './RequestCard';

export default {
  name: 'requestSummary',
  components: {
    RequestCard,
  },
  props: {
    recordedData: {
      type: Object,
      required: true
    },
    request: {
      type: Object,
      required: true
    },
    nextStep: {
      type: Function,
      required: true
    },
    previousStep: {
      type: Function,
      required: true
    },
  },
  data() {
    return {
      submitting: false,

      alert: false,
      alertMessage: null,
    };
  },
  computed: {
    emailChanged() {
      return this.recordedData.email !== this.request.email;
    },
  },
  methods: {
    ...mapMutations('request', ['setRequest']),
    ...mapActions('request', ['postRequest']),
    moment,
    setErrorAlert() {
      this.alertMessage = 'Sorry, an unexpected error seems to have occured. Please try again later.';
      this.alert = true;
      window.scrollTo(0,0);
    },
    async submitRequest() {
      try {
        this.submitting = true;
        const resData = await this.postRequest({ requestData: this.request, recordedData: this.recordedData });
        if (resData) {
          this.setRequest(resData);
          if (this.emailChanged) {
            this.nextStep();
          } else {
            this.$router.replace({name: 'home'});
          }
        } else {
          this.setErrorAlert();
        }
      } catch (e) {
        this.setErrorAlert();
        throw e;
      } finally {
        this.submitting = false;
      }
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

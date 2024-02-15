<template>
  <div v-if="requestData">
    <v-alert
      v-model="alert"
      dense
      outlined
      dismissible
      class="pa-3 mb-3 mx-3 bootstrap-error"
    >
      {{ alertMessage }}
    </v-alert>

    <v-alert
      outlined
      class="pa-3 mb-3 mx-3 bootstrap-warning"
    >
      <h3>Guidance:</h3>
      <ul class="pt-2">
        <li>
          Please review your information and email below before completing the request. If anything is incorrect,
          use the <strong>Back</strong> button to return to the GetMyPEN form
        </li>
        <li>If we are unable to locate your PEN based on the information provided below;</li>
        <div class="pl-16">
          <li>identification may be requested or,</li>
          <li>your PEN request may be rejected</li>
        </div>
      </ul>
    </v-alert>

    <StudentInfoCard
      :request="requestData"
      class="px-3"
    >
      <template #hint>
        <v-row no-gutters>
          <p>
            <strong>Please confirm the information below correctly summarizes your legal names, demographic information
              and contact information before continuing.</strong>
          </p>
        </v-row>
      </template>
    </StudentInfoCard>
    <v-row justify="space-between">
      <v-col
        cols="1"
        sm="2"
        class="d-flex justify-left align-self-center py-0 px-0 pl-7"
      >
        <v-btn
          id="cancelButton"
          to="home"
          color="#003366"
          class="white--text align-self-center"
        >
          Cancel
        </v-btn>
      </v-col>
      <v-col
        cols="11"
        sm="2"
        class="d-flex justify-end align-self-center py-0 px-0 pr-6"
      >
        <v-card-actions class="justify-end pr-2">
          <v-btn
            id="previous-step"
            color="#003366"
            class="white--text align-self-center"
            @click="previousStep"
          >
            Back
          </v-btn>
          <v-btn
            id="next-step"
            color="#003366"
            class="white--text align-self-center"
            :loading="submitting"
            @click="submitRequest"
          >
            Next
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useGmpStore } from '../../store/gmp';
import { usePenRequestStore } from '../../store/request';
import StudentInfoCard from '../StudentInfoCard';

export default {
  components: {
    StudentInfoCard,
  },
  emits: ['next', 'back'],
  data() {
    return {
      submitting: false,

      alert: false,
      alertMessage: null,
    };
  },
  computed: {
    ...mapState(useGmpStore, ['requestData']),
  },
  methods: {
    ...mapActions(usePenRequestStore, ['setRequest', 'postRequest']),
    setErrorAlert() {
      this.alertMessage = 'Sorry, an unexpected error seems to have occured. Please try again later.';
      this.alert = true;
      window.scrollTo(0,0);
    },
    async submitRequest() {
      try {
        this.submitting = true;
        const resData = await this.postRequest(this.requestData);
        if (resData) {
          this.setRequest(resData);
          this.nextStep();
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
    nextStep() {
      this.$emit('next');
    },
    previousStep() {
      this.$emit('back');
    }
  },
};
</script>

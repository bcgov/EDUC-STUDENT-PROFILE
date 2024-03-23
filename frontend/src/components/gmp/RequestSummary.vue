<template>
  <div v-if="requestData">
    <v-row>
      <v-col>
        <v-alert
          v-model="alert"
          density="compact"
          variant="outlined"
          closable
          class="pa-3 mb-3 mx-3 bootstrap-error"
        >
          {{ alertMessage }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-alert
          variant="outlined"
          class="bootstrap-warning"
        >
          <h3>Guidance</h3>
          <p class="pb-4">
            Please review your information and email below before completing the request. If anything is incorrect,
            use the <strong>Back</strong> button to return to the GetMyPEN form
          </p>
          <p class="pb-4">If we are unable to locate your PEN based on the information provided below;</p>
          <ul class="pl-5">
            <li>Identification may be requested or</li>
            <li>Your PEN request may be rejected</li>
          </ul>
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
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
      </v-col>
    </v-row>

    <v-row>
      <v-col
      >
        <v-btn
          id="cancelButton"
          to="home"
          color="#003366"
          class="text-white align-self-center"
        >
          Cancel
        </v-btn>
      </v-col>
      <v-spacer />
      <v-col
        class="text-right"
      >
        <v-btn
          id="previous-step"
          class="mr-2"
          color="#003366"
          @click="previousStep"
        >
          Back
        </v-btn>
        <v-btn
          id="next-step"
          color="#003366"
          class="text-white align-self-center"
          :loading="submitting"
          @click="submitRequest"
        >
          Next
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useGmpStore } from '../../store/gmp';
import { usePenRequestStore } from '../../store/request';

import StudentInfoCard from '../StudentInfoCard.vue';

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

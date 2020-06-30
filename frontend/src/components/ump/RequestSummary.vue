<template>
  <div v-if="updateData">
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
        <li>Please review your information below before completing the request. If requested updates are incorrect or need to be adjusted further, use the <strong>Back</strong> button to return to the UpdateMyPENInfo form</li>
        <li>If your name and/or gender has been legally changed, proof of this change may be requested</li>
      </ul>
    </v-alert>

    <RequestCard :request="updateData" class="px-3">
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
    </RequestCard>
    <v-card-actions class="justify-end pr-2">
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RequestCard from './RequestCard';
import { pick, mapKeys } from 'lodash';

export default {
  name: 'requestSummary',
  components: {
    RequestCard,
  },
  data() {
    return {
      submitting: false,

      alert: false,
      alertMessage: null,
    };
  },
  computed: {
    ...mapGetters('ump', ['recordedData', 'updateData']),
    emailChanged() {
      return this.recordedData.email !== this.updateData.email;
    },
  },
  methods: {
    ...mapActions('studentRequest', ['postRequest']),
    setErrorAlert() {
      this.alertMessage = 'Sorry, an unexpected error seems to have occured. Please try again later.';
      this.alert = true;
      window.scrollTo(0,0);
    },
    createRequestData() {
      let request = pick(this.updateData, ['legalLastName', 'legalFirstName', 'legalMiddleNames', 'dob', 'genderCode', 'email']);
      let recorded = pick(this.recordedData, ['legalLastName', 'legalFirstName', 'legalMiddleNames', 'dob', 'genderCode', 'email', 'pen']);
      recorded = mapKeys(recorded, (_, key) => {
        return 'recorded' + key.slice(0,1).toUpperCase() + key.slice(1);
      });
      return { ...request, ...recorded };
    },
    async submitRequest() {
      try {
        this.submitting = true;
        const resData = await this.postRequest(this.createRequestData());
        if (resData) {
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
    nextStep() {
      this.$emit('next');
    },
    previousStep() {
      this.$emit('back');
    }
  },
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

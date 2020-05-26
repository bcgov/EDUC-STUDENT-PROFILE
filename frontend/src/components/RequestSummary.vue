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
        <li>Please review your information below before completing the request. If requested updates are incorrect or need to be adjusted further, use the <strong>Back</strong> button to return to UpdayeMyPENInfo form</li>
        <li>If your name and/or gender has been legally changed, proof of this change may be requested</li>
      </ul>
    </v-alert>

    <v-card height="100%" width="100%" elevation=0>
      <v-card-subtitle>
        <span style="font-size: 1.3rem;font-weight: bolder; color: #333333">Student Information</span>
      </v-card-subtitle>
      <v-container fluid class="pt-0">
      <v-row no-gutters>
        <p>
          <strong>
            Please confirm that the infrmation below correctly summarizes the requested changes to your PEN Information
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
      <v-row no-gutters>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="mb-0">Name:</p>
        </v-col>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="ml-2 mb-0"><strong>{{fullName}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="mb-0">Birthdate:</p>
        </v-col>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="ml-2 mb-0"><strong>{{ request.dob ? moment(request.dob).format('MMMM D, YYYY'):'' }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="mb-3">Gender:</p>
        </v-col>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="ml-2 mb-3"><strong>{{ genderLabel }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <p class="mb-0">
          <strong>
            Contact Information
          </strong>
        </p>
      </v-row>
      <v-row no-gutters>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="mb-3">E-mail address:</p>
        </v-col>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="ml-2 mb-3"><strong>{{ request.email }}</strong></p>
        </v-col>
      </v-row>
      </v-container>
      <v-card-actions class="justify-end">
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
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import moment from 'moment';

export default {
  name: 'requestSummary',
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
    ...mapGetters('request', ['genderInfo']),
    genderLabel() { 
      return this.genderInfo(this.request.genderCode).label;
    },
    emailChanged() {
      return this.recordedData.email !== this.request.email;
    },
    fullName() {
      return [this.request.legalFirstName, this.request.legalMiddleNames, this.request.legalLastName].filter(Boolean).join(' ');
    }
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

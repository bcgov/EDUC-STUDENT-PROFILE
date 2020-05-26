<template>
  <div>
    <!-- <v-row align-content="center" class="flex-grow-0 pb-5">
      <v-card style="margin-right: 1.4rem;margin-left: 1.4rem" height="100%" width="100%" elevation=0 color="#036"
              class="white--text">
        <v-card-title class="py-3 pl-5"><h1>UpdateMyPENInfo Summary Page</h1></v-card-title>
      </v-card>
    </v-row> -->

    <v-alert outlined class="pa-3 mb-3 mx-3 bootstrap-warning">
      <p><strong>You are almost finished. To complete your request for the changes below, you must verify the email address you provided by completing the following steps:</strong></p>
      <ol class="pt-2">
        <li>Go to your email for {{request.email}} and look for an email from the Ministry of Education.  You may need to check your spam folder</li>
        <li>Within 24 hours you must click on the link in the email to complete your request</li>
      </ol>
      <br/>
      <p>If the email has expired or is not in your Inbox (or spam folder) click on the "Resend Verification Email" button below to receive a new email and the follow the 2 steps listed above.</p>
    </v-alert>

    <!-- <div class="pa-0 align-self-start"> -->
      <v-card height="100%" width="100%" elevation=0>
        <v-row no-gutters justify="end" class="pb-5 mx-3">
          <v-btn color="#38598a" dark class="ml-2 text-none" @click.stop="resendVerificationEmail" :loading="sending">Resend Verification Email</v-btn>
        </v-row>
      </v-card>
    <!-- </div> -->

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
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import moment from 'moment';

export default {
  name: 'requestSubmission',
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      alert: false,
      alertMessage: null,
      alertType: null,

      sending: false,
    };
  },
  computed: {
    ...mapGetters('request', ['genderInfo']),
    genderLabel() { 
      return this.genderInfo(this.request.genderCode).label;
    },
    fullName() {
      return [this.request.legalFirstName, this.request.legalMiddleNames, this.request.legalLastName].filter(Boolean).join(' ');
    }
  },
  methods: {
    ...mapMutations('request', ['setRequest']),
    moment,
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

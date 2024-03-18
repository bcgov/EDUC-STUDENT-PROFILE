<template>
  <v-container
    fluid
    class="full-height"
  >
    <article
      id="verification-container"
      class="background top-banner full-height"
    >
      <v-row
        align="center"
        justify="center"
        style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;"
      >
        <v-col
          xs="8"
          sm="8"
          md="8"
          lg="8"
          xl="8"
        >
          <v-card class="">
            <v-card-title class="gov-header">
              <h4 id="verification_text">
                Email Verification
              </h4>
            </v-card-title>
            <v-card-text id="verification_descriptor">
              <v-card
                v-if="status === verificationResults.OK"
                height="100%"
                width="100%"
                variant="outlined"
                color="#C3F1E8"
                class="pa-3"
              >
                <p class="mb-2">
                  <strong> Your email has been verified and your {{ requestName }} request has now been submitted for
                    processing. </strong>
                </p>
                <ul>
                  <li>Requests are processed M-F 8am – 4:30pm excluding stat holidays</li>
                  <li>In most cases you will get a response within 1-3 business days</li>
                  <li>
                    You will receive an email when your request has been processed. You can also log into
                    {{ appName }} after one business day to check on status of your request
                  </li>
                </ul>
              </v-card>
              <v-card
                v-else-if="status === verificationResults.EXPIRED"
                height="100%"
                width="100%"
                variant="outlined"
                color="#FFECA9"
                class="pa-3"
              >
                <p class="mb-2">
                  <strong>Your email verification was not completed within the 24 hour time limit. Please repeat the
                    email verification process.</strong>
                </p>
                <ol>
                  <li>Log in and click the 'Resend Verification Email' button</li>
                  <li>Go to your email inbox and check for an email from {{ ministry }}. Check your spam folder too</li>
                  <li>Open the email and click on the link within 24 hours to complete the verification process</li>
                </ol>
              </v-card>
              <v-card
                v-else-if="status === verificationResults.TOKEN_ERROR"
                height="100%"
                width="100%"
                variant="outlined"
                color="#FFECA9"
                class="pa-3"
              >
                <p class="mb-2">
                  <strong>Sorry, your email verification could not be completed, for the following reason:</strong>
                </p>
                <p>
                  <ul>
                    <li>The verification link is not valid</li>
                  </ul>
                </p>
                <p>
                  Likely the link used is not complete. You can copy/paste the verification link from the email you
                  receive into your web browser's address field. You must use the entire link.
                </p>
                <p>
                  If this does not work, login to the {{ appName }} application again and use the Resend Email
                  Verification action to get a new verification link.
                </p>
              </v-card>
              <v-card
                v-else
                height="100%"
                width="100%"
                variant="outlined"
                color="#FFECA9"
                class="pa-3"
              >
                <p class="mb-2">
                  <strong>Sorry, Your email verification could not be completed, for the following reason:</strong>
                </p>
                <p>
                  <ul>
                    <li>The verification service is not available</li>
                  </ul>
                </p>
                <p>
                  Retry email verification again later. If this issue persists for more than one business day, please
                  contact pens.coordinator@gov.bc.ca.
                </p>
              </v-card>
              <p
                v-if="status === verificationResults.OK || status === verificationResults.EXPIRED"
                class="mt-5 mb-0"
              >
                To log back in to {{ appTitle }}, click the log in button.
              </p>
            </v-card-text>
            <v-card-actions v-if="status === verificationResults.OK || status === verificationResults.EXPIRED">
              <v-row
                align="center"
                justify="center"
              >
                <v-btn
                  id="login-button"
                  :href="authRoutes.LOGIN"
                  class="ma-2"
                  theme="dark"
                  color="#003366"
                  @click="clearStorage"
                >
                  Log In <v-icon>$sign_in</v-icon>
                </v-btn>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '../store/auth';
import { VerificationResults, AuthRoutes } from '../utils/constants';

export default {
  props: {
    requestName: {
      type: String,
      required: true
    },
    appName: {
      type: Function,
      required: true
    },
  },
  data() {
    return {
      appTitle: import.meta.env.VITE_APP_TITLE,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated']),
    status() {
      return this.$route.params.status;
    },
    verificationResults() {
      return VerificationResults;
    },
    authRoutes() {
      return AuthRoutes;
    },
    ministry() {
      return 'Ministry of Education and Child Care';
    },
  },
  methods: {
    ...mapActions(useAuthStore, ['setJwtToken']),
    clearStorage() {
      this.setJwtToken();
    }
  }
};
</script>

<style scoped>
.container {
  padding: 0;
}

.full-height {
  height: 100%;
}

.background {
  min-height: 500px;
  background-size: cover;
  display: flex;
  height: 100%;
  width: 100%;
}
</style>

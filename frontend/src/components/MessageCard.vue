<template>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-success" v-if="status === requestStatuses.INITREV || status === requestStatuses.SUBSREV">
    <p class="mb-2"><strong>Your request to update your student information with the changes below has been submitted.</strong></p>
    <ul>
      <li>Requests are processed M-F 8am - 4:30pm excluding stat holidays</li>
      <li>In most cases you will get a response within one business day</li>
      <li>You will receive an email when your request has been processed. You can also log into UpdateMyPENInfo after one business day to check on the status of your request</li>
    </ul>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.DRAFT && timedout">
    <p class="mb-2"><strong>Your email verification was not completed within the time limited. Repeat the email verification process.</strong></p>
    <ol>
      <li>Click the 'Resend Verification Email' button below</li>
      <li>Go to your email inbox for {{ request.email }} and check for an email from {{ ministry }}. Check your spam folder too</li>
      <li>Open the email and click on the link within 24 hours to complete the verification process</li>
    </ol>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.DRAFT && ! timedout">
    <p class="mb-2"><strong>You are almost finished. To complete your request for the changes below, you must verify the email address you provided by completing the following steps:</strong></p>
    <ol>
      <li>Go to your email for {{request.email}} and look for an email from the Ministry of Education.  You may need to check your spam folder</li>
      <li>Within 24 hours you must click on the link in the email to complete your request</li>
    </ol>
    <br/>
    <p>If the email has expired or is not in your Inbox (or spam folder) click on the "Resend Verification Email" button below to receive a new email and the follow the 2 steps listed above.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.RETURNED">
    <p class="mb-2"><strong>Additional information is required.</strong> See the request below.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-warning" v-else-if="status === requestStatuses.REJECTED">
    <p class="mb-2"><strong>Your request to update your student information could not be completed, for the following reason:</strong></p>
    <p>
      <ul>
        <li>{{ request.failureReason }}</li>
      </ul>
    </p>
    <p>If needed, you can submit another request using the button below.</p>
  </v-alert>
  <v-alert outlined height="100%" width="100%" class="pa-3 bootstrap-success" v-else-if="status === requestStatuses.AUTO || status === requestStatuses.MANUAL">
    <p class="mb-1"><strong>Your PEN request is complete. Your PEN is:</strong></p>
    <p class="mb-2 pen"><strong>{{student.pen}}</strong></p>
    <p class="mb-2">Below is the key information the Ministry of Education has on file for you. If any of this information is not current, please contact <a href="mailto:pens.coordinator@gov.bc.ca">pens.coordinator@gov.bc.ca</a>.</p>
    <v-container class="pen-info pt-0 pb-2 px-0 px-sm-3" justify="center">
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2">Legal Last Name:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.legalLastName }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2">Legal First Name(s):</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.legalFirstName }}</strong></p>
        </v-col>
      </v-row>   
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2" color="green">Legal Middle Name(s):</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.legalMiddleNames }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2">Date of Birth:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.dob }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters class="py-0 px-2">
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-2">Gender:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-2"><strong>{{ student.sexLabel }}</strong></p>
        </v-col>
      </v-row>
    </v-container>
    <p class="mb-2">You now may wish to use your PEN to:
      <ul>
        <li>
          <a :href="transcriptUrl" target="_blank">
            Order Transcripts & Certificates - StudentTranscripts Service
          </a>
        </li>
      </ul>
    </p>
    <p class="mb-2">You can log back into GetMyPEN at any time to see your PEN.</p>
  </v-alert>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import { RequestStatuses } from '@/utils/constants';

export default {
  name: 'messageCard',
  data() {
    return {
      transcriptUrl: 'https://www2.gov.bc.ca/gov/content?id=040EB8CF78CF4F2090D9C6FFF6F3CDA0'
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('request', ['request', 'student', 'sexInfo']),
    status() {
      return this.request.requestStatusCode;
    },
    ministry() {
      return 'the Ministry of Education';
    },
    requestStatuses() {
      return RequestStatuses;
    },
    timedout() {
      return Math.floor(new Date() - new Date(this.request.statusUpdateDate)) / (1000*60*60) > 24;
    },
    sexLabel() { 
      return this.sexInfo(this.student.sexCode).label;
    }
  },
  methods: {
    moment,
  }
};
</script>

<style scoped>
.pen {
  font-size: 1.2rem;
}

.pen-info{
  line-height: 1.2;
}
</style>

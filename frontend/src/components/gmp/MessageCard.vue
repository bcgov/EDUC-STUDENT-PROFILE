<template>
  <v-alert
    v-if="isSagaInProgress"
    variant="outlined"
    class="bootstrap-success"
  >
    <p><strong>Thank you. Your request has been accepted.</strong></p>
  </v-alert>
  <v-alert
    v-else-if="status === requestStatuses.INITREV || status === requestStatuses.SUBSREV"
    variant="outlined"
    height="100%"
    width="100%"
    class="bootstrap-success"
  >
    <p
      v-if="status === requestStatuses.INITREV"
      class="pb-4"
    >
      <strong>Your email has been verified and your PEN request has now been submitted for processing.</strong>
    </p>
    <p
      v-else
      class="pb-4"
    >
      <strong>Your PEN request has now been re-submitted for processing.</strong>
    </p>
    <p class="pb-4">
      Requests are processed M-F 8am – 4:30pm excluding stat holidays
    </p>
    <p class="pb-4">
      In most cases you will get a response within 1-3 business days
    </p>
    <p>
      You will receive an email when your request has been processed. You can also log into GetMyPEN after one
      business day to check on status of your request
    </p>
  </v-alert>
  <v-alert
    v-else-if="status === requestStatuses.DRAFT && timedout"
    variant="outlined"
    height="100%"
    width="100%"
    class="bootstrap-warning"
  >
    <p class="pb-4">
      <strong>Your email verification was not completed within the time limited. Repeat the email verification
        process.</strong>
    </p>
    <ol>
      <li>Click the 'Resend Verification Email' button below</li>
      <li>
        Go to your email inbox for {{ request.email }} and check for an email from {{ ministry }}. Check your spam
        folder too
      </li>
      <li>Open the email and click on the link within 24 hours to complete the verification process</li>
    </ol>
  </v-alert>
  <v-alert
    v-else-if="status === requestStatuses.DRAFT && ! timedout"
    variant="outlined"
    class="bootstrap-warning"
  >
    <p class="pb-4">
      <strong>You are almost finished. To complete your request, you must verify the email address you provided by
        completing the following steps:</strong>
    </p>
    <p class="pb-4">
      Go to your email inbox for <strong>{{ request.email }}</strong> and look for an email from {{ ministry }}.
      You may need to check your spam folder
      <strong>Within 24 hours</strong> you must click on the link in the email to complete your request
    </p>
    <p>
      If the email has expired or is not in your Inbox (or spam folder) click on the 'Resend Verification Email'
      button below to receive a new email and then follow the 2 steps listed above.
    </p>
  </v-alert>
  <v-alert
    v-else-if="status === requestStatuses.RETURNED"
    variant="outlined"
    height="100%"
    width="100%"
    class="bootstrap-warning"
  >
    <p>
      <strong>Additional information is required.</strong> See the request below.
    </p>
  </v-alert>
  <v-alert
    v-else-if="status === requestStatuses.REJECTED"
    variant="outlined"
    height="100%"
    width="100%"
    class="bootstrap-warning"
  >
    <p class="pb-4">
      <strong>Your request to get your PEN could not be completed, for the following reason:</strong>
    </p>
    <p class="pb-4">
      <i>{{ request.failureReason }}</i>
    </p>
    <p>If needed, you can submit another request using the button below.</p>
  </v-alert>
  <v-alert
    v-else-if="status === requestStatuses.AUTO || status === requestStatuses.MANUAL"
    variant="outlined"
    height="100%"
    width="100%"
    class="bootstrap-success"
  >
    <p class="mb-1">
      <strong>Your PEN request is complete. Your PEN is:</strong>
    </p>
    <p class="pb-4 pen">
      <strong>{{ student.pen }}</strong>
    </p>
    <p
      v-if="request.completeComment && request.completeComment.length > 0"
      class="pb-4 comment"
    >
      {{ request.completeComment }}
    </p>
    <p class="pb-4">
      Below is the key information the Ministry of Education and Child Care has on file for you. If any of this
      information is not current, please proceed to
      <router-link to="ump">
        Update My PEN Info page 
      </router-link>.
    </p>
    <v-container
      class="pen-info pt-0 pb-2 px-0 px-sm-3"
      justify="center"
    >
      <v-row
        no-gutters
        class="py-0 px-2"
      >
        <v-col
          xl="4"
          lg="4"
          md="4"
          sm="4"
        >
          <p class="pb-4">
            Legal Last Name:
          </p>
        </v-col>
        <v-col
          xl="4"
          lg="5"
          md="5"
          sm="5"
        >
          <p class="pb-4">
            <strong>{{ student.legalLastName }}</strong>
          </p>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="py-0 px-2"
      >
        <v-col
          xl="4"
          lg="4"
          md="4"
          sm="4"
        >
          <p class="pb-4">
            Legal First Name(s):
          </p>
        </v-col>
        <v-col
          xl="4"
          lg="5"
          md="5"
          sm="5"
        >
          <p class="pb-4">
            <strong>{{ student.legalFirstName }}</strong>
          </p>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="py-0 px-2"
      >
        <v-col
          xl="4"
          lg="4"
          md="4"
          sm="4"
        >
          <p
            class="pb-4"
            color="green"
          >
            Legal Middle Name(s):
          </p>
        </v-col>
        <v-col
          xl="4"
          lg="5"
          md="5"
          sm="5"
        >
          <p class="pb-4">
            <strong>{{ student.legalMiddleNames }}</strong>
          </p>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="py-0 px-2"
      >
        <v-col
          xl="4"
          lg="4"
          md="4"
          sm="4"
        >
          <p class="pb-4">
            Date of Birth:
          </p>
        </v-col>
        <v-col
          xl="4"
          lg="5"
          md="5"
          sm="5"
        >
          <p class="pb-4">
            <strong>{{ student.dob }}</strong>
          </p>
        </v-col>
      </v-row>
    </v-container>
    <p class="pb-4">
      {{ request.tomorrow ? 'As of tomorrow morning 8am PST, you may use your PEN to'
        : 'You now may wish to use your PEN to' }}
      <a
        :href="transcriptUrl"
        target="_blank"
      >
        Order Transcripts & Certificates - StudentTranscripts Service
      </a>
    </p>
    <p>
      You can log back into GetMyPEN at any time to see your PEN.
    </p>
  </v-alert>
  <v-alert
    v-else-if="status === requestStatuses.ABANDONED"
    variant="outlined"
    height="100%"
    width="100%"
    class="bootstrap-warning"
  >
    <p>
      <strong>Your PEN Request was not actioned within {{ numDaysAllowedInDraftStatus }} days and was therefore
        cancelled. Please fill out the form again and verify your email to submit a new request.</strong>
    </p>
  </v-alert>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useRootStore } from '../../store/root';
import { useAuthStore } from '../../store/auth';
import { usePenRequestStore } from '../../store/request';
import { useConfigStore } from '../../store/config';
import { PenRequestStatuses } from '../../utils/constants';

export default {
  name: 'MessageCard',
  data() {
    return {
      transcriptUrl: 'https://www2.gov.bc.ca/gov/content?id=040EB8CF78CF4F2090D9C6FFF6F3CDA0'
    };
  },
  computed: {
    ...mapState(useAuthStore, ['userInfo']),
    ...mapState(usePenRequestStore, ['request']),
    ...mapState(useRootStore, ['student']),
    ...mapState(useConfigStore, ['numDaysAllowedInDraftStatus']),

    isSagaInProgress() {
      return this.request.sagaInProgress;
    },
    status() {
      return this.request.penRequestStatusCode;
    },
    ministry() {
      return 'the Ministry of Education and Child Care';
    },
    requestStatuses() {
      return PenRequestStatuses;
    },
    timedout() {
      return Math.floor(new Date() - new Date(this.request.statusUpdateDate)) / (1000*60*60) > 24;
    },
  },
  async created() {
    await this.getNumDaysAllowedInDraftStatus();
  },
  methods: {
    ...mapActions(useConfigStore ,['getNumDaysAllowedInDraftStatus']),
  }
};
</script>

<style scoped>
.pen {
  font-size: 1.2rem;
}

.pen-info {
  line-height: 1.2;
}

</style>

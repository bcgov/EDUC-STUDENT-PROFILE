<template>
  <v-col
    cols="12"
    lg="6"
  >
    <p class="pb-4">
      Status of your request: &nbsp;<strong>{{ statusLabel }}</strong>
    </p>
    <p class="pb-4">
      Status was last updated: &nbsp;<strong>{{ timeSinceLastUpdate.timeSince }}</strong>,
      at {{ timeSinceLastUpdate.dateFormatted }}
    </p>
    <p>
      Request was first Submitted: &nbsp;<strong>{{ timeSinceInitialSubmission.timeSince }}</strong>
      {{ timeSinceInitialSubmission.dateFormatted }}
    </p>
  </v-col>
  <v-col
    v-if="canCreateRequest(status)"
    :class="{'text-right': $vuetify.display.lgAndUp }"
    cols="12"
    lg="6"
  >
    <v-btn
      color="#38598a"
      theme="dark"
      class="ml-2 text-none"
      @click.stop="$router.push({ name: 'gmp-step-1' })"
    >
      {{ newRequestText }}
    </v-btn>
  </v-col>
  <v-col
    v-else-if="status === requestStatuses.DRAFT"
    :class="{'text-right': $vuetify.display.lgAndUp }"
    cols="12"
    lg="6"
  >
    <v-btn
      color="#38598a"
      theme="dark"
      :loading="sending"
      @click.stop="resendVerificationEmail"
    >
      Resend Verification Email
    </v-btn>
  </v-col>
</template>

<script>
import { mapState } from 'pinia';
import { useRootStore } from '../store/root';
import { getRequestStore } from '../store/request';
import { find } from 'lodash';
import moment from 'moment';

import { RequestStatuses } from '../utils/constants';
import ApiService from '../common/apiService';

function getTimeSince(date) {
  return {
    timeSince: date ? moment(date).fromNow() : '',
    dateFormatted: date ? moment(date).format('YYYY-MM-DD LT') : ''
  };
}

export default {
  props: {
    canCreateRequest: {
      type: Function,
      default: () => false
    },
    newRequestText: {
      type: String,
      default: ''
    },
    showFirstSubmission: {
      type: Boolean,
      default: true
    }
  },
  emits: ['success-alert', 'error-alert'],
  data() {
    return {
      sending: false,
    };
  },
  computed: {
    ...mapState(useRootStore, ['requestType']),
    request() {
      return getRequestStore().request;
    },
    statuses() {
      return getRequestStore().statuses;
    },
    statusCodeName() {
      return `${this.requestType}StatusCode`;
    },
    status() {
      return this.request[this.statusCodeName];
    },
    statusLabel() {
      const statusCode = find(this.statuses, [this.statusCodeName, this.status]);
      return statusCode && statusCode.label;
    },
    requestStatuses() {
      return RequestStatuses;
    },
    timedout() {
      return Math.floor(new Date() - new Date(this.request.statusUpdateDate)) / (1000*60*60) > 24;
    },
    timeSinceLastUpdate() {
      return getTimeSince(this.request?.statusUpdateDate);
    },
    timeSinceInitialSubmission() {
      return getTimeSince(this.request?.initialSubmitDate);
    }
  },
  methods: {
    resendVerificationEmail() {
      this.sending = true;
      ApiService.resendVerificationEmail(this.request[`${this.requestType}ID`], this.requestType).then(() => {
        this.$emit('success-alert', 'Your verification email has been sent successfully.');
      }).catch(() => {
        this.$emit(
          'error-alert',
          'Sorry, an unexpected error seems to have occurred. You can click on the resend button again later.'
        );
      }).finally(() =>
        this.sending = false
      );
    },
  }
};
</script>

<style scoped></style>

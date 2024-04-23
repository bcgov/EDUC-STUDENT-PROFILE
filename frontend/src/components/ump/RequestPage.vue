<template>
  <v-container
    v-if="isAuthenticated && hasInflightGMPRequest"
    fluid
    class="full-height"
  >
    <article
      id="request-display-container"
      class="full-height"
    >
      <v-row>
        <v-col
          xs="10"
          sm="8"
          md="6"
          lg="5"
          xl="3"
        >
          <v-card class="student-request-card">
            <v-card-text>
              <p class="ma-0">
                <strong>You have a PEN request in progress. Please wait for it to be completed before requesting
                  updates to you PEN information.</strong>
              </p>
            </v-card-text>
            <v-card-actions>
              <v-row
                align="center"
                justify="center"
              >
                <v-btn
                  id="home-button"
                  class="mb-2"
                  dark
                  color="#003366"
                  @click="$router.push('home')"
                >
                  Home
                </v-btn>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </article>
  </v-container>
  <v-container
    v-else-if="isAuthenticated"
    fluid
    class="full-height"
  >
    <!-- request form -->
    <article
      id="request-form-container"
      class="full-height"
    >
      <v-row>
        <v-col
          cols="12"
          md="10"
          offset-md="1"
          lg="8"
          offset-lg="2"
        >
          <RequestStepper
            :steps="steps"
            :titles="titles"
            step-route-prefix="ump"
          />
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '../../store/auth';
import { usePenRequestStore, useStudentRequestStore } from '../../store/request';
import { useUmpStore } from '../../store/ump';
import { PenRequestStatuses } from '../../utils/constants';
import { pick, values } from 'lodash';

import RequestStepper from '../RequestStepper.vue';

export default {
  name: 'RequestPage',
  components: {
    RequestStepper,
  },
  data() {
    return {
      steps: 3,
      titles: [
        'Current Student Information',
        'Requested Changes to Student Information',
        'Confirm Changes',
        'Submit Changes'
      ],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated', 'userInfo']),
    ...mapState(usePenRequestStore, {penRequest: 'request'}),
    ...mapState(useUmpStore, ['recordedData', 'updateData']),
    hasPen() {
      return !!this.userInfo && !!this.userInfo.pen;
    },
    hasInflightGMPRequest() {
      return this.penRequest && values(pick(PenRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV']))
        .some(status => status === this.penRequest.penRequestStatusCode);
    },
  },
  watch: {
    'updateData.email': function(newVal) {
      if (newVal && this.updateData.email !== this.recordedData.email) {
        this.steps = 4;
      } else if (newVal && this.updateData.email === this.recordedData.email) {
        this.steps = 3;
      }
    },
  },
  mounted() {
    if (!(this.isAuthenticated)) {
      this.$router.push('home');
    }
    this.setRequest();
    this.setUnsubmittedDocuments();
  },
  methods: {
    ...mapActions(useStudentRequestStore, ['setRequest', 'setUnsubmittedDocuments']),
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.full-height {
  height: 100%;
}
.student-request-card {
  background: #F2E8D5;
}
</style>

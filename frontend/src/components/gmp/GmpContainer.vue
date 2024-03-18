<template>
  <v-container
    v-if="!isAuthenticated && !isLoading"
    fluid
  >
    <ModalJourney />
    <!-- login article -->
    <article name="login-banner">
      <v-row
        align="center"
        justify="center"
        style="margin-right: 0;margin-left: 0"
      >
        <LoginRedirect />
      </v-row>
    </article>
  </v-container>

  <v-container
    v-else-if="isLoading || hasCompletedPenRequestButNoStudentLinkage"
    fluid
    class="full-height"
  >
    <article
      id="progress-display-container"
      class="top-banner full-height"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-progress-circular
          :size="60"
          :width="7"
          color="primary"
          indeterminate
        />
      </v-row>
    </article>
  </v-container>

  <v-container
    v-else-if="isAuthenticated && hasPenRequest && requestType === 'penRequest'"
    fluid
    class="full-height"
  >
    <article
      id="request-display-container"
      class="top-banner full-height"
    >
      <v-row
        align="center"
        justify="center"
        style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;"
      >
        <v-col
          class="pt-1 pt-sm-3"
          xs="11"
          sm="11"
          md="10"
          lg="8"
          xl="6"
        >
          <RequestDisplay
            :title="requestTitle"
            :can-create-request="canCreateRequest"
            :new-request-text="newRequestText"
          >
            <template #message>
              <MessageCard />
            </template>
            <template #request>
              <RequestCard :request="request" />
            </template>
          </RequestDisplay>
        </v-col>
      </v-row>
    </article>
  </v-container>

  <v-container
    v-else-if="isAuthenticated && (hasInflightStudentRequest || hasCompletedStudentRequest)"
    fluid
    class="full-height"
  >
    <article
      id="request-display-container"
      class="top-banner full-height"
    >
      <v-row
        align="center"
        justify="center"
        style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;"
      >
        <v-col
          class="pt-1 pt-sm-3"
          xs="10"
          sm="8"
          md="6"
          lg="5"
          xl="3"
        >
          <v-card class="student-request-card">
            <v-card-text>
              <p
                v-if="hasInflightStudentRequest"
                class="ma-0"
              >
                <strong>You have an UpdateMyPEN request in progress.</strong>
              </p>
              <p
                v-else
                class="ma-0"
              >
                <strong>Hi {{ student.legalFirstName || '' }}, you have been provided your PEN and don't need to
                  request it again. Your PEN is {{ student.pen }}.</strong>
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
    <!-- pen request form -->
    <article
      id="request-form-container"
      class="top-banner full-height"
    >
      <v-row
        align="center"
        justify="center"
        style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;"
      >
        <v-col
          xs="10"
          sm="10"
          md="10"
          lg="10"
          xl="10"
        >
          <router-view />
        </v-col>
      </v-row>
    </article>
  </v-container>


  <v-container
    v-else
    fluid
    class="full-height"
  >
    <article
      id="request-form-container"
      class="top-banner full-height"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-skeleton-loader type="image" />
      </v-row>
    </article>
  </v-container>
</template>

<script>
import { PenRequestStatuses, StudentRequestStatuses } from '../../utils/constants';
import { mapState, mapActions } from 'pinia';
import { useRootStore } from '../../store/root';
import { useAuthStore } from '../../store/auth';
import { usePenRequestStore, useStudentRequestStore } from '../../store/request';
import { pick, values } from 'lodash';

import LoginRedirect from '../LoginRedirect.vue';
import RequestDisplay from '../RequestDisplay.vue';
import ModalJourney from '../ModalJourney.vue';
import MessageCard from './MessageCard.vue';
import RequestCard from './RequestCard.vue';

export default {
  components: {
    LoginRedirect,
    RequestDisplay,
    ModalJourney,
    MessageCard,
    RequestCard,
  },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated', 'userInfo', 'isLoading']),
    ...mapState(usePenRequestStore, ['request']),
    ...mapState(useStudentRequestStore, {studentRequest: 'request'}),
    ...mapState(useRootStore, ['student']),
    ...mapState(useRootStore, ['requestType']),
    hasPen() {
      return !!this.student && !!this.student.pen;
    },
    hasPenRequest() {
      return !!this.request;
    },
    requestTitle() {
      return this.request && this.request.penRequestStatusCode === PenRequestStatuses.RETURNED
        ? 'Provide More Info for PEN Request' : 'PEN Request Status';
    },
    newRequestText() {
      return 'Create a new PEN Request';
    },
    hasInflightStudentRequest() {
      return this.studentRequest && values(pick(StudentRequestStatuses, ['DRAFT', 'INITREV', 'RETURNED', 'SUBSREV']))
        .some(status => status === this.studentRequest.studentRequestStatusCode);
    },
    hasCompletedStudentRequest() {
      return this.studentRequest && this.studentRequest.studentRequestStatusCode === StudentRequestStatuses.COMPLETED;
    },
    hasCompletedPenRequestButNoStudentLinkage() {
      return this.request && this.request.penRequestStatusCode === PenRequestStatuses.MANUAL && !this.student;
    },
    hasBcscLinkageForStudent() {
      return this.userInfo?.accountType === 'BCSC' && this.student;
    },
  },
  watch: {
    isLoading(val) {
      if (!val) {
        if (this.hasBcscLinkageForStudent) {
          this.$router.push({ name: 'home' });
        } else if ((!this.hasPenRequest && !this.hasInflightStudentRequest)
          || this.hasCompletedPenRequestButNoStudentLinkage) {
          this.$router.push({ name: 'gmp-step-1' });
        }
      }
    }
  },
  created() {
    this.setRequestType('penRequest');
  },
  methods: {
    ...mapActions(useRootStore, ['setRequestType']),
    canCreateRequest(status) {
      return status === PenRequestStatuses.REJECTED || status === PenRequestStatuses.ABANDONED;
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .container{
    padding: 0px;
  }
  .top-banner{
    background-color: aliceblue;
    background-size: cover;
    align-items: center;
    display: flex;
  }
  .full-height{
    height: 100%;
  }
  .infoTab{
    padding: 10px 0px;
    background-color: #fafafa
  }
  .bottomContainer{
    padding-bottom: 30px
  }

  .student-request-card{
    background: #F2E8D5;
  }
</style>


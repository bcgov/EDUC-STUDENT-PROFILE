<template>
  <v-container
    v-if="!isAuthenticated && !isLoading"
    fluid
    class="full-height"
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
    v-else-if="isLoading"
    align-items="start"
    class="fill-height"
  >
    <v-row
      id="progress-display-container"
      justify="center"
    >
      <v-col class="flex-grow-0">
        <v-progress-circular
          :size="60"
          :width="7"
          color="primary"
          indeterminate
        />
      </v-col>
    </v-row>
  </v-container>
  <v-container
    v-else
    class="full-height"
  >
    <v-row>
      <v-col class="text-center">
        <p>
          If you are currently attending a K-12 school, please request your PEN or update your personal information by
          contacting the main office at your school
        </p>
        <p>
          <a
            href="http://www.bced.gov.bc.ca/apps/imcl/imclWeb/Home.do"
            rel="noopener noreferrer"
            target="_blank"
          >Find your school's contact information</a>
        </p>
      </v-col>
    </v-row>
    <v-row
      justify="center"
      align-content="stretch"
    >
      <v-col
        cols="12"
        lg="4"
        class="px-8"
      >
        <UserStudentCard
          v-if="hasBcscLinkageForStudent"
          class="px-4 py-4"
        />
        <v-card
          v-else
          height="100%"
          prepend-avatar="../assets/images/icon-find-pen.svg"
          title="Get your Personal Education Number (PEN)"
          text="Former students can send a request via an online form to receive their PEN"
          to="gmp"
        />
      </v-col>
      <v-col
        cols="12"
        lg="4"
        class="px-8"
      >
        <v-card
          prepend-avatar="../assets/images/updatemypen.svg"
          title="Update My Pen"
          height="100%"
          to="ump"
        >
          <template #text>
            <p>
              Former students can update their personal information associated with their PEN so that transcripts
              display current legal name
            </p>
            <br>
            <p>
              <strong>You cannot change your Personal Education Number (PEN)</strong>
            </p>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'pinia';
import { useRootStore } from '../store/root';
import { useAuthStore } from '../store/auth';

import LoginRedirect from './LoginRedirect.vue';
import ModalJourney from './ModalJourney.vue';
import UserStudentCard from './UserStudentCard.vue';

export default {
  components: {
    LoginRedirect,
    ModalJourney,
    UserStudentCard,
  },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated', 'isLoading', 'userInfo']),
    ...mapState(useRootStore, ['student']),
    hasBcscLinkageForStudent() {
      return this.userInfo?.accountType === 'BCSC' && this.student;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .top-banner {
    background-size: cover;
    align-items: center;
    display: flex;
  }
  .full-height {
    height: 100%;
  }
</style>


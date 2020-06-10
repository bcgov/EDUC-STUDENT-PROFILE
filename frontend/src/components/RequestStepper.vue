<template>
  <!-- <v-card> -->
    <v-stepper class="mainCard" v-model="stepCount" v-if="dataReady">
      <v-row align-content="center" class="flex-grow-0 pb-5">
        <v-card style="margin-right: 1.4rem;margin-left: 1.4rem" height="100%" width="100%" elevation=0 color="#036"
                class="white--text">
          <v-card-title class="py-3 pl-5"><h1>{{titles[stepCount-1]}}</h1></v-card-title>
        </v-card>
      </v-row>

      <v-stepper-header class="mx-3">
        <template v-for="n in steps">
          <v-stepper-step
            :key="`${n}-step`"
            :complete="stepCount > n"
            :step="n"
          >
            Step {{ n }}
          </v-stepper-step>

          <v-divider
            v-if="n !== steps"
            :key="n"
          ></v-divider>
        </template>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1" class="px-0">
          <CurrentInfo
            @next="nextStep"
          >
          </CurrentInfo>
        </v-stepper-content>
        <v-stepper-content step="2" class="px-0">
          <RequestForm
            @next="nextStep"
            @back="previousStep"
          ></RequestForm>
        </v-stepper-content>
        <v-stepper-content step="3" class="px-0">
          <RequestSummary
            @next="nextStep"
            @back="previousStep"
          ></RequestSummary>
        </v-stepper-content>
        <v-stepper-content step="4" class="px-0">
          <RequestSubmission></RequestSubmission>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>

    <!-- <v-dialog
      v-model="dialog"
      width="500px"
    >
      <v-card>
        <v-card-text class="fullPadding">
          {{ dialogMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#003366"
            class="white--text"
            @click="closeDialog"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
  <!-- </v-card> -->
</template>

<script>
import { mapGetters } from 'vuex';
import CurrentInfo from './CurrentInfo';
import RequestForm from './RequestForm';
import RequestSummary from './RequestSummary';
import RequestSubmission from './RequestSubmission';

export default {
  name: 'requestStepper',
  components: {
    CurrentInfo,
    RequestForm,
    RequestSummary,
    RequestSubmission,
  },
  data() {
    return {
      steps: 3,
      stepCount: 1,
      titles: ['Current Student Information', 'Requested Changes to Student Information', 'Confirm Changes', 'Submit Changes'],
      dialog: false,
      dialogMessage: null,
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('request', ['genders', 'student', 'genderInfo', 'updateData', 'recordedData']),
    dataReady() {
      return !!this.userInfo;
    },
  },
  watch: {
    'updateData.email': function(newVal) {
      if(newVal && this.updateData.email !== this.recordedData.email) {
        this.steps = 4;
      } else if(newVal && this.updateData.email === this.recordedData.email) {
        this.steps = 3;
      }
    },
  },
  methods: {
    setDialog(message) {
      this.dialogMessage = message;
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    nextStep() {
      this.stepCount++;
      window.scrollTo(0,0);
    },
    previousStep() {
      this.stepCount--;
      window.scrollTo(0,0);
    }
  }
};
</script>

<style scoped>
  .mainCard {
    margin: 20px 0;
    padding: 10px;
    width: 100%;
    /* max-width: 900px; */
  }

  .v-dialog {
    max-width: 1vw;
  }

  .v-dialog > .v-card > .v-card__text {
    padding: 24px 24px 20px;
  }

  .v-stepper /deep/ .v-icon {
    padding-left: 2px;
  }

  @media screen and (max-width: 300px) {
    .mainCard {
      margin-top: .1vh;
      padding-top: 10px;
      width: 100%;
      margin-bottom: 8rem;
    }
  }

  @media screen and (min-width: 301px) and (max-width: 600px) {
    .mainCard {
      margin-top: .1vh;
      padding-top: 10px;
      width: 100%;
      margin-bottom: 7rem;
    }
  }

  @media screen and (min-width: 601px) and (max-width: 900px) {
    .mainCard {
      margin-top: .1vh;
      padding-top: 10px;
      width: 100%;
      margin-bottom: 7rem;
    }
  }
</style>

<template>
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
        <v-stepper-content v-for="index in 4" :step="index" :key="index" class="px-0">
          <router-view v-if="stepCount===index" @next="nextStep" @back="previousStep"></router-view>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'requestStepper',
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
    ...mapGetters('ump', ['recordedData', 'updateData']),
    ...mapState('studentRequest', ['request']),
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
    $route: {
      handler() {
        switch (this.$route.name) {
        case 'step1':
          this.stepCount = 1;
          break;
        case 'step2':
          this.stepCount = 2;
          break;
        case 'step3':
          this.stepCount = 3;
          break;
        case 'step4':
          this.stepCount = 4;
        }
        window.scrollTo(0,0);
      }
    }
  },
  methods: {
    goToRoute(name) {
      this.$router.push({ name: name });
    },
    setDialog(message) {
      this.dialogMessage = message;
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    nextStep() {
      this.stepCount++;
      this.goToRoute('step'+this.stepCount);
      window.scrollTo(0,0);
    },
    previousStep() {
      this.stepCount--;
      this.goToRoute('step'+this.stepCount);
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

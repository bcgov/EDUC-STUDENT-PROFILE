<template>
  <v-row class="mb-2">
    <v-col>
      <h1>{{ titles[stepCount-1] }}</h1>
    </v-col>
  </v-row>

  <v-stepper
    v-if="dataReady"
    :model-value="stepCount"
    class="mainCard"
  >
    <v-stepper-header>
      <template
        v-for="n in steps"
        :key="`${n}-step`"
      >
        <v-stepper-item
          :complete="stepCount > n"
          :title="`Step ${n}`"
          :value="n"
        />

        <v-divider
          v-if="n !== steps"
          :key="n"
        />
      </template>
    </v-stepper-header>

    <v-stepper-window>
      <v-stepper-window-item
        v-for="n in steps"
        :key="`content-${n}`"
        :value="n"
        class="px-0"
      >
        <router-view
          @next="nextStep"
          @back="previousStep"
        />
      </v-stepper-window-item>
    </v-stepper-window>
  </v-stepper>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from '../store/auth';

export default {
  name: 'RequestStepper',
  props: {
    steps: {
      type: Number,
      required: true
    },
    titles: {
      type: Array,
      required: true
    },
    stepRoutePrefix: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      stepCount: 1,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['userInfo']),
    dataReady() {
      return !!this.userInfo;
    },
  },
  watch: {
    $route: {
      handler() {
        const thisStep = Number(this.$route.name.slice(-1));
        this.stepCount = isNaN(thisStep) ? -1 : thisStep;
        window.scrollTo(0,0);
      }
    }
  },
  methods: {
    goToRoute(name) {
      this.$router.push({ name: name });
    },
    nextStep() {
      this.goToRoute(`${this.stepRoutePrefix}-step-${this.stepCount + 1}`);
      window.scrollTo(0,0);
    },
    previousStep() {
      this.goToRoute(`${this.stepRoutePrefix}-step-${this.stepCount - 1}`);
      window.scrollTo(0,0);
    }
  }
};
</script>

<style scoped>
  .v-stepper /deep/ .v-icon {
    padding-left: 2px;
  }
</style>

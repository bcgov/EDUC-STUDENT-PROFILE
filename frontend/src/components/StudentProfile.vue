<template>
  <v-container class='full-height'>
    <v-row>
      <v-container>
        <div>
          <strong>Welcome to the Ministry of Education!</strong>
        </div>
        <div>
          Get Started with your Ministry of Education student profile
        </div>
      </v-container>
    </v-row>
    <v-row>
      <v-col sm="12" md="6" lg="4">
        <v-card :class="['container-background', 'pa-2']">
          <h4>Sign into your account</h4>
          <v-container :class="['d-flex', 'flex-column']">
            <a :href="AuthRoutes.LOGIN_BCSC" :class="['mb-2']">
              <PrimaryButton :class="['fill-width']">Sign in with your BC Services Card
              </PrimaryButton>
            </a>
            <a :href="AuthRoutes.LOGIN_BCEID">
              <PrimaryButton :class="['fill-width']">Sign in with a BCeID</PrimaryButton>
            </a>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
import {AuthRoutes} from '../utils/constants';

import PrimaryButton from './util/PrimaryButton';

export default {
  name: 'StudentProfile',
  data() {
    return {
      AuthRoutes
    };
  },
  components: {
    PrimaryButton,
  }
};
</script>

<style scoped>
.full-height {
  height: 100%;
}

.container-background {
  background-color: #F2F2F2;
}

.fill-width {
  width: 100%;
}

</style>

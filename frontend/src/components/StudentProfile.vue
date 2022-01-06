<template>
  <v-container class='full-height'>
    <v-row>
      <v-col sm="12" md="6" lg="4">
        <v-container>
          <div>
            <strong>Welcome to the Ministry of Education!</strong>
          </div>
          <div class='pb-5'>
            Get Started with your Ministry of Education student profile
          </div>
          <v-card :class="['container-background', 'pa-2']">
            <h4>Sign into your account</h4>
            <v-container :class="['d-flex', 'flex-column', this.$vuetify.breakpoint.name === 'xs' ? '' : 'fit-content']">
              <PrimaryButton class='mb-2'>Sign in with your BC Services Card</PrimaryButton>
              <PrimaryButton>Sign in with a BCeID</PrimaryButton>
            </v-container>
          </v-card>
        </v-container>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
import PrimaryButton from './util/PrimaryButton';

export default {
  name: 'StudentProfile',
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

.fit-content {
  width: fit-content;
}

</style>

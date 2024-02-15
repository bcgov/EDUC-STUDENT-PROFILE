<template>
  <v-container
    v-if="isAuthenticated && !hasPen"
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
      >
        <v-col
          xs="8"
          sm="8"
          md="8"
          lg="8"
          xl="8"
        >
          <RequestStepper
            :steps="steps"
            :titles="titles"
            step-route-prefix="gmp-"
          />
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import RequestStepper from '../RequestStepper';
import { mapState } from 'pinia';
import { useAuthStore } from '../../store/auth';

export default {
  name: 'RequestPage',
  components: {
    RequestStepper,
  },
  data() {
    return {
      steps: 3,
      titles: ['PEN Request Form', 'Confirm Information', 'PEN Request Status'],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated', 'userInfo']),
    hasPen() {
      return !!this.userInfo && !!this.userInfo.pen;
    },
  },
  mounted() {
    if(!(this.isAuthenticated)){
      this.$router.push('home');
    }
  },
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
</style>

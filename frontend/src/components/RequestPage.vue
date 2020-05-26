<template>
  <v-container fluid class="full-height" v-if="isAuthenticated && !hasPen">
    <!-- request form -->
    <article id="request-form-container" class="top-banner full-height">
      <v-row align="center" justify="center">
        <v-col xs="10" sm="10" md="10" lg="10" xl="10">
        <RequestStepper></RequestStepper>
        </v-col>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import RequestStepper from './RequestStepper';
import { mapGetters } from 'vuex';
export default {
  name: 'requestPage',
  components: {
    RequestStepper,
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'userInfo']),
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
  padding-bottom: 50px;
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

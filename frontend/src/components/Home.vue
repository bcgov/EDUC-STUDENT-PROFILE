<!--suppress ALL -->
<template>
  <v-container fluid v-if="!isAuthenticated && !isLoading">
    <ModalJourney/>
    <!-- login article -->
    <article name="login-banner">
        <v-row align="center" justify="center" style="margin-right: 0;margin-left: 0">
          <Login></Login>
        </v-row>
    </article>
  </v-container>

  <v-container fluid class="full-height" v-else-if="isLoading">
    <article id="progress-display-container" class="top-banner full-height">
      <v-row align="center" justify="center">
        <v-progress-circular
                :size="60"
                :width="7"
                color="primary"
                indeterminate
        ></v-progress-circular>
      </v-row>
    </article>
  </v-container>

  <v-container fluid class="home-cards" v-else>
    <v-row justify=center align=center>
      <v-col cols="6">
        <v-card>
          <v-card-actions>
            <router-link to="gmp">Get My PEN</router-link>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card>
          <v-card-actions>
            <router-link to="ump">Update My PEN Info</router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Login from './Login';
import ModalJourney from './ModalJourney';
import { mapGetters } from 'vuex';

export default {
  name: 'home',
  components: {
    Login,
    ModalJourney,
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'isLoading']),
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
  .home-cards{
    max-width:80%;
    margin: 2rem;
    padding-bottom: 1vh;
  }
</style>


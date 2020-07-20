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

  <v-container fluid v-else :class="{'min-height-xs': $vuetify.breakpoint.smAndDown, 'min-height-md': $vuetify.breakpoint.mdOnly  }">
    <v-row justify=center>
      <v-col cols="12" lg="6" class="px-8">
        <v-card :class="{'px-16': $vuetify.breakpoint.lgAndUp }" class="px-4 py-4" style="height: 100%;">
          <p style="text-align:center">
            <router-link to="gmp">
              <img alt="Find PEN" src="@/assets/images/icon-find-pen.svg" style="display:block; float:initial; margin:auto" title="Find PEN">Find your Personal Education<br>Number (PEN)
            </router-link>
          </p>
          <ul style="text-align:left; list-style-position: outside;" :class="{'px-16': $vuetify.breakpoint.lgOnly }">
            <li>
              Former students can send a request via an online form to find and return your PEN
            </li>
            <li>
              If you are currently attending a K-12 school, please request your PEN by contacting the main office at your school
              <ul>
                <li><a href="http://www.bced.gov.bc.ca/apps/imcl/imclWeb/Home.do" rel="noopener noreferrer" target="_blank">Find your school's contact information</a></li>
              </ul>
            </li>
          </ul>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6" class="px-8">
        <v-card :class="{'px-16': $vuetify.breakpoint.lgAndUp }" class="px-4 py-4" style="height: 100%;">
          <p style="text-align:center">
            <router-link to="ump">
              <img alt="Update My PEN" src="@/assets/images/updatemypen.svg" style="display:block; float:initial; margin:auto" title="Find PEN">Update your PEN information
            </router-link>
          </p>
          <ul style="text-align:left; list-style-position: outside;" :class="{'px-16': $vuetify.breakpoint.lgAndUp }">
            <li>
              Former students can update their personal information associated with their PEN so that transcripts show current name
            </li>
            <li>
              If you are currently attending a K-12 school, please request these changes by contacting the main office at your school
              <ul>
                <li><a href="http://www.bced.gov.bc.ca/apps/imcl/imclWeb/Home.do" rel="noopener noreferrer" target="_blank">Find your school's contact information</a></li>
              </ul>
            </li>
            <li>
              You cannot change your Personal Education Number (PEN)
            </li>
          </ul>
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
  .top-banner{
    background-color: aliceblue;
    background-size: cover;
    align-items: center;
    display: flex;
  }
  .full-height{
    height: 100%;
  }
  .min-height-xs{
    min-height: 48em;
  }
  .min-height-md{
    min-height: 24em;
  }
</style>


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

  <v-container fluid class="full-height" v-else-if="isAuthenticated && hasPenRequest">
    <article id="request-display-container" class="top-banner full-height">
        <v-row align="center" justify="center" style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;">
          <v-col class="pt-1 pt-sm-3" xs="11" sm="11" md="10" lg="8" xl="6">
            <RequestDisplay 
              :title="requestTitle"
              :can-create-request="canCreateRequest"
              :new-request-text="newRequestText"
            >
              <template v-slot:message>
                <MessageCard></MessageCard>
              </template>
              <template v-slot:request>
                <RequestCard :request="request"></RequestCard>
              </template>
            </RequestDisplay>
          </v-col>
        </v-row>
    </article>
  </v-container>

  <v-container fluid class="full-height" v-else-if="isAuthenticated && !hasPen && !hasPenRequest">
    <!-- pen request form -->
    <article id="request-form-container" class="top-banner full-height">
        <v-row align="center" justify="center" style="width: 1vw;margin-right: 0;margin-left: 0;margin-bottom: 5rem;">
          <v-col xs="10" sm="10" md="10" lg="10" xl="10">
            <RequestForm></RequestForm>
          </v-col>
        </v-row>
    </article>
  </v-container>


  <v-container fluid class="full-height" v-else>
    <article id="request-form-container" class="top-banner full-height">
      <v-row align="center" justify="center">
        <v-skeleton-loader type="image"></v-skeleton-loader>
      </v-row>
    </article>
  </v-container>
</template>

<script>
import Login from '../Login';
import RequestForm from './RequestForm';
import RequestDisplay from '../RequestDisplay';
import ModalJourney from '../ModalJourney';
import MessageCard from './MessageCard';
import RequestCard from './RequestCard';
import { PenRequestStatuses } from '@/utils/constants';
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'home',
  components: {
    Login,
    RequestForm,
    RequestDisplay,
    ModalJourney,
    MessageCard,
    RequestCard,
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'userInfo', 'isLoading']),
    ...mapGetters('penRequest', ['request']),
    ...mapGetters(['student']),
    hasPen() {
      return !!this.student && !!this.student.pen;
    },
    hasPenRequest() {
      return !!this.request;
    },
    requestTitle() {
      return this.request && this.request.penRequestStatusCode === PenRequestStatuses.RETURNED ? 'Provide More Info for PEN Request' : 'PEN Request Status';
    },
    newRequestText() {
      return 'Create a new PEN Request';
    }
  },
  created() {
    this.setRequestType('penRequest');
  },
  methods: {
    ...mapMutations(['setRequestType']),
    canCreateRequest(status) {
      return status === PenRequestStatuses.REJECTED || status === PenRequestStatuses.ABANDONED;
    },
  }
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
  .infoTab{
    padding: 10px 0px;
    background-color: #fafafa
  }
  .bottomContainer{
    padding-bottom: 30px
  }
</style>


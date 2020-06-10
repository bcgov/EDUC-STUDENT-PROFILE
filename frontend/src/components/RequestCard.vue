<template>
  <v-card height="100%" width="100%" elevation=0>
    <v-card-subtitle class="px-1">
      <span style="font-size: 1.3rem;font-weight: bolder; color: #333333">Student Information</span>
    </v-card-subtitle>
    <v-container fluid class="pt-0 px-1">
      <slot name="hint"></slot>
      <v-row no-gutters>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="mb-0">Name:</p>
        </v-col>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="ml-2 mb-0 names"><strong>{{fullName}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="mb-0">Birthdate:</p>
        </v-col>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="ml-2 mb-0"><strong>{{ request.dob ? moment(request.dob).format('MMMM D, YYYY'):'' }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="mb-3">Gender:</p>
        </v-col>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="ml-2 mb-3"><strong>{{ genderLabel }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <p class="mb-0">
          <strong>
            Contact Information
          </strong>
        </p>
      </v-row>
      <v-row no-gutters>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="mb-3">E-mail address:</p>
        </v-col>
        <v-col xl="auto" lg="auto" md="auto" sm="auto">
          <p class="ml-2 mb-3"><strong>{{ request.email }}</strong></p>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'requestCard',
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  computed: {
    ...mapGetters('request', ['genderInfo']),
    genderLabel() { 
      return this.request.genderCode && this.genderInfo(this.request.genderCode).label;
    },
    fullName() {
      return [this.request.legalFirstName, this.request.legalMiddleNames, this.request.legalLastName].filter(Boolean).join(' ').toUpperCase();
    }
  },
};
</script>

<style scoped>
.v-toolbar /deep/ .v-toolbar__content {
  padding-left: 20px !important;
}

.names {
  text-transform: uppercase;
}
</style>

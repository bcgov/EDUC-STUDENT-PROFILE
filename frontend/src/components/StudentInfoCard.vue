<template>
  <v-row>
    <v-col>
      <h3 class="info-card-title pb-4">
        Student Information
      </h3>
    </v-col>
  </v-row>
  <slot name="hint" />
  <v-row no-gutters>
    <v-col
      xl="2"
      lg="2"
      md="2"
      sm="3"
      xs="3"
    >
      <p class="mb-0">
        Name:
      </p>
    </v-col>
    <v-col
      xl="9"
      lg="9"
      md="9"
      sm="8"
      xs="8"
    >
      <p class="ml-2 mb-0 names">
        <strong>{{ fullName }}</strong>
      </p>
    </v-col>
  </v-row>
  <v-row no-gutters>
    <v-col
      xl="2"
      lg="2"
      md="2"
      sm="3"
      xs="3"
    >
      <p class="mb-0">
        Birthdate:
      </p>
    </v-col>
    <v-col
      xl="9"
      lg="9"
      md="9"
      sm="8"
      xs="8"
    >
      <p class="ml-2 mb-0">
        <strong>{{ formatDob(request?.dob) }}</strong>
      </p>
    </v-col>
  </v-row>
  <slot name="info" />
  <v-row no-gutters>
    <p class="mb-0">
      <strong>
        Contact Information
      </strong>
    </p>
  </v-row>
  <v-row no-gutters>
    <v-col
      xl="2"
      lg="2"
      md="2"
      sm="3"
      xs="3"
    >
      <p class="mb-3">
        E-mail address:
      </p>
    </v-col>
    <v-col
      xl="9"
      lg="9"
      md="9"
      sm="8"
      xs="8"
    >
      <p class="ml-2 mb-3">
        <strong>{{ request.email }}</strong>
      </p>
    </v-col>
  </v-row>
</template>

<script>
import { formatDob } from '../utils/dateTime';

export default {
  name: 'StudentInfoCard',
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  computed: {
    fullName() {
      return [this.request.legalFirstName, this.request.legalMiddleNames, this.request.legalLastName]
        .filter(Boolean).join(' ').toUpperCase();
    },
  },
  methods: { formatDob }
};
</script>

<style scoped>
.v-toolbar /deep/ .v-toolbar__content {
  padding-left: 20px !important;
}

.names {
  text-transform: uppercase;
}

.info-card-title {
  font-size: 1.3rem;
  font-weight: bolder;
  color: #333333;
}
</style>

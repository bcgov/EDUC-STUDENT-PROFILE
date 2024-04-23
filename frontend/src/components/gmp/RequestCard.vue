<template>
  <v-row>
    <v-col>
      <h2>
        Data Submitted
      </h2>
    </v-col>
  </v-row>
  <v-row no-gutters>
    <v-col cols="12">
      <v-table density="compact">
        <tbody>
          <tr>
            <td>Legal Last Name:</td>
            <td><strong>{{ request.legalLastName }}</strong></td>
          </tr>
          <tr>
            <td>Legal First Names:</td>
            <td><strong>{{ request.legalFirstName }}</strong></td>
          </tr>
          <tr>
            <td>Legal Middle Names:</td>
            <td><strong>{{ request.legalMiddleNames }}</strong></td>
          </tr>
          <tr>
            <td>Usual Last Name:</td>
            <td><strong>{{ request.usualLastName }}</strong></td>
          </tr>
          <tr>
            <td>Usual First Names:</td>
            <td><strong>{{ request.usualFirstName }}</strong></td>
          </tr>
          <tr>
            <td>Usual Middle Names:</td>
            <td><strong>{{ request.usualMiddleName }}</strong></td>
          </tr>
          <tr>
            <td>Maiden Name:</td>
            <td><strong>{{ request.maidenName }}</strong></td>
          </tr>
          <tr>
            <td>Past Names:</td>
            <td><strong>{{ request.pastNames }}</strong></td>
          </tr>
          <tr>
            <td>Date of Birth:</td>
            <td><strong>{{ formatDob(request?.dob) }}</strong></td>
          </tr>
          <tr>
            <td>Current BC School:</td>
            <td><strong>{{ request.currentSchool }}</strong></td>
          </tr>
          <tr>
            <td>Last BC School:</td>
            <td><strong>{{ request.lastBCSchool }}</strong></td>
          </tr>
          <tr>
            <td>School Student ID:</td>
            <td><strong>{{ request.lastBCSchoolStudentNumber }}</strong></td>
          </tr>
          <tr>
            <td>Email:</td>
            <td><strong>{{ request.email }}</strong></td>
          </tr>
          <tr>
            <td>ID Type:</td>
            <td><strong>{{ userInfo.identityTypeLabel }}</strong></td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from '../../store/auth';
import { formatDob } from '../../utils/dateTime';

export default {
  name: 'RequestCard',
  props: {
    request: {
      type: Object,
      required: true
    },
  },
  computed: {
    ...mapState(useAuthStore, ['userInfo']),
  },
  methods: { formatDob }
};
</script>

<style scoped>
.v-toolbar /deep/ .v-toolbar__content {
  padding-left: 20px !important;
}
</style>

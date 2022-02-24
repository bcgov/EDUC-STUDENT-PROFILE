<template>
  <v-card height="100%" width="100%">
    <v-card-subtitle class="px-1 info-card-title">
      Your Student Record
    </v-card-subtitle>
    <v-container fluid class="pt-0 px-1">
      <v-row no-gutters>
        <p>
          Below are the details of your student record at the Ministry of Education
        </p>
      </v-row>
      <v-row no-gutters>
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-1">PEN:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-1"><strong>{{student.pen}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-1">Legal Last Name:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-1"><strong>{{student.legalLastName}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-1">Legal First Name(s):</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-1"><strong>{{student.legalFirstName}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-1">Legal Middle Name(s):</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-1"><strong>{{student.legalMiddleNames}}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-1">Date of Birth:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-1"><strong>{{ student.dob }}</strong></p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <p class="mb-1">
          <strong>
            Contact Information
          </strong>
        </p>
      </v-row>
      <v-row no-gutters>
        <v-col xl="4" lg="4" md="4" sm="4">
          <p class="mb-1">E-mail:</p>
        </v-col>
        <v-col xl="4" lg="5" md="5" sm="5">
          <p class="mb-1"><strong>{{ student.email }}</strong></p>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'UserStudentCard',
  computed: {
    ...mapGetters(['student']),
  },
};
</script>

<style scoped>
.names {
  text-transform: uppercase;
}

.info-card-title {
  font-size: 1.3rem;
  font-weight: bolder;
  color: #333333;
}
</style>

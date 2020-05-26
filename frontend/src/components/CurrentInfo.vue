<template>
  <div>
    <!-- <v-row align-content="center" class="flex-grow-0 pb-5">
      <v-card style="margin-right: 1.4rem;margin-left: 1.4rem" height="100%" width="100%" elevation=0 color="#036"
              class="white--text">
        <v-card-title class="py-3 pl-5"><h1>Current Student Information</h1></v-card-title>
      </v-card>
    </v-row> -->

    <!-- <v-card color="#FFECA9" class="pa-3 mb-8 mx-3"> -->
    <v-alert outlined class="pa-3 mb-3 mx-3 bootstrap-warning">
      <h3>Guidance:</h3>
      <ul class="pt-2">
        <li>This process can only be completed by the owner of the PEN</li>
        <li>This process can only be completed if you have already graduated from high school. If you are still attending a K-12 school, request changes at your school</li>
        <li>If your name and/or gender has been legally changed, proof of this change may be requested</li>
      </ul>
    </v-alert>
    <!-- </v-card> -->
    <v-card-subtitle><span style="font-size: 1.3rem;font-weight: bolder; color: #333333">Below is your current information as it appears in your school record</span>
    </v-card-subtitle>

    <v-form>
      <v-container fluid class="py-0">
        <v-row>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedPen'
              :value="student.pen"
              color="#003366"
              outlined
              hint="Personal Education Number (PEN), EG 123456789"
              persistent-hint
              readonly
              dense
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedLegalFirstName'
              :value="student.legalFirstName"
              color="#003366"
              outlined
              hint="Recorded Legal First Name(s) "
              persistent-hint
              readonly
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedLegalMiddleNames'
              :value="student.legalMiddleNames"
              color="#003366"
              outlined
              hint="Recorded Legal Middle Name(s)"
              persistent-hint
              readonly
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedLegalLastName'
              :value="student.legalLastName"
              color="#003366"
              outlined
              hint="Recorded Legal Last Name"
              persistent-hint
              readonly
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedDob'
              color="#003366"
              outlined
              :value="moment(student.dob).format('MMMM D, YYYY')"
              hint="Recorded Birthdate"
              persistent-hint
              readonly
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedGender'
              color="#003366"
              outlined
              :value="genderLabel"
              hint="Recorded Gender"
              persistent-hint
              readonly
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedEmail'
              :value="student.email"
              color="#003366"
              outlined
              hint="Recorded E-mail Address"
              persistent-hint
              readonly
              dense
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row class="justify-end">
          <v-card-actions>
            <v-btn
              color="#003366"
              class="white--text align-self-center"
              id="next-step"
              @click="nextStep"
            >
              Next
            </v-btn>
          </v-card-actions>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import moment from 'moment';

export default {
  name: 'currentInfo',
  props: {
    genderLabel: {
      type: String,
      required: true
    },
    nextStep: {
      type: Function,
      required: true
    },
  },
  computed: {
    ...mapGetters('request', ['student']),
  },
  methods: {
    moment,
  }
};
</script>

<style scoped>

</style>

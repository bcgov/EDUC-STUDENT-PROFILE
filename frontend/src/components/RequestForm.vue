<template>
  <div>
    <!-- <v-row align-content="center" class="flex-grow-0 pb-5">
      <v-card style="margin-right: 1.4rem;margin-left: 1.4rem" height="100%" width="100%" elevation=0 color="#036"
              class="white--text">
        <v-card-title class="py-3 pl-5"><h1>Requested Changes to Student Information</h1></v-card-title>
      </v-card>
    </v-row> -->

    <v-alert
      dense
      outlined
      dismissible
      v-model="alert"
      class="pa-3 mb-3 mx-3 bootstrap-error"
    >
      {{ alertMessage }}
    </v-alert>

    <!-- <v-card color="#FFECA9" class="pa-3 mb-8 mx-3"> -->
    <v-alert outlined class="pa-3 mb-3 mx-3 bootstrap-warning">
      <h3>Guidance:</h3>
      <ul class="pt-2">
        <li>This form can only be completed by the owner of the PEN</li>
        <li>This form can only be completed if you have already graduated from high school. If you are still attending a K-12 school, request changes at your school</li>
        <li>If your name and/or gender has been legally changed, proof of this change may be requested</li>
      </ul>
    </v-alert>
    <!-- </v-card> -->

    <v-container fluid class="py-0">
      <v-row>
        <v-col cols="12" class="declaration py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
          <v-checkbox
            v-model="declared"
            color="green"
            class="mt-0"
            :rules="privacyRule('')"
          >
            <template v-slot:label>
              <div class="pl-3">
                I declare that I am submitting a student data change request on my own behalf. Update personal data as indicated below
              </div>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
    </v-container>

    <v-alert outlined class="pa-3 mb-3 mx-3 bootstrap-warning">
      <span>Check fields that need to be updated.  Leave fields that do not require changes unchecked</span>
    </v-alert>

    <v-form autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
      ref="form" id="requestForm"
      v-model="validForm"
    >

      <v-card-subtitle class="mb-2">
        <span style="font-size: 1.3rem;font-weight: bolder; color: #333333">Student Information</span>
      </v-card-subtitle>

      <v-container fluid class="py-0">
        <v-row>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                class="pt-0 pr-2 mt-0"
                v-model="editLegalFirstName"
                label="Edit"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-text-field
                id='legalFirstName'
                v-model="request.legalFirstName"
                color="#003366"
                hint="As shown on current Government Photo ID"
                :persistent-hint="!enableDisableForm.disabled && editLegalFirstName"
                outlined
                label="Current Legal First Name(s) (optional)"
                :disabled="enableDisableForm.disabled || !editLegalFirstName"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="40"
                dense
                :rules="charRules"
              ></v-text-field>
            </v-container>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                class="pt-0 pr-2 mt-0"
                v-model="editLegalMiddleNames"
                label="Edit"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-text-field
                id='legalMiddleNames'
                v-model="request.legalMiddleNames"
                color="#003366"
                hint="As shown on current Government Photo ID"
                :persistent-hint="!enableDisableForm.disabled && editLegalMiddleNames"
                outlined
                label="Current Legal Middle Name(s) (optional)"
                :disabled="enableDisableForm.disabled || !editLegalMiddleNames"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="255"
                dense
                :rules="charRules"
              ></v-text-field>
            </v-container>
          </v-col>
          <v-col cols="12" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                class="pt-0 pr-2 mt-0"
                v-model="editLegalLastName"
                label="Edit"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-text-field
                id='legalLastName'
                v-model="request.legalLastName"
                color="#003366"
                outlined
                :rules="charRules"
                :hint="legalLastNameHint"
                :persistent-hint="!enableDisableForm.disabled && editLegalLastName"
                label="Current Legal Last Name (optional)"
                :disabled="enableDisableForm.disabled || !editLegalLastName"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="40"
                dense
              ></v-text-field>
            </v-container>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                class="pt-0 pr-2 mt-0"
                v-model="editBirthdate"
                label="Edit"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    color="#003366"
                    outlined
                    :value="request.dob ? moment(request.dob).format('MMMM D, YYYY'):''"
                    :rules="requiredRules(dobHint)"
                    label="Birthdate"
                    readonly
                    v-on="on"
                    id="birthdate"
                    :disabled="enableDisableForm.disabled || !editBirthdate"
                    @keyup="focusBirthdateField"
                    ref="birthdate"
                    autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                    dense
                  ></v-text-field>
                </template>
                <v-date-picker
                  id='dob'
                  color="#003366"
                  ref="picker"
                  v-model="request.dob"
                  show-current
                  :max="new Date(this.localDate.now().minusYears(5).toString()).toISOString().substr(0, 10)"
                  min="1903-01-01"
                  @change="save"
                ></v-date-picker>
              </v-menu>
            </v-container>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                class="pt-0 pr-2 mt-0"
                v-model="editGenderLabel"
                label="Edit"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-select
                id='gender'
                color="#003366"
                v-model="genderLabelChanged"
                :rules="requiredRules(genderHint)"
                outlined
                :items="genderLabels"
                :hint="genderHint"
                :persistent-hint="!enableDisableForm.disabled && editGenderLabel"
                label="Current Gender"
                :disabled="enableDisableForm.disabled || !editGenderLabel"
                dense
              ></v-select>
            </v-container>
          </v-col>
        </v-row>
      </v-container>

      <v-card-subtitle class="mb-2">
        <span style="font-size: 1.3rem;font-weight: bolder; color: #333333">Contact Information</span>
      </v-card-subtitle>

      <v-container fluid class="py-0">
        <v-row>
          <v-col cols="12" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                class="pt-0 pr-2 mt-0"
                v-model="editEmail"
                label="Edit"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-text-field
                id='email'
                v-model="request.email"
                :rules="emailRules"
                color="#003366"
                :hint="emailHint"
                outlined
                label="E-mail Address"
                :disabled="enableDisableForm.disabled || !editEmail"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="255"
                dense
              ></v-text-field>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid noPadding>
        <v-row>
          <v-col cols="12" class="declaration py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-checkbox id="acceptance_chk"
              v-model="acceptance"
              color="green"
              class="mt-0"
              :rules="acceptanceRule('')"
              @click.native="clickAcceptance"
            >
              <template v-slot:label>
                <div class="pl-3">
                  The personal demographic data provided above is complete and accurate.
                </div>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
        <v-row>
          <v-col id="confidential_information" cols="12" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-card height="100%" width="100%" elevation=2
                    class="black--text pa-4">
              <p>
                <strong>CONFIDENTIAL INFORMATION.</strong> The information collected on this form will be used to 
                verify your identity for the purposes of communicating your personal education number to you, 
                and may also be used to update your PEN file. All information provided on this form will be 
                administered in accordance with the Freedom of Information and Protection of Privacy Act. 
                For more information regarding the use of your personal information provided on this form, 
                please contact the Student Information Services Branch, Data Management Unit, Ministry of 
                Education.
              </p>
            </v-card>
          </v-col>
        </v-row>
        <v-row class="justify-end">
          <v-col cols="12" sm="2" class="align-self-center py-0 px-0">
            <v-card-actions class="justify-end">
              <v-btn
                color="#003366"
                class="white--text align-self-center"
                id="previous-step"
                @click="previousStep"
              >
                Back
              </v-btn>
              <v-btn
                color="#003366"
                class="white--text align-self-center"
                id="next-step"
                @click="validateRequestForm"
                :disabled="!validForm"
              >
                Next
              </v-btn>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex';
import {LocalDate} from '@js-joda/core';
import { isEqual } from 'lodash';
import moment from 'moment';

export default {
  name: 'requestForm',
  props: {
    recordedData: {
      type: Object,
      required: true
    },
    request: {
      type: Object,
      required: true
    },
    genderLabel: {
      type: String,
      required: true
    },
    changeRequest: {
      type: Function,
      required: true
    },
    nextStep: {
      type: Function,
      required: true
    },
    previousStep: {
      type: Function,
      required: true
    },
  },
  data() {
    return {
      localDate:LocalDate,
      genderLabels: [],
      genderHint: 'As shown on current Government Photo ID',
      legalLastNameHint: 'As shown on current Government Photo ID. Note, If you have ONE name only – enter it into the Legal Last Name field and leave Legal First Name blank',
      emailHint: 'Valid Email Required',
      dobHint: 'Valid Birthdate Required',
      menu: false,
      validForm: false,
      submitting: false,

      alert: false,
      alertMessage: null,

      genderLabelChanged: null,
      declared: false,
      acceptance: false,
      
      editLegalLastName: false,
      editLegalFirstName: false,
      editLegalMiddleNames: false,
      editBirthdate: false,
      editGenderLabel: false,
      editEmail: false,
      enableDisableForm: {
        disabled: true
      },
    };
  },
  computed: {
    ...mapGetters('request', ['genders', 'student']),
    emailRules() {
      return [
        v => !!v || this.emailHint,
        v => /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v) || this.emailHint,
      ];
    },
    charRules() {
      return [
        v => !(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(v)) || 'Enter English characters only'
      ];
    },
  },
  watch: {
    menu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'));
    },
    editLegalLastName(val) {
      this.request.legalLastName = val ? '' : this.student.legalLastName;
    },
    editLegalFirstName(val) {
      this.request.legalFirstName = val ? '' : this.student.legalFirstName;
    },
    editLegalMiddleNames(val) {
      this.request.legalMiddleNames = val ? '' : this.student.legalMiddleNames;
    },
    editBirthdate(val) {
      this.request.dob = val ? '' : this.student.dob;
    },
    editGenderLabel(val) {
      this.genderLabelChanged = val ? '' : this.genderLabel;
    },
    editEmail(val) {
      this.request.email = val ? '' : this.student.email;
    },    
  },
  created() {
    this.genderLabels = this.genders.map(a => a.label);
    this.genderLabelChanged = this.genderLabel;
  },
  methods: {
    moment,
    ...mapMutations('request', ['setRequest']),
    ...mapActions('request', ['postRequest']),
    requiredRules(hint = 'Required') {
      return [
        v => !!(v && v.trim()) || hint,
        ...this.charRules
      ];
    },
    privacyRule(hint = 'Required') {
      this.enableDisableForm.disabled = !this.declared;
      return [v => !!v || hint];
    },
    acceptanceRule(hint = 'Required') {
      this.validForm = (this.validForm && this.declared && this.acceptance);
      return [v => !!v || hint];
    },
    save(date) {
      this.$refs.menu.save(date);
      this.$refs.birthdate.$el.querySelectorAll('#birthdate')[0].focus();
    },
    validate() {
      this.$refs.form.validate();
    },
    setNoChangeErrorDialog() {
      this.alertMessage = 'Please fill in fields that you want to update in the form.';
      this.alert = true;
      window.scrollTo(0,0);
    },
    validateRequestForm() {
      this.validate();
      if (this.validForm) {
        const code = this.genders.filter(it => (it.label === this.genderLabelChanged));
        this.request.genderCode = code[0].genderCode;

        if(isEqual(this.request, this.recordedData)) {
          this.setNoChangeErrorDialog();
        } else {
          this.changeRequest(this.request);
          this.nextStep();
        }
      }
    },
    closeDialog() {
      this.dialog = false;
    },
    clickAcceptance() {
      if(this.acceptance) {
        this.validate();
      }
    },      
    focusBirthdateField(event) {
      if(event.key === 'Tab' && event.type === 'keyup') {
        this.menu = true;
      }
    }
  }
};
</script>

<style scoped>

  input[autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"]::-webkit-contacts-auto-fill-button {
    visibility: hidden;
    display: none !important;
    pointer-events: none;
    height: 0;
    width: 0;
    margin: 0;
  }

  .v-dialog {
    max-width: 1vw;
  }

  .declaration /deep/ .v-icon {
    padding-left: 2px;
  }

  .v-input--checkbox /deep/ .v-icon {
    padding-left: 2px;
  }

 /* .v-input--checkbox /deep/ .v-input--selection-controls__input {
    margin-right: 4px;
  } */

  .v-dialog > .v-card > .v-card__text {
    padding: 24px 24px 20px;
  }

  .noPadding {
    padding-top: 0;
    margin-top: 0;
  }

  .top_group {
    padding-top: 15px;
  }

  .bottom_group {
    padding-bottom: 15px;
  }
</style>

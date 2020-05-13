<template>
  <v-card class="mainCard" v-if="dataReady">
    <v-row align-content="center" class="flex-grow-0 pb-5">
      <v-card style="margin-right: 1.4rem;margin-left: 1.4rem" height="100%" width="100%" elevation=0 color="#036"
              class="white--text">
        <v-card-title class="py-3 pl-5"><h1>Student Profile Update Request Form</h1></v-card-title>
      </v-card>
    </v-row>

    <v-card color="#FFECA9" class="pa-3 mb-8 mx-3">
      <h3>Guidance:</h3>
      <ul class="pt-2">
        <li>This form can only be completed by the owner of the PEN</li>
        <li>This form can only be completed if you have already graduated from high school. If you are still attending a K-12 school, request changes at your school</li>
        <li>If your name and/or gender has been legally changed, proof of this change may be requested</li>
      </ul>
    </v-card>
    <v-card-subtitle><span style="font-size: 1.3rem;font-weight: bolder; color: #333333">Student Information</span>
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
              label="Personal Education Number (PEN)"
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
              label="Recorded Legal Last Name"
              readonly
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedLegalFirstName'
              :value="student.legalFirstName"
              color="#003366"
              outlined
              label="Recorded Legal First Name(s) "
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
              label="Recorded Legal Middle Name(s)"
              readonly
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-text-field
              id='recordedDob'
              color="#003366"
              outlined
              :value="student.dob"
              label="Recorded Birthdate"
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
              label="Recorded Gender"
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
              label="E-mail Address"
              readonly
              dense
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-form>

    <v-form autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
      ref="form" id="requestForm"
      v-model="validForm"
    >

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
        <v-row>
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
                v-model="userPost.legalLastName"
                color="#003366"
                outlined
                :rules="charRules"
                :hint="legalLastNameHint"
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
                v-model="editLegalFirstName"
                label="Edit"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-text-field
                id='legalFirstName'
                v-model="userPost.legalFirstName"
                color="#003366"
                hint="As shown on current Government Photo ID"
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
                v-model="userPost.legalMiddleNames"
                color="#003366"
                hint="As shown on current Government Photo ID"
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
                    v-model="userPost.dob"
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
                  v-model="userPost.dob"
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
                v-model="genderLabel"
                :rules="requiredRules(genderHint)"
                outlined
                :items="genderLabels"
                :hint="genderHint"
                label="Current Gender"
                :disabled="enableDisableForm.disabled || !editGenderLabel"
                dense
              ></v-select>
            </v-container>
          </v-col>
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
                v-model="userPost.email"
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
                id="submit_form"
                @click="submitRequestForm"
                :disabled="!validForm"
                :loading="submitting"
              >
                Submit
              </v-btn>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <v-dialog
      v-model="dialog"
      width="500px"
    >
      <v-card>
        <v-card-text class="fullPadding">
          {{ dialogMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#003366"
            class="white--text"
            @click="closeDialog"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex';
import {LocalDate} from '@js-joda/core';
import { isEqual, pick } from 'lodash';

export default {
  data() {
    return {
      localDate:LocalDate,
      genderLabels: [],
      genderHint: 'As shown on current Government Photo ID',
      legalLastNameHint: 'As shown on current Government Photo ID. Note, If you have ONE name only – enter it into the Legal Last Name field and leave Legal First Name blank',
      emailHint: 'Valid Email Required',
      dobHint: 'Valid Birthdate Required',
      menu: false,
      appTitle: process.env.VUE_APP_TITLE,
      validForm: false,
      dialog: false,
      submitting: false,
      dialogMessage: null,
      genderLabel: null,
      declared: false,
      acceptance: false,
      recordedData: null,
      userPost: {
        legalLastName: null,
        legalFirstName: null,
        legalMiddleNames: null,
        dob: null,
        genderCode: null,
        email: null,
      },
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
    ...mapGetters('auth', ['userInfo']),
    ...mapGetters('request', ['genders', 'student']),
    dataReady() {
      return !!this.userInfo;
    },
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
      this.userPost.legalLastName = val ? '' : this.student.legalLastName;
    },
    editLegalFirstName(val) {
      this.userPost.legalFirstName = val ? '' : this.student.legalFirstName;
    },
    editLegalMiddleNames(val) {
      this.userPost.legalMiddleNames = val ? '' : this.student.legalMiddleNames;
    },
    editBirthdate(val) {
      this.userPost.dob = val ? '' : this.student.dob;
    },
    editGenderLabel(val) {
      this.genderLabel = val ? '' : this.student.genderLabel;
    },
    editEmail(val) {
      this.userPost.email = val ? '' : this.student.email;
    },    
  },
  mounted() {
    this.genderLabels = this.genders.map(a => a.label);
    if (this.student) {
      this.recordedData = pick(this.student, ['legalLastName', 'legalFirstName', 'legalMiddleNames', 'dob', 'genderCode', 'email']);
      Object.assign(this.userPost, this.recordedData);
      const gender = this.genders.find(it => (it.genderCode === this.student.genderCode));
      this.student.genderLabel = gender.label;
      this.genderLabel = gender.label;
    }
  },
  methods: {
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
    setSuccessDialog() {
      this.dialogMessage = 'Form submit success!';
      this.dialog = true;
    },
    setErrorDialog() {
      this.dialogMessage = 'Sorry, an unexpected error seems to have occured. You can click on the submit button again later.';
      this.dialog = true;
    },
    setNoChangeErrorDialog() {
      this.dialogMessage = 'Please fill in fields that you want to update in the form.';
      this.dialog = true;
    },
    async submitRequestForm() {
      this.validate();
      if (this.validForm) {
        try {
          const code = this.genders.filter(it => (it.label === this.genderLabel));
          this.userPost.genderCode = code[0].genderCode;

          if(isEqual(this.userPost, this.recordedData)) {
            this.setNoChangeErrorDialog();
          } else {
            this.submitting = true;
            const resData = await this.postRequest(this.userPost);
            if (resData) {
              this.$refs.form.reset();
              this.setSuccessDialog();
              this.setRequest(resData);
              if (this.$route.name !== 'home') {
                this.$router.replace({name: 'home'});
              }
            } else {
              this.setErrorDialog();
            }
          }
        } catch (e) {
          this.setErrorDialog();
          throw e;
        } finally {
          this.submitting = false;
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
  .mainCard {
    margin: 20px 0;
    padding: 10px;
    width: 100%;
    /* max-width: 900px; */
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

  @media screen and (max-width: 300px) {
    .mainCard {
      margin-top: .1vh;
      padding-top: 10px;
      width: 100%;
      margin-bottom: 8rem;
    }
  }

  @media screen and (min-width: 301px) and (max-width: 600px) {
    .mainCard {
      margin-top: .1vh;
      padding-top: 10px;
      width: 100%;
      margin-bottom: 7rem;
    }
  }

  @media screen and (min-width: 601px) and (max-width: 900px) {
    .mainCard {
      margin-top: .1vh;
      padding-top: 10px;
      width: 100%;
      margin-bottom: 7rem;
    }
  }
</style>

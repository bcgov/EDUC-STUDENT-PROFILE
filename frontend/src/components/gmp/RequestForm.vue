<template>
  <div v-if="dataReady">
    <v-container>
      <v-row>
        <v-col>
          <v-alert
            variant="outlined"
            class="bootstrap-warning"
          >
            <h3>Guidance</h3>
            <ul class="pl-5">
              <li>This form can only be completed by the owner of the PEN</li>
              <li>
                Enter your legal name exactly as it appears on your Government Photo ID; including any middle names if
                applicable
              </li>
              <li>
                If your name has been legally changed since attending school in British Columbia, please indicate previous
                name(s) in Past Names field
              </li>
            </ul>
          </v-alert>
        </v-col>
      </v-row>
      <v-row>
        <v-col><h3>Student Information</h3></v-col>
      </v-row>
    </v-container>

    <v-form
      id="penRequestForm"
      ref="form"
      autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
    >
      <v-container>
        <v-row dense>
          <v-col cols="12">
            <v-checkbox
              v-model="declared"
              color="green"
              :rules="requiredCheckbox()"
              label="I declare that I am submitting a request for my Personal Education Number on my own behalf.
                (If you are a parent/guardian go to your child's school to get their PEN.)"
              @update:model-value="disableFormIfNotDeclared"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              id="legalLastName"
              v-model.trim="userPost.legalLastName"
              :readonly="serviceCardBool"
              color="#003366"
              variant="underlined"
              class="touppercase"
              :rules="requiredRules(legalLastNameHint)"
              :hint="legalLastNameHint"
              label="Legal Last Name"
              :disabled="formDisabled"
              required
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="25"
              density="compact"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              id="legalFirstName"
              v-model.trim="userPost.legalFirstName"
              :readonly="serviceCardBool"
              color="#003366"
              :hint="'As shown on current Government Photo ID. Note, If you have ONE name only – enter it into the '
                + 'Legal Last Name field and leave Legal First Name blank'"
              variant="underlined"
              class="touppercase"
              label="Legal First Name(s) (if applicable)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="25"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              id="legalMiddleNames"
              v-model.trim="userPost.legalMiddleNames"
              :readonly="serviceCardBool"
              color="#003366"
              hint="As shown on current Government Photo ID"
              variant="underlined"
              class="touppercase"
              label="Legal Middle Name(s) (provide if applicable)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="25"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              id="usualLastName"
              v-model.trim="userPost.usualLastName"
              color="#003366"
              variant="underlined"
              class="touppercase"
              hint="Only if different from Legal Last Name"
              label="Usual Last Name (optional)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="25"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              id="usualFirstName"
              v-model.trim="userPost.usualFirstName"
              color="#003366"
              variant="underlined"
              class="touppercase"
              hint="Only if different from Legal First Name"
              label="Usual First Name(s) (optional)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="25"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              id="usualMiddleNames"
              v-model.trim="userPost.usualMiddleName"
              color="#003366"
              variant="underlined"
              class="touppercase"
              hint="Only if different from Legal Middle Name"
              label="Usual Middle Name(s) (optional)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="25"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              id="maidenName"
              v-model.trim="userPost.maidenName"
              color="#003366"
              class="touppercase"
              hint="List all previous Last names used separated with spaces"
              variant="underlined"
              label="Maiden Name (if applicable)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="40"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              id="pastNames"
              v-model.trim="userPost.pastNames"
              color="#003366"
              hint="List all previous names used separated with spaces"
              variant="underlined"
              class="touppercase"
              label="Past Name(s) (if applicable)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="255"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-if="serviceCardBool"
              id="birthdate"
              v-model="rawDob"
              color="#003366"
              variant="underlined"
              label="Birthdate"
              readonly
              required
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              density="compact"
            />
            <v-menu
              v-else
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="290px"
            >
              <template #activator="{ props }">
                <v-text-field
                  id="birthdate"
                  ref="birthdate"
                  :model-value="userPost.dob"
                  color="#003366"
                  variant="underlined"
                  label="Birthdate"
                  readonly
                  :rules="requiredRules()"
                  :disabled="formDisabled"
                  required
                  autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                  density="compact"
                  v-bind="props"
                  @keyup="focusBirthdateField"
                />
              </template>
              <v-date-picker
                id="dob"
                ref="picker"
                v-model="rawDob"
                view-mode="year"
                color="#003366"
                :max="new Date(localDate.now().minusYears(5).toString()).toISOString().substring(0, 10)"
                min="1903-01-01"
                @change="save"
              />
            </v-menu>
          </v-col>
          <v-col cols="12">
            <v-text-field
              id="email"
              v-model="userPost.email"
              :rules="emailRules"
              color="#003366"
              :hint="emailHint"
              class="touppercase"
              variant="underlined"
              label="E-mail Address"
              :disabled="formDisabled"
              required
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="255"
              density="compact"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              id="lastBCSchool"
              v-model.trim="userPost.lastBCSchool"
              color="#003366"
              hint="Last BC K-12 school or Post Secondary Institute attended"
              variant="underlined"
              class="touppercase"
              label="Last B.C. School Attended (optional)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="255"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              id="lastBCStudentNumber"
              v-model.trim="userPost.lastBCSchoolStudentNumber"
              color="#003366"
              hint="School Issued Local ID"
              variant="underlined"
              class="touppercase"
              label="School Student ID Number (optional)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="12"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              id="currentSchool"
              v-model.trim="userPost.currentSchool"
              color="#003366"
              hint="Current BC K-12 school or Post Secondary Institute"
              variant="underlined"
              class="touppercase"
              label="Current B.C. School Attending (optional)"
              :disabled="formDisabled"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              maxlength="255"
              density="compact"
              :rules="charRules()"
            />
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12">
            <v-checkbox
              id="acceptance_chk"
              v-model="accepted"
              color="green"
              label="The personal demographic data provided above is complete and accurate."
              :disabled="formDisabled"
              :rules="requiredCheckbox()"
              @update:model-value="validateForm"
            />
          </v-col>
        </v-row>
      </v-container>
      <v-container>
        <v-row>
          <v-col
            id="confidential_information"
            cols="12"
          >
            <v-card elevation="2">
              <v-card-title>Collection Notice</v-card-title>
              <v-card-text id="collection-notice">
                <p class="pb-4">
                  The information included in this form is collected under ss. 26(c) of the Freedom of Information and
                  Protection of Privacy Act, R.S.B.C. 1996, c. 165. The information you provide will be used in
                  confirming your identity and communicating with you.
                </p>
                <p class="pb-4">
                  If you have any questions about the collection and use of this information, please contact:
                </p>
                <p>
                  <a href="mailto:pens.coordinator@gov.bc.ca"><strong>PEN Coordinator</strong></a><br>
                  Data Management Unit, Student Data & Educational Resource Services Branch<br>
                  B.C. Ministry of Education and Child Care<br>
                  PO Box 9886 Stn Prov Govt<br>
                  Victoria BC V8W 9T6<br>
                  OR through Enquiry BC (Victoria): (250) 387-6121
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              id="cancelButton"
              to="home"
              color="#003366"
              class="text-white"
            >
              Cancel
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col class="text-right">
            <v-btn
              id="submit_form"
              color="#003366"
              class="text-white"
              :loading="submitting"
              @click="submitRequestForm"
            >
              Next
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import { mapState, mapWritableState, mapActions } from 'pinia';
import { useAuthStore } from '../../store/auth';
import { useGmpStore } from '../../store/gmp';
import { LocalDate } from '@js-joda/core';

export default {
  emits: ['next'],
  data() {
    return {
      localDate: LocalDate,
      legalLastNameHint: 'As shown on current Government Photo ID. Note, If you have ONE name only – enter it in Legal'
        + ' Last Name field and leave Legal First Name blank',
      emailHint: 'Valid Email Required',
      menu: false,
      appTitle: import.meta.env.VITE_APP_TITLE,
      entries: [],
      isLoading: false,
      model: null,
      search: null,
      nameLimit: 80,
      validForm: false,
      submitting: false,
      userPost: {
        digitalID: null,
        legalLastName: null,
        legalFirstName: null,
        legalMiddleNames: null,
        usualLastName: null,
        usualFirstName: null,
        usualMiddleName: null,
        maidenName: null,
        pastNames: null,
        dob: null,
        genderCode: null,
        email: null,
        lastBCSchool: null,
        lastBCSchoolStudentNumber: null,
        currentSchool: null
      },
      rawDob: null,
      formDisabled: true,
      serviceCardReadOnlyFields:[
        'legalLastName',
        'legalFirstName',
        'legalMiddleNames',
      ],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['userInfo']),
    ...mapState(useGmpStore, ['requestData']),
    ...mapWritableState(useGmpStore, ['accepted', 'declared']),
    dataReady() {
      return !!this.userInfo;
    },
    serviceCardBool() {
      return this.dataReady && this.userInfo.accountType === 'BCSC';
    },
    emailRules() {
      return [
        v => !!v || this.emailHint,
        v => /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v)
          || this.emailHint,
      ];
    },
  },
  watch: {
    rawDob(val) {
      const date = new Date(val);
      this.$nextTick().then(() => {
        this.userPost.dob = date.toISOString().substring(0, 10);
      });
    },
  },
  mounted() {
    //populate form if user is logged in with BCSC
    if (this.userInfo && this.userInfo.accountType === 'BCSC') {
      this.userPost.legalLastName = this.userInfo.legalLastName;
      this.userPost.legalFirstName = this.userInfo.legalFirstName;
      this.userPost.legalMiddleNames = this.userInfo.legalMiddleNames;
      this.userPost.email = this.userInfo.email;
      this.userPost.usualMiddleName = this.userInfo.usualMiddleNames;
      this.userPost.usualLastName = this.userInfo.usualLastName;
      this.userPost.usualFirstName = this.userInfo.usualFirstName;
      this.userPost.dob = this.userInfo.dob?(this.userInfo.dob).substr(0, 10):'';
    }
    Object.assign(this.userPost, this.requestData);
    this.disableFormIfNotDeclared();
  },
  methods: {
    ...mapActions(useGmpStore, ['setRequestData']),
    requiredRules(hint = 'Required') {
      return [
        v => !!(v && v.trim()) || hint,
        ...this.charRules()
      ];
    },
    requiredCheckbox(hint = 'Required') {
      return [ v => v || hint ];
    },
    charRules() {
      return [
        v => !(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(v))
        || 'Enter English characters only'
      ];
    },
    disableFormIfNotDeclared() {
      this.formDisabled = !this.declared;
    },
    save(date) {
      this.$refs.menu.save(date);
      this.$refs.birthdate.$el.querySelectorAll('#birthdate')[0].focus();
    },
    async submitRequestForm() {
      await this.validateForm();
      if (this.validForm) {
        this.setRequestData(this.userPost);
        this.$emit('next');
      }
    },
    maxSelectableDate() {
      return new Date(LocalDate.now().minusYears(5).toString()).toISOString().substring(0, 10);
    },
    async validateForm() {
      await this.$nextTick();
      this.validForm = (await this.$refs.form.validate()).valid;
    },
    focusBirthdateField(event) {
      if (event.key === 'Tab' && event.type === 'keyup') {
        this.menu = true;
      }
    },
    onDatePickerChange(newValue) {
      this.userPost.dob = newValue;
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

#penRequestForm :deep(.v-input__details) { overflow: visible; }

.mainCard {
  margin: 20px 0;
  padding: 10px;
  width: 100%;
  /* max-width: 900px; */
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

<style>
.touppercase.v-text-field > .v-input__control > .v-input__slot > .v-text-field__slot input {
  text-transform: uppercase
}
</style>

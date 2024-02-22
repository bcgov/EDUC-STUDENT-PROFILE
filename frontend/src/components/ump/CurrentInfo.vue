<template>
  <div>
    <v-alert
      variant="outlined"
      class="pa-3 mb-3 mx-3 bootstrap-warning"
    >
      <h3>Guidance:</h3>
      <ul class="pt-2">
        <li>This process can only be completed by the owner of the PEN</li>
        <li>
          This process can only be completed if you have already left high school. If you are still attending a K-12
          school, request changes at your school
        </li>
      </ul>
    </v-alert>
    <v-card-subtitle>
      <span style="font-size: 1.3rem;font-weight: bolder; color: #333333">{{ subtitle }}</span>
    </v-card-subtitle>

    <v-form
      id="requestForm"
      ref="form"
      v-model="validForm"
      autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
    >
      <v-container
        fluid
        class="py-0"
      >
        <v-row>
          <v-col
            cols="12"
            sm="6"
            class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
          >
            <v-text-field
              id="recordedPen"
              v-model="recordedData.pen"
              :rules="penRules"
              color="#003366"
              variant="outlined"
              :hint="penHint"
              persistent-hint
              :readonly="hasStudentRecord"
              maxlength="9"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              density="compact"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            sm="6"
            class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
          >
            <v-text-field
              id="recordedLegalFirstName"
              v-model.trim="recordedData.legalFirstName"
              :rules="charRules"
              color="#003366"
              variant="outlined"
              class="touppercase"
              :hint="firstNameHint"
              persistent-hint
              :readonly="hasStudentRecord"
              maxlength="25"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              density="compact"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
          >
            <v-text-field
              id="recordedLegalMiddleNames"
              v-model.trim="recordedData.legalMiddleNames"
              :rules="charRules"
              color="#003366"
              variant="outlined"
              class="touppercase"
              :hint="middleNameHint"
              persistent-hint
              :readonly="hasStudentRecord"
              maxlength="25"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              density="compact"
            />
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
          >
            <v-text-field
              id="recordedLegalLastName"
              v-model.trim="recordedData.legalLastName"
              :rules="requiredRules(lastNameHint)"
              color="#003366"
              variant="outlined"
              class="touppercase"
              :hint="lastNameHint"
              persistent-hint
              :readonly="hasStudentRecord"
              maxlength="25"
              autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
              density="compact"
            />
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
          >
            <v-text-field
              v-if="hasStudentRecord"
              id="recordedDob"
              color="#003366"
              variant="outlined"
              :model-value="moment(recordedData.dob).format('MMMM D, YYYY')"
              :hint="birthdateHint"
              persistent-hint
              readonly
              density="compact"
            />
            <v-menu
              v-else
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ props }">
                <v-text-field
                  id="birthdate"
                  ref="birthdate"
                  color="#003366"
                  variant="outlined"
                  :model-value="recordedData.dob ? moment(recordedData.dob).format('MMMM D, YYYY'):''"
                  :rules="requiredRules(birthdateHint)"
                  :hint="birthdateHint"
                  persistent-hint
                  readonly
                  autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                  density="compact"
                  v-bind="props"
                  @keyup="focusBirthdateField"
                />
              </template>
              <v-date-picker
                id="dob"
                ref="picker"
                v-model="recordedData.dob"
                color="#003366"
                show-current
                :max="new Date(localDate.now().minusYears(5).toString()).toISOString().substring(0, 10)"
                min="1903-01-01"
                @change="save"
              />
            </v-menu>
          </v-col>
          <v-col
            v-if="hasStudentRecord"
            cols="12"
            class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
          >
            <v-text-field
              id="recordedEmail"
              v-model="recordedData.email"
              color="#003366"
              variant="outlined"
              class="touppercase"
              hint="Recorded E-mail Address"
              persistent-hint
              readonly
              density="compact"
            />
          </v-col>
        </v-row>

        <v-row justify="space-between">
          <v-col
            cols="1"
            sm="2"
            class="d-flex justify-left align-self-center py-0 px-0 pl-4"
          >
            <v-btn
              id="cancelButton"
              to="home"
              color="#003366"
              class="text-white align-self-center"
            >
              Cancel
            </v-btn>
          </v-col>
          <v-col
            cols="11"
            sm="2"
            class="d-flex justify-end align-self-center py-0 px-0 pr-3"
          >
            <v-card-actions>
              <v-btn
                id="next-step"
                color="#003366"
                class="text-white align-self-center"
                @click="nextStep"
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
import { mapState, mapActions } from 'pinia';
import { useRootStore } from '../../store/root';
import { useUmpStore } from '../../store/ump';
import { LocalDate } from '@js-joda/core';
import { pick } from 'lodash';

export default {
  emits: ['next'],
  data() {
    return {
      localDate: LocalDate,
      validForm: false,
      menu: false,
      recordedData: {
        legalLastName: null,
        legalFirstName: null,
        legalMiddleNames: null,
        dob: null,
        genderCode: null,
        email: null,
      },
    };
  },
  computed: {
    ...mapState(useRootStore, ['student']),
    ...mapState(useUmpStore, { previousData: 'recordedData' }),
    hasStudentRecord() {
      return !!this.student;
    },
    charRules() {
      return [
        v => !(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(v))
          || 'Enter English characters only'
      ];
    },
    penRules() {
      return [
        v => !!(v && v.trim()) || this.penHint,
        v => (v && this.checkDigit(v)) || this.penHint
      ];
    },
    subtitle() {
      return this.hasStudentRecord ? 'Below is your current information as it appears in your school record' :
        'Enter current information as it appears on your highschool transcript or school record';
    },
    penHint() {
      return 'Personal Education Number (PEN), EG 123456789';
    },
    firstNameHint() {
      return `Recorded Legal First Name(s)${this.hasStudentRecord ? ''
        : '; leave blank if you do not have a first name'}`;
    },
    middleNameHint() {
      return `Recorded Legal Middle Name(s) ${this.hasStudentRecord ? '' : 'if applicable'}`;
    },
    lastNameHint() {
      return 'Recorded Legal Last Name';
    },
    birthdateHint() {
      return 'Recorded Birthdate';
    },
  },
  watch: {
    menu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'));
    },
  },
  mounted() {
    if (this.student) {
      this.recordedData = pick(this.student, [
        'legalLastName',
        'legalFirstName',
        'legalMiddleNames',
        'dob',
        'email',
        'pen'
      ]);
    }
    Object.assign(this.recordedData, this.previousData);
  },
  methods: {
    ...mapActions(useUmpStore, ['setRecordedData']),
    requiredRules(hint = 'Required') {
      return [
        v => !!(v && v.trim()) || hint,
        ...this.charRules
      ];
    },
    save(date) {
      this.$refs.menu.save(date);
      this.$refs.birthdate.$el.querySelectorAll('#birthdate')[0].focus();
    },
    focusBirthdateField(event) {
      if(event.key === 'Tab' && event.type === 'keyup') {
        this.menu = true;
      }
    },
    validate() {
      this.$refs.form.validate();
    },
    nextStep() {
      if(this.hasStudentRecord || this.validateForm()) {
        this.setRecordedData(this.recordedData);
        this.$emit('next');
      }
    },
    validateForm() {
      this.validate();
      return this.validForm;
    },
    checkDigit(pen) {
      const parsedPen = parseInt(pen);
      if(!pen || pen.length !== 9 || parsedPen === 0 || isNaN(parsedPen)) {
        return false;
      }

      const penDigits = [];
      for(let i = 0; i < pen.length; i++) {
        penDigits[i] = parseInt(pen.charAt(i), 10);
      }
      const S1 = penDigits.slice(0,-1).filter((_element, index) => {return index % 2 === 0;}).reduce((a,b) => a+b,0);
      const A = parseInt(penDigits.slice(0,-1).filter((_element, index) => {return index % 2 === 1;}).join(''), 10);
      const B = 2 * A;
      let S2 = B.toString().split('').map(Number).reduce(function (a, b) {return a + b;}, 0);
      const S3 = S1 + S2;
      if((S3 % 10) === 0) {
        return penDigits.pop() === 0;
      }
      return penDigits.pop() === (10 - (S3%10));
    },
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
</style>

<style>
  .touppercase.v-text-field > .v-input__control > .v-input__slot > .v-text-field__slot input {
    text-transform: uppercase
  }
</style>


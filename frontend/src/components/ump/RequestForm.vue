<template>
  <div>
    <v-container>
      <v-row dense>
        <v-col
          v-if="alertMessage"
          cols="12"
        >
          <v-alert
            v-model="alert"
            density="compact"
            variant="outlined"
            class="bootstrap-error"
          >
            {{ alertMessage }}
          </v-alert>
        </v-col>
        <v-col cols="12">
          <v-alert
            variant="outlined"
            class="bootstrap-warning"
          >
            <h3>Guidance</h3>
            <ul class="pl-5">
              <li>This form can only be completed by the owner of the PEN</li>
              <li>
                This form can only be completed if you have already left high school. If you are still attending a K-12
                school, request changes at your school
              </li>
            </ul>
          </v-alert>
        </v-col>
        <v-col
          cols="12"
          class="declaration"
        >
          <v-checkbox
            id="declarationCheckbox"
            v-model="declared"
            density="compact"
            color="green"
            hide-details="true"
            :rules="checkboxRules('Required')"
            @click="clickCheckbox"
          >
            <template #label>
              I declare that I am submitting a student data change request on my own behalf. Update personal data as
              indicated below
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="12">
          <v-alert class="bootstrap-warning">
            <span>
              Check fields that need to be changed and enter new information. Leave fields unchecked that do not require
              changes. At least one field in the Student Information section must be changed in order to submit a request.
            </span>
          </v-alert>
        </v-col>
      </v-row>
    </v-container>

    <v-form
      id="requestForm"
      ref="form"
      v-model="validForm"
      autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
    >
      <v-container>
        <v-row class="mb-4">
          <v-col>
            <h3>Student Information</h3>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="6"
          >
            <div class="d-flex">
              <v-checkbox
                id="editLegalFirstNameCheckbox"
                v-model="canEditLegalFirstName"
                class="mr-4"
                label="Change"
                density="compact"
                :disabled="enableDisableForm.disabled"
              />
              <v-text-field
                id="legalFirstName"
                v-model.trim="request.legalFirstName"
                color="#003366"
                hint="As shown on current Government Photo ID"
                :persistent-hint="!enableDisableForm.disabled && canEditLegalFirstName"
                hide-details="auto"
                variant="underlined"
                class="touppercase"
                label="Current Legal First Name(s); leave blank if you do not have a first name"
                :disabled="enableDisableForm.disabled || !canEditLegalFirstName"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="25"
                density="compact"
                :rules="charRules"
              />
            </div>
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <div class="d-flex">
              <v-checkbox
                id="editLegalMiddleNamesCheckbox"
                v-model="canEditLegalMiddleNames"
                class="mr-4"
                label="Change"
                density="compact"
                :disabled="enableDisableForm.disabled"
              />
              <v-text-field
                id="legalMiddleNames"
                v-model.trim="request.legalMiddleNames"
                color="#003366"
                hint="As shown on current Government Photo ID"
                :persistent-hint="!enableDisableForm.disabled && canEditLegalMiddleNames"
                hide-details="auto"
                variant="underlined"
                class="touppercase"
                label="Current Legal Middle Name(s)"
                :disabled="enableDisableForm.disabled || !canEditLegalMiddleNames"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="25"
                density="compact"
                :rules="charRules"
              />
            </div>
          </v-col>
          <v-col cols="12">
            <div class="d-flex">
              <v-checkbox
                id="editLegalLastNameCheckbox"
                v-model="canEditLegalLastName"
                class="mr-4"
                label="Change"
                density="compact"
                :disabled="enableDisableForm.disabled"
              />
              <v-text-field
                id="legalLastName"
                v-model.trim="request.legalLastName"
                color="#003366"
                variant="underlined"
                :rules="charRules && requiredRules(lastNameHint)"
                class="touppercase"
                :hint="legalLastNameHint"
                :persistent-hint="!enableDisableForm.disabled && canEditLegalLastName"
                label="Current Legal Last Name"
                :disabled="enableDisableForm.disabled || !canEditLegalLastName"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="25"
                density="compact"
              />
            </div>
          </v-col>
          <v-col cols="12">
            <div class="d-flex">
              <v-checkbox
                id="editBirthdateCheckbox"
                v-model="canEditBirthdate"
                class="mr-4"
                label="Change"
                density="compact"
                :disabled="enableDisableForm.disabled"
              />
              <v-menu
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
                    variant="underlined"
                    :model-value="formatDob(request.dob)"
                    :rules="requiredRules(dobHint)"
                    label="Birthdate"
                    readonly
                    :disabled="enableDisableForm.disabled || !canEditBirthdate"
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
                  color="#003366"
                  view-mode="year"
                  show-current
                  :max="new Date(localDate.now().minusYears(5).toString()).toISOString().substring(0, 10)"
                  min="1903-01-01"
                  @change="save"
                />
              </v-menu>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <v-container>
        <v-row>
          <v-col>
            <v-alert
              variant="outlined"
              class="bootstrap-warning"
            >
              <p>
                In order to complete this request to update your PEN information, an image of supporting legal
                identification is required.
              </p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-dialog v-model="dialog">
              <template #activator="{ props }">
                <v-btn
                  rounded
                  :disabled="enableDisableForm.disabled"
                  color="#0C7CBA"
                  v-bind="props"
                >
                  <v-icon start>
                    mdi-paperclip
                  </v-icon>
                  Upload
                </v-btn>
              </template>
              <DocumentUpload
                @close:form="() => dialog = false"
              />
            </v-dialog>
            <v-chip-group
              v-model="selectedDocument"
              color="#0C7CBA"
              column
              variant="outlined"
            >
              <DocumentChip
                v-for="document in unsubmittedDocuments"
                :key="document.documentID"
                :document="document"
                :disabled="enableDisableForm.disabled"
                @clear-selected="() => selectedDocument = -1"
              />
            </v-chip-group>
          </v-col>
        </v-row>
      </v-container>

      <v-container>
        <v-row>
          <v-col>
            <h3>Contact Information</h3>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <div class="d-flex">
              <v-checkbox
                v-if="hasStudentRecord"
                id="editEmail"
                v-model="canEditEmail"
                class="mr-4"
                hide-details="auto"
                label="Change"
                density="compact"
                :disabled="enableDisableForm.disabled"
              />
              <v-text-field
                id="email"
                v-model="request.email"
                :rules="emailRules"
                color="#003366"
                :hint="emailHint"
                hide-details="auto"
                class="touppercase"
                variant="underlined"
                label="E-mail Address"
                :disabled="enableDisableForm.disabled || (!canEditEmail && hasStudentRecord)"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="255"
                density="compact"
              />
            </div>
          </v-col>
        </v-row>
      </v-container>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-checkbox
              id="acceptance_chk"
              v-model="acceptance"
              color="green"
              hide-details="true"
              :rules="checkboxRules('')"
              density="compact"
              label="The personal demographic data provided above is complete and accurate."
              @click="clickCheckbox"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            id="confidential_information"
            cols="12"
          >
            <v-card>
              <v-card-title tag="h3">
                Collection Notice
              </v-card-title>
              <v-card-text>
                <p class="pb-4">
                  The information included in this form is collected under ss. 26(c) of the Freedom of Information and
                  Protection of Privacy Act, R.S.B.C. 1996, c. 165. The information you provide will be used in
                  confirming your identity and communicating with you.
                </p>
                <p class="pb-4">
                  If you have any questions about the collection and use of this information, please contact:
                </p>
                <p>
                  <a href="mailto:pens.coordinator@gov.bc.ca">PEN Coordinator</a><br>
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
              class="text-white align-self-center"
            >
              Cancel
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col class="text-right">
            <v-btn
              id="previous-step"
              color="#003366"
              class="text-white mr-2"
              @click="previousStep"
            >
              Back
            </v-btn>
            <v-btn
              id="next-step"
              color="#003366"
              class="text-white"
              :disabled="!validForm"
              @click="validateRequestForm"
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
import { mapState, mapWritableState } from 'pinia';
import { useRootStore } from '../../store/root';
import { getRequestStore, useStudentRequestStore } from '../../store/request';
import { useUmpStore } from '../../store/ump';
import { LocalDate } from '@js-joda/core';
import { isEqual, mapValues, pick } from 'lodash';
import { formatDob } from '../../utils/dateTime';

import DocumentChip from '../DocumentChip.vue';
import DocumentUpload from '../DocumentUpload.vue';


export default {
  components: {
    DocumentChip,
    DocumentUpload
  },
  emits: ['next', 'back'],
  data() {
    return {
      localDate:LocalDate,
      legalLastNameHint: 'As shown on current Government Photo ID. Note, If you have ONE name only – enter it into the'
        + 'Legal Last Name field and leave Legal First Name blank',
      emailHint: 'Valid Email Required',
      dobHint: 'Valid Birthdate Required',
      lastNameHint: 'Valid Legal Last Name Required',
      menu: false,
      validForm: false,
      submitting: false,

      alert: false,
      alertMessage: null,
      enableDisableForm: {
        disabled: true
      },
      acceptance: false,
      dialog: false,
      rawDob: null,
      selectedDocument: -1
    };
  },
  computed: {
    ...mapState(useStudentRequestStore, ['unsubmittedDocuments']),
    ...mapState(useRootStore, ['student']),
    ...mapState(useUmpStore, ['recordedData']),
    ...mapWritableState(useUmpStore, { request: 'updateData' }),
    ...mapWritableState(useUmpStore, [
      'declared',
      'canEditLegalLastName',
      'canEditLegalFirstName',
      'canEditLegalMiddleNames',
      'canEditBirthdate',
      'canEditEmail'
    ]),
    hasStudentRecord() {
      return !!this.student;
    },
    emailRules() {
      return [
        v => !!v || this.emailHint,
        v => /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v)
          || this.emailHint,
      ];
    },
    charRules() {
      return [
        v => !(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(v))
          || 'Enter English characters only'
      ];
    },
  },
  watch: {
    menu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'));
    },
    canEditLegalLastName(val) {
      this.request.legalLastName = val ? '' : this.recordedData.legalLastName;
    },
    canEditLegalFirstName(val) {
      this.request.legalFirstName = val ? '' : this.recordedData.legalFirstName;
    },
    canEditLegalMiddleNames(val) {
      this.request.legalMiddleNames = val ? '' : this.recordedData.legalMiddleNames;
    },
    canEditBirthdate(val) {
      this.request.dob = val ? '' : this.recordedData.dob;
    },
    canEditEmail(val) {
      this.request.email = val ? '' : this.recordedData.email;
    },
    recordedData: {
      deep: true,
      handler() {
        Object.assign(this.request, this.recordedData);
      }
    },
    rawDob(val) {
      const date = new Date(val);
      this.$nextTick().then(() => {
        this.request.dob = date.toISOString().substring(0, 10);
      });
    }
  },
  mounted() {
    this.request.legalLastName = this.canEditLegalLastName ? this.request.legalLastName : this.recordedData.legalLastName;
    this.request.legalFirstName = this.canEditLegalFirstName ? this.request.legalFirstName
      : this.recordedData.legalFirstName;
    this.request.legalMiddleNames = this.canEditLegalMiddleNames ? this.request.legalMiddleNames
      : this.recordedData.legalMiddleNames;
    this.request.dob = this.canEditBirthdate ? this.request.dob : this.recordedData.dob;
    this.request.email = (this.canEditEmail || !this.hasStudentRecord) ? this.request.email : this.recordedData.email;
    getRequestStore().getDocumentTypeCodes();
  },
  methods: {
    requiredRules(hint = 'Required') {
      return [
        v => !!(v && v.trim()) || hint,
        ...this.charRules
      ];
    },
    checkboxRules(hint = 'Required') {
      this.enableDisableForm.disabled = !this.declared;
      this.validForm = (this.declared && this.acceptance);
      return [v => !!v || hint];
    },
    save(date) {
      this.$refs.menu.save(date);
      this.$refs.birthdate.$el.querySelectorAll('#birthdate')[0].focus();
    },
    validate() {
      this.$refs.form.validate();
    },
    setErrorDialog(message) {
      this.alertMessage = message;
      this.alert = true;
      window.scrollTo(0,0);
    },
    validateRequestForm() {
      if (this.$refs.form.validate() && this.validForm) {
        if (isEqual(
          mapValues(pick(this.request,
            ['legalLastName', 'legalFirstName', 'legalMiddleNames', 'dob']), v=> v === null ? '' : v),
          mapValues(pick(this.recordedData,
            ['legalLastName', 'legalFirstName', 'legalMiddleNames', 'dob']), v => v === null ? '' : v))) {
          this.setErrorDialog('You must specify at least one change in order to submit a request.');
        } else if (this.unsubmittedDocuments.length === 0) {
          this.setErrorDialog('You must upload an image of supporting legal identification to submit a request.');
        } else {
          this.$emit('next');
        }
      }
    },
    clickCheckbox() {
      this.validate();
    },
    focusBirthdateField(event) {
      if (event.key === 'Tab' && event.type === 'keyup') {
        this.menu = true;
      }
    },
    previousStep() {
      this.$emit('back');
    },
    formatDob
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

  .declaration /deep/ .v-icon {
    padding-left: 2px;
  }

  .v-input--checkbox /deep/ .v-icon {
    padding-left: 2px;
  }

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

<style>
  .touppercase.v-text-field > .v-input__control > .v-input__slot > .v-text-field__slot input {
    text-transform: uppercase
elect }
</style>

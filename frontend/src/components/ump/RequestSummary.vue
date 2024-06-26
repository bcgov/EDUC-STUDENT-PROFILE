<template>
  <div v-if="updateData">
    <v-row v-if="alertMessage">
      <v-col>
        <v-alert
          v-model="alert"
          density="compact"
          variant="outlined"
          closable
          class="bootstrap-error"
        >
          {{ alertMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-alert
          variant="outlined"
          class="bootstrap-warning"
        >
          <h3>Guidance</h3>
          <p>
            Please review your information below before completing the request. If requested updates are incorrect or
            need to be adjusted further, use the <strong>Back</strong> button to return to the UpdateMyPENInfo form
          </p>
        </v-alert>
      </v-col>
    </v-row>

    <StudentInfoCard :request="updateData">
      <template #hint>
        <v-row no-gutters>
          <p class="pb-4">
            <strong>Please confirm that the information below correctly summarizes the requested changes to your PEN
              Information</strong>
          </p>
        </v-row>
        <v-row no-gutters>
          <p class="mb-0">
            <strong>
              My PEN Information should be changed to:
            </strong>
          </p>
        </v-row>
      </template>
      <template #info>
        <v-row no-gutters>
          <p class="mb-0">
            <strong>
              Attached Documents
            </strong>
          </p>
        </v-row>
        <v-row
          v-for="document in unsubmittedDocuments"
          :key="document.documentID"
          no-gutters
        >
          <v-col
            xl="2"
            lg="2"
            md="2"
            sm="3"
            xs="3"
          >
            <p class="mb-3">
              {{ documentType(document.documentTypeCode) }}:
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
              <strong>{{ document.fileName }}</strong>
            </p>
          </v-col>
        </v-row>
      </template>
    </StudentInfoCard>
    <v-row justify="space-between">
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
          :loading="submitting"
          @click="submitRequest"
        >
          {{ emailChanged ? 'Next' : 'Submit' }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useUmpStore } from '../../store/ump';
import { useStudentRequestStore } from '../../store/request';
import {mapKeys, pick, find} from 'lodash';

import StudentInfoCard from '../StudentInfoCard.vue';

export default {
  components: {
    StudentInfoCard,
  },
  emits: ['next', 'back'],
  data() {
    return {
      submitting: false,

      alert: false,
      alertMessage: null,
    };
  },
  computed: {
    ...mapState(useUmpStore, ['recordedData', 'updateData']),
    ...mapState(useStudentRequestStore, ['documentTypeCodes', 'unsubmittedDocuments']),
    emailChanged() {
      return this.recordedData.email !== this.updateData.email;
    },
  },
  methods: {
    ...mapActions(useStudentRequestStore, ['postRequest', 'setUnsubmittedDocuments']),
    setErrorAlert() {
      this.alertMessage = 'Sorry, an unexpected error seems to have occured. Please try again later.';
      this.alert = true;
      window.scrollTo(0,0);
    },
    createRequestData() {
      let request = pick(this.updateData, [
        'legalLastName',
        'legalFirstName',
        'legalMiddleNames',
        'dob',
        'genderCode',
        'email'
      ]);
      let recorded = pick(this.recordedData, [
        'legalLastName',
        'legalFirstName',
        'legalMiddleNames',
        'dob',
        'genderCode',
        'email',
        'pen'
      ]);
      recorded = mapKeys(recorded, (_, key) => {
        return 'recorded' + key.slice(0,1).toUpperCase() + key.slice(1);
      });
      const documentIDs = this.unsubmittedDocuments.map(doc => doc.documentID);
      return { ...request, ...recorded, documentIDs };
    },
    async submitRequest() {
      try {
        this.submitting = true;
        const data = this.createRequestData();
        if (this.emailChanged) {
          data.emailVerified = 'N';
        } else {
          data.emailVerified = 'Y';
        }
        const resData = await this.postRequest(data);
        if (resData) {
          this.setUnsubmittedDocuments();
          if (this.emailChanged) {
            this.nextStep();
          } else {
            this.$router.replace({name: 'ump'});
          }
        } else {
          this.setErrorAlert();
        }
      } catch (e) {
        this.setErrorAlert();
        throw e;
      } finally {
        this.submitting = false;
      }
    },
    nextStep() {
      this.$emit('next');
    },
    previousStep() {
      this.$emit('back');
    },
    documentType(documentTypeCode) {
      const typeCode = find(this.documentTypeCodes, ['documentTypeCode', documentTypeCode]);
      return typeCode && typeCode.label;
    },
  },
};
</script>

<style scoped>
@media screen and (max-width: 600px) {

  .request-display-header {
    display: flex;
    justify-content: center;
  }

  .request-display-header h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

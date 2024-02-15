import { defineStore } from 'pinia';

export const useUmpStore = defineStore('ump', {
  state: () => ({
    recordedData: {},
    updateData: {
      legalLastName: null,
      legalFirstName: null,
      legalMiddleNames: null,
      dob: null,
      genderCode: null,
      email: null,
    },
    declared: false,
    acceptance: false,
    canEditLegalLastName: false,
    canEditLegalFirstName: false,
    canEditLegalMiddleNames: false,
    canEditBirthdate: false,
    canEditEmail: false
  }),
  actions: {
    setRecordedData(recordedData) {
      this.recordedData = recordedData;
    },
    setUpdateData(updateData) {
      this.updateData = updateData;
    }
  }
});

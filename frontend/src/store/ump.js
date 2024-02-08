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
    isEditable: {
      editLegalLastName: false,
      editLegalFirstName: false,
      editLegalMiddleNames: false,
      editBirthdate: false,
      editEmail: false
    }
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

export default {
  namespaced: true,
  state: {
    recordedData: null,
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
    editLegalLastName: false,
    editLegalFirstName: false,
    editLegalMiddleNames: false,
    editBirthdate: false,
    editGenderLabel: false,
    editEmail: false
  },
  getters: {
    recordedData: state => state.recordedData,
    updateData: state => state.updateData,
  },
  mutations: {
    setRecordedData: (state, recordedData) => {
      state.recordedData = recordedData;
    },
    setUpdateData: (state, updateData) => {
      state.updateData = updateData;
    },
  }
};

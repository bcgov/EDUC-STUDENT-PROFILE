export default {
  namespaced: true,
  state: {
    recordedData: null,
    updateData: null,
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

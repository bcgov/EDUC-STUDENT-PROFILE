import { defineStore } from 'pinia';

export const useRootStore = defineStore('root', {
  state: () => ({
    student: null,
    requestType: null
  }),
  actions: {
    setStudent(student) {
      this.student = student;
    },
    setRequestType(requestType) {
      this.requestType = requestType;
    }
  }
});

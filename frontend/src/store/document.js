import { defineStore } from 'pinia';
import ApiService from '../common/apiService';
import { useRootStore } from './root';

export const useDocumentStore = defineStore('document', {
  state: {
    documentTypeCodes: null,
    unsubmittedDocuments: [],
  },
  actions: {
    setDocumentTypeCodes(documentTypeCodes) {
      this.documentTypeCodes = documentTypeCodes;
    },
    setUnsubmittedDocuments(unsubmittedDocuments) {
      this.unsubmittedDocuments = unsubmittedDocuments || [];
    },
    setUploadedDocument(document) {
      this.unsubmittedDocuments = [...this.unsubmittedDocuments, document];
    },
    async getDocumentTypeCodes() {
      const root = useRootStore();
      if(!this.documentTypeCodes) {
        const response = await ApiService.getDocumentTypeCodes(root.requestType);
        this.setDocumentTypeCodes(response.data);
      }
    },
    async deleteFile({requestID, documentID}){
      const root = useRootStore();
      await ApiService.deleteDocument(requestID, documentID, root.requestType);
      const documents = this.unsubmittedDocuments.filter(document => document.documentID !== documentID);
      this.setUnsubmittedDocuments(documents);
    },
  }
});

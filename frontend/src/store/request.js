import ApiService from '../common/apiService';
import { useRootStore } from './root';
import { defineStore } from 'pinia';

function addComments(storeObject) {
  return {
    ...storeObject,
    state: () => ({
      ...storeObject.state(),
      requestComments: null,
      unsubmittedComment: null,
      commentHistory: [],
    }),
    actions: {
      ...storeObject.actions,
      setRequestComments(requestComments) {
        this.requestComments = requestComments;
      },
      setUnsubmittedComment(unsubmittedComment) {
        this.unsubmittedComment = unsubmittedComment;
      },
      setCommentHistory(commentHistory) {
        this.commentHistory = commentHistory || [];
      },
      setCommentSubmitted(documents) {
        this.unsubmittedComment.documents = documents;
        this.commentHistory = [...this.commentHistory, ...this.requestComments, this.unsubmittedComment];
        this.unsubmittedComment = null;
        this.requestComments = null;
      },
      async postComment({requestID, comment}) {
        const root = useRootStore();
        const response = await ApiService.postComment(requestID, comment, root.requestType);
        this.setUnsubmittedComment(response.data);
      }
    }
  };
}

function addDocuments(storeObject) {
  return {
    ...storeObject,
    state: () => ({
      ...storeObject.state(),
      documentTypeCodes: null,
      unsubmittedDocuments: [],
    }),
    actions: {
      ...storeObject.actions,
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
        if (!this.documentTypeCodes) {
          const response = await ApiService.getDocumentTypeCodes(root.requestType);
          this.setDocumentTypeCodes(response.data);
        }
      },
      async deleteFile({requestID, documentID}) {
        const root = useRootStore();
        await ApiService.deleteDocument(requestID, documentID, root.requestType);
        const documents = this.unsubmittedDocuments.filter(document => document.documentID !== documentID);
        this.setUnsubmittedDocuments(documents);
      }
    }
  };
}

function createRequestStore(id) {
  const baseStore = {
    state: () => ({
      statuses: null,
      request: null,
    }),
    getters: {
      requestID: () => {
        const rootStore = useRootStore();
        return this.request && this.request[`${rootStore.requestType}ID`];
      },
    },
    actions: {
      setStatuses(statuses) {
        this.statuses = statuses;
      },
      setRequest(request = null) {
        this.request = request;
      },
      async postRequest(request) {
        const rootStore = useRootStore();
        try {
          const response = await ApiService.postRequest(request, rootStore.requestType);
          if (response.status !== 200) {
            return false;
          }
          this.setRequest(response.data);
          return response.data;
        } catch(e) {
          console.log('Error while accessing API - ' + e);
          return false;
        }
      },
      async getCodes(requestType) {
        const response = await ApiService.getCodes(requestType);
        this.setStatuses(response.data.statusCodes);
      }
    },
  };

  return defineStore(id, addComments(addDocuments(baseStore)));
}

/**
 * Get whichever request Pinia store you should use based on the root store's current requestType
 *
 * @returns Either a penRequest or a studentRequest store.
 * @throws {Error} Will throw an error if the root store holds some invalid requestType string.
 */
export function getRequestStore() {
  const rootStore = useRootStore();

  if (rootStore.requestType === 'penRequest') {
    return usePenRequestStore();
  } else if (rootStore.requestType === 'studentRequest') {
    return useStudentRequestStore();
  } else {
    throw new Error(`Cannot get an invalid requestStore for requestType: ${rootStore.requestType}`);
  }
}

export const usePenRequestStore = createRequestStore('penRequest');
export const useStudentRequestStore = createRequestStore('studentRequest');

import { defineStore } from 'pinia';
import ApiService from '../common/apiService';
import { useRootStore } from './root';

export const useCommentStore = defineStore('comment', {
  state: {
    requestComments: null,
    unsubmittedComment: null,
    commentHistory: [],
  },
  actions: {
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
    async postComment({requestID, comment}){
      const root = useRootStore();
      const response = await ApiService.postComment(requestID, comment, root.requestType);
      this.setUnsubmittedComment(response.data);
    }
  }
});

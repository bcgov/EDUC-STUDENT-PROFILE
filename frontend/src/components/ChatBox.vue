<template>
  <v-container
    class="pa-0"
    fluid
  >
    <!-- <v-row class="pb-5" v-if="requestComment"> -->
    <v-card
      v-if="status === requestStatuses.RETURNED"
      class="mb-5"
    >
      <v-toolbar
        flat
        color="#036"
        class="text-white"
        height="45rem"
      >
        <v-toolbar-title>Request</v-toolbar-title>
      </v-toolbar>
      <div>
        <v-progress-linear
          v-if="loading"
          indeterminate
          absolute
          location="top"
          color="indigo-darken-2"
        />
        <SingleComment
          v-for="comment in requestComments"
          :key="comment.id"
          :comment="comment"
          :myself="myself"
          :participants="participants"
          :highlight="true"
        />
      </div>
    </v-card>
    <!-- </v-row> -->
    <!-- <v-row class="pb-5"> -->
    <v-card
      v-if="status === requestStatuses.RETURNED"
      class="mb-5"
    >
      <v-toolbar
        flat
        color="#036"
        class="text-white"
        height="45rem"
      >
        <v-toolbar-title>Respond Here</v-toolbar-title>
      </v-toolbar>
      <div
        id="comments-outer"
        class="comments-outside"
      >
        <v-progress-linear
          v-if="loading"
          indeterminate
          absolute
          location="top"
          color="indigo-darken-2"
        />
        <CommentForm
          :unsubmitted-documents="unsubmittedDocuments"
        />
      </div>
    </v-card>
    <!-- </v-row> -->
    <!-- <v-row class="pb-5"> -->
    <v-card
      v-if="hasHistory"
      class="mb-5"
    >
      <v-toolbar
        flat
        color="#036"
        class="text-white"
        height="45rem"
      >
        <v-toolbar-title>Discussion History</v-toolbar-title>
      </v-toolbar>
      <div>
        <v-progress-linear
          v-if="loading"
          indeterminate
          absolute
          location="top"
          color="indigo-darken-2"
        />
        <SingleComment
          v-for="comment in commentHistory"
          :key="comment.id"
          :comment="comment"
          :myself="myself"
          :participants="participants"
        />
      </div>
    </v-card>
    <!-- </v-row> -->
  </v-container>
</template>
<script>
import { groupBy, sortBy, findLastIndex } from 'lodash';
import { RequestStatuses } from '../utils/constants';
import { mapState } from 'pinia';
import { useRootStore } from '../store/root';
import { useAuthStore } from '../store/auth';
import { getRequestStore } from '../store/request';

import SingleComment from './SingleComment.vue';
import CommentForm from './CommentForm.vue';
import ApiService from '../common/apiService';

export default {
  components: {
    CommentForm,
    SingleComment,
  },
  props: {
    commentDocuments: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      participants: [],
      toLoad: [],
      loading: true,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['userInfo']),
    ...mapState(useRootStore, ['requestType']),
    request() {
      return getRequestStore().request;
    },
    unsubmittedDocuments() {
      return getRequestStore().unsubmittedDocuments;
    },
    commentHistory() {
      return getRequestStore().commentHistory;
    },
    requestComments() {
      return getRequestStore().requestComments;
    },
    myself() {
      return { name: this.userInfo.displayName, id: '1' };
    },
    hasHistory() {
      return this.commentHistory && this.commentHistory.length > 0;
    },
    status() {
      return this.request[`${this.requestType}StatusCode`];
    },
    requestStatuses() {
      return RequestStatuses;
    },
    requestID() {
      return this.request[`${this.requestType}ID`];
    }
  },
  created() {
    this.getDocumentTypeCodes();
    const documentPromise = this.commentDocuments
      ? Promise.resolve({data: this.commentDocuments})
      : ApiService.getDocumentList(this.requestID, this.requestType);
    Promise.all([
      documentPromise,
      ApiService.getCommentList(this.requestID, this.requestType),
    ]).then(([documentRes, commentRes]) => {
      this.participants = commentRes.data.participants;

      let [messages, unsubmittedDocuments] = this.linkDocumentsToComments(commentRes.data.messages, documentRes.data);
      this.splitComments(messages, unsubmittedDocuments);
    }).catch(error => {
      console.log(error);
      this.alert = true;
    }).finally(() => {
      if(!this.userInfo){
        console.log('UserInfo undefined');
      }
      if(!this.request){
        console.log('request object undefined');
      }
      if(!this.unsubmittedDocuments){
        console.log('unsubmittedDocuments object undefined');
      }
      if(!this.commentHistory){
        console.log('Comment History object undefined');
      }
      if(!this.setRequestComments){
        console.log('Set Request Comments objects undefined');
      }
      this.loading = false;
    });
  },
  methods: {
    getDocumentTypeCodes() {
      return getRequestStore().getDocumentTypeCodes();
    },
    setUnsubmittedDocuments(unsubmittedDocuments) {
      getRequestStore().setUnsubmittedDocuments(unsubmittedDocuments);
    },
    setCommentHistory(commentHistory) {
      getRequestStore().setCommentHistory(commentHistory);
    },
    setUnsubmittedComment(unsubmittedComment) {
      getRequestStore().setUnsubmittedComment(unsubmittedComment);
    },
    setRequestComments(requestComments) {
      getRequestStore().setRequestComments(requestComments);
    },
    linkDocumentsToComments(messages, documents) {
      const myMessages = messages.filter(message => message.myself);
      documents = sortBy(documents, ['createDate']);

      const documentGroup = groupBy(documents, document => {
        const dates = myMessages.map(message => message.timestamp);
        return dates.findIndex(date => date >= document.createDate);
      });

      myMessages.forEach((message, i) => {
        message.documents = documentGroup[i];
      });

      return [messages, documentGroup[-1]];
    },
    splitComments(messages, unsubmittedDocuments) {
      const lastMessage = messages[messages.length - 1];
      let requestIndex = messages.length;
      if(this.status === this.requestStatuses.RETURNED && lastMessage) {
        if(lastMessage.myself) {
          this.setUnsubmittedComment(lastMessage);
          unsubmittedDocuments = (unsubmittedDocuments || []).concat(lastMessage.documents || []);
          messages = messages.slice(0, messages.length - 1);
        }
        const historyIndex = findLastIndex(messages, ['myself', true]);
        requestIndex = historyIndex + 1;
        this.setRequestComments(messages.slice(requestIndex));
      }

      this.setCommentHistory(messages.slice(0, requestIndex));
      this.setUnsubmittedDocuments(unsubmittedDocuments);
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #ececec;
  margin: 1em;
  padding: 0;
}
.comments-outside {
  /* box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3); */
  margin-top: 0;
  max-width: 100%;
  height:100%;
  width: 100%;
  position: relative;
  overflow-y: hidden;

}
.comments-header {
  background-color: #C8C8C8;
  padding: 1rem;
  align-items: center;
  display: flex;
  justify-content: space-between;
  color: #333;
  min-height: 80px;
  font-size: 2rem;
}
.comments-header .comments-stats span {
  margin-left: 1rem;
}
.post-owner {
  display: flex;
  align-items: center;
}

.post-owner .username > a {
  color: #333;
}

.custom-scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  -moz-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: #fff;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 0.8rem;
  background-color: #fff;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  -moz-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  background-color: #555;
}

.v-toolbar /deep/ .v-toolbar__content {
  padding-left: 20px !important;
}
</style>

<template>
  <div class="comments">
    <div class="reply px-1">
      <v-col class="pa-2">
        <v-textarea
          v-model.trim="reply"
          type="text"
          rows="3"
          variant="solo"
          flat
          auto-grow
          class="reply--text"
          :placeholder="`${(unsubmittedComment && unsubmittedComment.content)
            || 'Enter text here. Attach document(s). Click Done'}`"
          maxlength="4000"
          required
          :disabled="submitted || isSagaInProgress"
        />
        <v-row>
          <v-col
            cols="12"
            sm="6"
          >
            <v-dialog v-model="dialog">
              <template #activator="{ props }">
                <v-btn
                  rounded
                  :disabled="showConfirm || submitted || isSagaInProgress"
                  class="ma-1 text-white order-first"
                  color="#0C7CBA"
                  v-bind="props"
                >
                  <v-icon
                    icon="mdi-paperclip"
                    start
                  />
                  Upload
                </v-btn>
              </template>
              <DocumentUpload
                @close:form="() => dialog = false"
              />
            </v-dialog>
            <v-chip-group
              v-model="selectedDocument"
              column
              :color="submitted || isSagaInProgress ? 'black' : '#0C7CBA' "
              variant="outlined"
              :disabled="submitted || isSagaInProgress"
            >
              <DocumentChip
                v-for="document in unsubmittedDocuments"
                :key="document.documentID"
                :document="document"
                @clear-selected="() => selectedDocument = -1"
              />
            </v-chip-group>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            :class="{ 'text-right': $vuetify.display.smAndUp }"
          >
            <v-btn
              rounded
              :disabled="replyEmpty || showConfirm || submitted || isSagaInProgress"
              color="#0C7CBA"
              class="ma-1 text-white"
              @click="showConfirm=true"
            >
              Done
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </div>
    <v-alert
      v-model="alert"
      density="compact"
      variant="outlined"
      closable
      :class="alertType"
    >
      {{ alertMessage }}
    </v-alert>
    <v-card
      :class="`slider ${showConfirm ? 'open' : 'closed'}`"
      color="#FFECA9"
    >
      <div class="pa-2 d-flex flex-wrap">
        <span class="mx-1 mx-sm-3 align-self-center">
          <strong>Are you sure you are done?</strong>
        </span>
        <div class="d-flex flex-nowrap">
          <v-btn
            rounded
            color="#0C7CBA"
            class="ma-1 text-white"
            @click="reenter"
          >
            No
          </v-btn>
          <v-btn
            rounded
            color="#0C7CBA"
            class="ma-1 text-white"
            :loading="submitting"
            @click="submitComment"
          >
            Yes, Submit
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import ApiService from '../common/apiService';
import { mapState } from 'pinia';
import { useRootStore } from '../store/root';
import { getRequestStore } from '../store/request';

import DocumentChip from './DocumentChip.vue';
import DocumentUpload from './DocumentUpload.vue';

export default {
  components: {
    DocumentChip,
    DocumentUpload
  },
  props: {
    unsubmittedDocuments: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      reply: '',
      submitting: false,
      dialog: false,
      showConfirm: false,
      postedMessage: null,
      updatedRequest: null,
      selectedDocument: -1,

      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {
    ...mapState(useRootStore, ['requestType']),
    requestID() {
      return getRequestStore().requestID;
    },
    unsubmittedComment() {
      return getRequestStore().unsubmittedComment;
    },
    replyEmpty() {
      return this.reply === '' && !this.hasUnsubmittedDocuments;
    },
    submitted() {
      return this.alertType && this.alertType.includes('success');
    },
    hasUnsubmittedDocuments() {
      return this.unsubmittedDocuments.length > 0;
    },
    isSagaInProgress() {
      const rootStore = useRootStore();
      return rootStore.requestType?.request?.sagaInProgress;
    }
  },
  methods: {
    postComment(commentData) {
      return getRequestStore().postComment(commentData);
    },
    setSuccessAlert() {
      this.alertMessage = 'Your request has been submitted.'
        + ' It will be reviewed during business hours in the order received.';
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setErrorAlert() {
      this.alertMessage = 'Sorry, an unexpected error seems to have occurred. '
        + 'You can click on the submit button again later.';
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    reenter() {
      this.alert = false;
      this.showConfirm = false;
    },
    submitComment() {
      if (!this.replyEmpty) {
        this.alert = false;
        this.submitting = true;
        if (this.requestType ==='penRequest' || this.requestType==='studentRequest') {
          const messageToSend = {
            content: this.reply,
            myself: true,
            participantId: 1
          };
          ApiService.postComment(this.requestID, messageToSend, this.requestType).then(() => {
            this.setSuccessAlert();
            this.showConfirm=false;
          }).catch(() => {
            this.setErrorAlert();
          }).finally(() => {
            this.submitting = false;
          });
        }
      }
    }
  }
};
</script>

<style scoped>
.comments {
  max-height: 100%;
  height: 100%;
  width: 100%;
  bottom: 0;
  position: relative
}
.comments-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 0;
  max-height: 35rem
}
.custom-scrollbar::-webkit-scrollbar-track
{
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  -moz-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: #fff;
}
.custom-scrollbar::-webkit-scrollbar
{
  width: 8px;
  background-color: #fff;
}
.custom-scrollbar::-webkit-scrollbar-thumb
{
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  -moz-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  background-color: #555;
}
/* Reply component */
.reply {
  display: flex;
  position: relative;
  align-items: center;
  background-color: #EBEBEB;
  /* border-radius: 30px; */
  /* margin: 1rem; */
  /* padding-right: 1rem; */
  /* padding-left: 1rem; */
  /* width: 90%; */
  overflow: hidden;
}
.reply .avatar {
  position: absolute;
}
.reply .reply--text {
  min-height: 40px;
  padding: 0.3rem 0;
  border: 0;
  color: #333;
  width: 100%;
  outline: 0;
  background-color: transparent;
  box-shadow: none;
}
.reply input.reply--text:valid {
  margin-right: 4rem;
}
.reply input.reply--text:valid + .reply--button {
  right: 1rem;
}
.reply .reply--button {
  border: 1px solid #2a629c;
  background-color: #003366;
  color: #fff;
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 30px;
  transition: color 0.25s ease-in-out, background-color 0.25s ease-in-out, border-color 0.25s ease-in-out, box-shadow 0.25s ease-in-out, right 0.25s ease-in-out;
  outline: 0;
}
.reply .reply--button:hover {
  color: #fff;
  background-color: #003366;
}
.reply .reply--button:focus,
.reply .reply--button:active {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
hr {
  margin-bottom: 1rem;
}
.bottomBar {
  position: relative;
  bottom: 0;
  width: 100%;
}

.v-text-field {
  margin-top: 0;
}
.v-textarea textarea {
  padding: 0;
}

.theme--dark.v-btn.v-btn--disabled {
  color: #cdbbbb !important;
}

.v-messages {
  min-height: 0 !important;
}
.v-text-field__details {
  min-height: 0 !important;
}

.v-textarea /deep/ .v-messages {
  min-height: fit-content !important;
}

.v-textarea /deep/ .v-text-field__details {
  min-height: fit-content !important;
  margin-bottom: 0 !important;
}

.v-dialog > .v-card > .v-card__text {
  padding: 24px 24px 20px;
}

.slider {
  transition-property: all;
  transition-duration: 0.8s;
  transition-timing-function: ease;
}

.slider.open {
  overflow-y: hidden;
  max-height: 100px; /*approximate max height */
  /* visibility: visible; */
}

.slider.closed {
  max-height: 0;
  /* visibility:hidden; */
  transition-duration: 0.5s;
}

</style>

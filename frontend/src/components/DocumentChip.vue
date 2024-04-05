<template>
  <v-menu
    v-model="menu"
    location="bottom right"
    transition="scale-transition"
    origin="top left"
  >
    <template #activator="{ props }">
      <v-chip
        :append-icon="disabled ? '' : 'mdi-chevron-down'"
        label
        v-bind="props"
        @click="menu = true"
      >
        {{ document.fileName }}
      </v-chip>
    </template>

    <v-card width="380px">
      <v-list density="compact">
        <v-list-item prepend-icon="mdi-id-card">
          <v-list-item-title>{{ documentType }}</v-list-item-title>
        </v-list-item>

        <v-list-item prepend-icon="mdi-file">
          <v-list-item-title>
            <router-link
              :to="{ path: documentUrl }"
              target="_blank"
            >
              {{ document.fileName }}
            </router-link>
          </v-list-item-title>
        </v-list-item>

        <v-list-item prepend-icon="mdi-harddisk">
          <v-list-item-title>{{ fileSize }}</v-list-item-title>
        </v-list-item>

        <v-list-item prepend-icon="mdi-clock">
          <v-list-item-title>{{ humanCreateDate }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-alert
        v-model="alert"
        density="compact"
        variant="outlined"
        closable
        :class="alertType"
        class="mx-3 my-1"
      >
        {{ alertMessage }}
      </v-alert>

      <v-card-actions>
        <v-spacer />
        <v-btn
          v-if="!undeletable"
          id="delete-document"
          color="#003366"
          variant="elevated"
          :loading="deleting"
          @click.stop="deleteDocument()"
        >
          Delete
        </v-btn>
        <v-btn
          id="documentUploadCancel"
          color="#003366"
          @click="menu = false"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { mapState } from 'pinia';
import { useRootStore } from '../store/root';
import { getRequestStore } from '../store/request';
import { humanFileSize } from '../utils/file';
import { ApiRoutes } from '../utils/constants';
import { find } from 'lodash';

export default {
  props: {
    document: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    undeletable: {
      type: Boolean,
      default: false
    },
  },
  emits: ['clear-selected'],
  data() {
    return {
      deleting: false,
      menu: false,

      alert: false,
      alertMessage: null,
      alertType: null
    };
  },
  computed: {
    ...mapState(useRootStore, ['requestType']),
    documentTypeCodes() {
      return getRequestStore().documentTypeCodes;
    },
    requestID() {
      return getRequestStore().requestID;
    },
    documentType() {
      const typeCode = find(this.documentTypeCodes, ['documentTypeCode', this.document.documentTypeCode]);
      return typeCode && typeCode.label;
    },
    fileSize() {
      return humanFileSize(this.document.fileSize);
    },
    humanCreateDate() {
      return this.document.createDate.replace(/T/, ', ').replace(/\..+/, '');
    },
    documentUrl() {
      if (this.requestID) {
        return `${ApiRoutes[this.requestType].REQUEST}/${this.requestID}/documents/${this.document.documentID}/download/${this.document.fileName}`;
      } else {
        return `${ApiRoutes[this.requestType].REQUEST}/documents/${this.document.documentID}/download/${this.document.fileName}`;
      }
    },
  },
  watch: {
    menu(newVal) {
      if (newVal === false) this.$emit('clear-selected');
    }
  },
  methods: {
    deleteFile(documentData) {
      return getRequestStore().deleteFile(documentData);
    },
    setSuccessAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    deleteDocument() {
      this.deleting = true;
      this.deleteFile({
        requestID: this.requestID,
        documentID: this.document.documentID
      }).then(() => {
        this.setSuccessAlert('Your document has been deleted successfully.');
      }).catch(() => {
        this.setErrorAlert('Sorry, an unexpected error seems to have occured. You can click on the delete button again later.');
      }).finally(() => {
        this.deleting = false;
      });
    },
  },
};
</script>

<style scoped>
</style>

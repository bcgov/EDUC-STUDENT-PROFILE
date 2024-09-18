<template>
  <v-card class="document-upload">
    <v-card-title>Document Upload</v-card-title>
    <v-card-item>
      <v-form
        ref="form"
        v-model="validForm"
      >
        <v-select
          v-model="documentTypeCode"
          required
          :rules="requiredRules"
          variant="underlined"
          :eager="eager"
          :items="documentTypes"
          label="Document Type"
        />
        <v-file-input
          v-model="inputFile"
          :rules="fileRules"
          :accept="fileAccept"
          placeholder="Select your file"
          show-size
          :error-messages="fileInputError"
          variant="underlined"
        />
        <p class="bottom-text">
          {{ fileFormats }} files supported
        </p>
      </v-form>
    </v-card-item>
    <v-card-item>
      <v-alert
        v-model="alert"
        density="compact"
        variant="outlined"
        closable
        :class="alertType"
        class="mb-3"
      >
        {{ alertMessage }}
      </v-alert>
    </v-card-item>
    <v-card-actions>
      <v-spacer />
      <v-btn
        id="upload_form"
        :key="buttonKey"
        color="#003366"
        class="text-white"
        variant="elevated"
        :disabled="!dataReady"
        :loading="active"
        @click="submitRequest"
      >
        Upload
      </v-btn>
      <v-btn
        color="#003366"
        variant="outlined"
        @click="closeForm"
      >
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'pinia';
import { useRootStore } from '../store/root';
import { getRequestStore } from '../store/request';
import { humanFileSize, getFileNameWithMaxNameLength } from '../utils/file';
import ApiService from '../common/apiService';
import { sortBy } from 'lodash';

/**
 * Returns a rule that tests the input value as an array of File types before applying a callback rule.
 *
 * @param {(val: any) => true|String} fn subsequent rule to apply
 */
function withBaseFileRule(fn) {
  return value => {
    if (!Array.isArray(value) || !value.every(v => v instanceof File)) return 'Please select a file';
    return fn(value);
  };
}

export default {
  props: {
    eager: {
      type: Boolean,
      default: false
    },
  },
  emits: ['close:form'],
  data() {
    return {
      active: false,
      alert: false,
      alertMessage: null,
      alertType: null,
      buttonKey: 0,
      documentTypeCode: null,
      fileAccept: '',
      inputFile: null,
      fileFormats: 'PDF, JPEG, and PNG',
      fileInputError: [],
      fileRules: [],
      requiredRules: [v => !!v || 'Required'],
      validForm: true
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
    dataReady () {
      return this.validForm && this.inputFile;
    },
    documentTypes() {
      return sortBy(this.documentTypeCodes, ['displayOrder']).map(code =>
        ({title: code.label, value: code.documentTypeCode}));
    }
  },
  watch: {
    dataReady() {
      //force re-renders of the button to solve the color issue
      this.buttonKey += 1;
    },
  },
  created() {
    this.getFileRules().catch(e => {
      console.log(e);
      this.setErrorAlert('Sorry, an unexpected error seems to have occured. You can upload files later.');
    });
  },
  methods: {
    setUploadedDocument(document) {
      getRequestStore().setUploadedDocument(document);
    },
    closeForm() {
      this.resetForm();
      this.$emit('close:form');
    },
    resetForm() {
      this.$refs.form.reset();
      this.fileInputError = [];
      this.alert = false;
      this.alertMessage = null;
      this.active = false;
    },
    setSuccessAlert() {
      this.alertMessage = 'File upload successful.';
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setErrorAlert(alertMessage) {
      this.alertMessage = alertMessage;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    validate() {
      this.$refs.form.validate();
    },
    submitRequest() {
      if (this.dataReady) {
        try {
          this.active = true;
          const reader = new FileReader();
          reader.onload = this.uploadFile;
          reader.onabort = this.handleFileReadErr;
          reader.onerror = this.handleFileReadErr;
          reader.readAsBinaryString(this.inputFile);
        } catch (e) {
          this.handleFileReadErr();
          throw e;
        }
      }
    },
    handleFileReadErr() {
      this.active = false;
      this.setErrorAlert('Sorry, an unexpected error seems to have occurred. Try uploading your files later.');
    },
    async uploadFile(env) {
      let document = {
        documentTypeCode: this.documentTypeCode,
        fileName: getFileNameWithMaxNameLength(this.inputFile.name),
        fileExtension: this.inputFile.type,
        fileSize: this.inputFile.size,
        documentData: btoa(env.target.result)
      };

      try {
        const response = await ApiService.uploadFile(this.requestID, document, this.requestType);
        this.setUploadedDocument(response.data);
        this.resetForm();
        this.setSuccessAlert();
      } catch {
        this.handleFileReadErr();
      }
    },
    makefileFormatList(extensions) {
      extensions = extensions.map(v => v.split(new RegExp('/'))[1]).filter(v => v).map(v => v.toUpperCase());
      if (extensions.length <= 2) {
        return extensions.join(' and ');
      } else {
        const lastTwo = extensions.splice(-2, 2).join(', and ');
        extensions.push(lastTwo);
        return extensions.join(', ');
      }
    },
    async getFileRules() {
      const response = await ApiService.getFileRequirements(this.requestType);
      const fileRequirements = response.data;
      const maxSize = fileRequirements.maxSize;
      this.fileRules = [
        withBaseFileRule((value) => {
          const [ file ] = value;
          return !file || file?.size < maxSize || `File size should not be larger than ${humanFileSize(maxSize)}!`;
        }),
        withBaseFileRule(value => {
          const [ file ] = value;
          return !file
            || fileRequirements.extensions.includes(file.type)
            || `File formats should be ${this.fileFormats}.`;
        }),
        withBaseFileRule(value => {
          const [ file ] = value;
          const hasNoSpecialCharacters = !!file
            && !!file?.name
            && !!file?.name.match('^[\\u0080-\\uFFFF\\w,\\s-_]+\\.[A-Za-z]{3,4}$');
          return hasNoSpecialCharacters || 'File name cannot have special characters.';
        })
      ];
      this.fileAccept = fileRequirements.extensions.join();
      this.fileFormats = this.makefileFormatList(fileRequirements.extensions);
    },
  },
};
</script>

<style scoped>
.document-upload {
  padding: 1.1rem;
  max-width: 50rem;
  min-width: 10rem;
}

</style>

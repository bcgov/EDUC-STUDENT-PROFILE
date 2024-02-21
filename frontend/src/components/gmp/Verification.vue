<template>
  <EmailVerification
    request-name="PEN"
    app-name="GetMyPEN"
  />
</template>

<script>
import EmailVerification from '../EmailVerification.vue';

export default {
  name: 'StudentRequestVerification',
  components: {
    EmailVerification
  },
};
</script>

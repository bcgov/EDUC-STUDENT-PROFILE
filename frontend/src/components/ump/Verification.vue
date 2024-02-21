<template>
  <EmailVerification
    request-name="UpdateMyPENInfo"
    app-name="UpdateMyPENInfo"
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

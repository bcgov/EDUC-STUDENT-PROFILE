<template>
  <div style="display: none">
    <a
      id="journey_href"
      :href="journeyBuilder"
    />
  </div>
</template>

<script>
import StaticConfig from '../common/staticConfig';
import { useAuthStore } from '../store/auth';

export default {
  name: 'ModalJourney',
  data(){
    return{
      journeyBuilder: StaticConfig.VUE_APP_JOURNEY_BUILDER
    };
  },
  mounted() {
    console.log(this.journeyBuilder);
    window.location = document.getElementById('journey_href').href;
  },
  methods: {
    logout() {
      useAuthStore().setJwtToken();
    }
  }

};
</script>
<style scoped>

</style>

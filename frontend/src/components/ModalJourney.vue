<template>
  <div style="display: none">
    <a
      id="journey_href"
      :href="frontendConfig.journeyBuilder"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from '../store/auth';
import { useConfigStore } from '../store/config';

export default {
  name: 'ModalJourney',
  computed: {
    ...mapState(useConfigStore, ['frontendConfig'])
  },
  async mounted() {
    if (!this.frontendConfig.journeyBuilder) { // Prevent a race condition with App.vue
      const configStore = useConfigStore();
      await configStore.getConfig();
    }
    this.$nextTick(() => window.location = this.frontendConfig.journeyBuilder);
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

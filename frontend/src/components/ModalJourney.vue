<template>
  <div style="display: none">
    <a
      id="journey_href"
      :href="frontEnd.journeyBuilder"
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
    ...mapState(useConfigStore, ['frontEnd'])
  },
  async mounted() {
    if (!this.frontEnd.journeyBuilder) { // Prevent a race condition with App.vue
      const configStore = useConfigStore();
      await configStore.getFrontEndConfig();
    }
    this.$nextTick(() => window.location = this.frontEnd.journeyBuilder);
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

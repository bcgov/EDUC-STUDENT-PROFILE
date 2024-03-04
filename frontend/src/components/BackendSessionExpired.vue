<template>
  <div style="display: none">
    <a
      id="logout_href"
      :href="routes.SESSION_EXPIRED"
    />
  </div>
</template>

<script>
import { AuthRoutes } from '../utils/constants';
import { useAuthStore } from '../store/auth';

export default {
  name: 'BackendSessionExpired',
  data() {
    return {
      routes: AuthRoutes
    };
  },
  mounted() {
    window.location = document.getElementById('logout_href').href;
  },
  methods: {
    logout() {
      const authStore = useAuthStore();
      authStore.setJwtToken();
    }
  }
};
</script>

<style scoped>

</style>

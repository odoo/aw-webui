<template lang="pug">
div
  h4.mb-3 Server settings

  b-form-group(label="Cors" label-cols-md=3 description="Configure CORS origins. Use comma-separated URLs for exact matches (e.g. http://localhost:8080) or extension IDs (e.g. chrome-extension://<id> or moz-extension://<id>).")
    div
      b-input.float-right.ml-2(v-model="corsorigins" type="text")

  div
    | Web UI commit hash: {{ COMMIT_HASH }}
</template>

<script lang="ts">
import { useSettingsStore } from '~/stores/settings';

export default {
  data() {
    return {
      showSettings: false,
    };
  },
  computed: {
    corsorigins: {
      get() {
        return useSettingsStore().cors_origins;
      },
      set(cors_origins) {
        useSettingsStore().update({ cors_origins });
      },
    },
  },
};
</script>

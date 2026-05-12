<template lang="pug">
div
  h4.mb-3 Server
  b-form-group(label="CORS Origins" label-cols-md=3)
    div
      b-input.float-right.ml-2(v-model="corsorigins" type="text")
    template(#description)
      | Comma-separated list of websites allowed to communicate with the ActivityWatch server.
      br
      | Example: https://www.odoo.com,http://localhost:8069

  b-form-group(label="CORS Regex" label-cols-md=3)
    div
      b-input.float-right.ml-2(v-model="corsregex" type="text")
    template(#description)
      | Comma-separated list of browser extensions allowed to communicate with the ActivityWatch server.
      br
      | Example: chrome-extension://your_extension_id,moz-extension://*
</template>

<script lang="ts">
import { useSettingsStore } from '~/stores/settings';

export default {
  computed: {
    corsorigins: {
      get() {
        return useSettingsStore().cors_origins;
      },
      set(cors_origins) {
        useSettingsStore().update({ cors_origins });
      },
    },
    corsregex: {
      get() {
        return useSettingsStore().cors_regex;
      },
      set(cors_regex) {
        useSettingsStore().update({ cors_regex });
      },
    },
  },
};
</script>

<template lang="html">
  <footer class="footer">
    <div class="container">
      <p class="has-text-centered attributions has-text-grey">
        Video courtesy of<a href="www.bigbuckbunny.org"> Blender Foundation</a>,
        (c) copyright 2008 /
        <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.
      </p>
      <p>
        Developed by
        <a href="https://urbanobservatory.ac.uk/">Urban Observatory</a>
      </p>
      <p class="links">
        <span class="version">v{{ version }}</span>
      </p>
    </div>
  </footer>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class SiteFooter extends Vue {
  get version(): string {
    return process.env.VUE_APP_VERSION
  }
}
</script>

<style lang="scss" scoped>
.footer {
  text-align: center;
}

p {
  margin-bottom: 0.5em;
}

.links {
  margin-bottom: 0;
  padding-bottom: 0.5em;
  overflow-x: auto;
}

.links > *:not(:last-child) {
  padding-right: 0.75em;
  margin-right: 0.75em;
  border-right: 1px solid $grey;
}

a {
  color: $grey-darker;
  font-weight: 600;
  text-decoration: underline $border;
}

.version {
  user-select: all;
  color: $grey;
}
</style>

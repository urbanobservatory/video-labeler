<template>
  <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <router-link :to="homeRoute" class="navbar-item">
          <span class="brand">Video Labeler</span>
          &nbsp;
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ROUTE_HOME } from '../const'

@Component
export default class SiteHeader extends Vue {
  get homeRoute(): object {
    return { name: ROUTE_HOME }
  }
}
</script>

<style lang="scss" scoped>
.navbar-item {
  font-family: $title-family;
  font-size: 1.5em;
  font-weight: 400;
  .geco {
    font-weight: 700;
  }
}
</style>

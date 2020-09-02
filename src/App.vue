<template>
  <div id="app">
    <site-header />
    <router-view />
    <site-footer />
  </div>
</template>

<script>
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
export default {
  components: { SiteHeader, SiteFooter },
  data() {
    return { error: 'Well, this is awkward' }
  }
}
</script>
<style lang="scss">
@import '~@/scss/bulma.scss';
#app {
  display: flex;
  min-height: 100vh;
  flex-direction: column;

  > :not(:first-child):not(:last-child) {
    flex: 1;
  }
  overflow: hidden;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

<template lang="html">
  <div class="home">
    <section class="hero is-small">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="task-title title">
            {{ titleUpperCase }}
          </h1>
          <h2 class="task-subtitle subtitle">
            {{ subtitle }}
          </h2>
        </div>
      </div>
    </section>
    <section class="section video-section">
      <video-player :source="source" :taskId="taskId" :frequency="frequency" />
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VideoPlayer from '@/components/VideoPlayer.vue'
import { namespace } from 'vuex-class'
const task = namespace('task')
@Component({
  components: {
    VideoPlayer
  }
})
export default class Home extends Vue {
  @task.State
  public taskId!: number
  @task.State
  public subtitle!: string
  @task.State
  public source!: string
  @task.State
  public frequency!: number
  @task.State
  public options!: string[]

  @task.Getter
  public titleUpperCase!: string

  @task.Getter
  public subtitleUpperCase!: string

  @task.Action
  fetchTask: () => void

  created() {
    this.fetchTask()
  }
}
</script>

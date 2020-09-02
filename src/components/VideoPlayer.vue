<template>
  <div class="player">
    <p class="subtitle has-text-centered">
      Press <strong>Space</strong> key or use <strong>Play</strong> button to
      start/stop the video
    </p>
    <div v-if="message" class="notification is-danger has-text-centered">
      Please confirm labels on current paused frame to continue
    </div>
    <div class="container video-container has-text-centered">
      <video
        id="video"
        ref="video"
        class="video"
        :width="elWidth"
        :height="elHeight"
        style="display:none;"
      >
        <source :src="videoSource" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
      <canvas id="canvas" ref="canvas" class="canvas"></canvas>
    </div>
    <div class="container">
      <nav class="level controls">
        <div class="level-item has-text-centered">
          <div class="control">
            <button v-if="!ended" class="button is-medium" @click="toggleVideo">
              {{ videoControl }}
            </button>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div class="control">
            <button
              v-show="labelling"
              class="button is-info is-medium"
              @click="confirmLabels()"
            >
              Confirm Labels
            </button>
          </div>
        </div>
      </nav>
    </div>
    <div class="container">
      <div v-if="label" class="has-text-centered">
        <p>Labels</p>
        <code>
          {{ label }}
        </code>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import CanvasDrawMixin from '../mixins/CanvasDrawMixin'
import { Label } from '../types'
import { namespace } from 'vuex-class'
import { VIDEO_PROPERTIES } from '../const'
const labels = namespace('labels')

type videoDimentions = { width: number; height: number }

@Component
export default class VideoPlayer extends Mixins(CanvasDrawMixin) {
  @Prop({ required: true }) readonly source: string
  @Prop({ required: true }) readonly taskId: number
  @Prop({ required: true }) readonly frequency: number

  @labels.State
  public allLabels: []

  @labels.Action
  public updateLabels!: (newLabels: Label[]) => void

  $refs: {
    video: HTMLVideoElement
    canvas: HTMLCanvasElement
  }
  private playbackRate = 0
  private label = ''
  private currentTime = 0
  private labelling = false
  private message = false
  private multiplier = 1
  private playing = false
  private sourceWidth = 0
  private sourceHeight = 0
  private elWidth = 0
  private elHeight = 0
  private resizeId: ReturnType<typeof setTimeout>
  private currentFrame = 0
  private frameInterval = 0
  private ended = false

  get videoSource(): string {
    // TODO: find better way of getting first drawn image
    return `${this.source}.mp4#t=0.0001`
  }

  get videoControl(): string {
    return this.playing ? 'Pause' : 'Play'
  }

  get canvasDimentions(): Record<string, number> {
    return { width: this.elWidth, height: this.elHeight }
  }

  @Watch('source')
  sourceLoaded() {
    if (this.$refs.video) {
      this.$refs.video.load()
      this.initplaybackRate()
    }
  }

  @Watch('currentFrame', { immediate: true })
  videoPlaying() {
    this.drawCanvas()
  }

  mounted() {
    // TODO: add loader
    // init canvas with video meta
    this.$refs.video.addEventListener('loadedmetadata', this.metaLoaded, false)
    // this.$refs.video.ontimeupdate = () => this.updateCurrentTime()
    this.$refs.video.onplaying = () => this.updateCurrentFrame()
    this.$refs.video.onended = () => this.endVideo()
    //add label added event
    this.$on('addLabels', (labels: Label[]) => {
      this.updateLabels(labels)
      // if (process.env.NODE_ENV === 'development')
      this.label = JSON.stringify(this.allLabels)
    })
  }
  public updateCurrentFrame() {
    this.frameInterval = setInterval(() => {
      this.currentFrame = Math.floor(
        this.$refs.video.currentTime * VIDEO_PROPERTIES.frameRate
      )
      if (
        this.currentFrame !== 0 &&
        this.currentFrame % (this.frequency * this.multiplier) === 0
      ) {
        this.multiplier++
        this.labelVideo()
      }
    }, 1000 / VIDEO_PROPERTIES.frameRate)
  }

  public endVideo() {
    clearInterval(this.frameInterval)
    this.playing = false
    this.ended = true
  }

  public updateCurrentTime() {
    this.currentTime = this.$refs.video.currentTime
    if (!Math.floor(this.currentTime)) return
    if (
      Math.floor(this.currentTime) % (this.frequency * this.multiplier) ===
      0
    ) {
      this.multiplier++
      this.labelVideo()
    }
  }
  public metaLoaded(): void {
    // setting static height
    this.setVideoDimensions(this.$refs.video)
    this.$refs.canvas.width = this.elWidth
    this.$refs.canvas.height = this.elHeight
    this.initDrawer(
      this.taskId,
      this.source,
      this.$refs.canvas,
      this.elWidth,
      this.elHeight
    )
    // add window size change events
    // // window.addEventListener('resize', this.reportWindowSize)
    // window.addEventListener('resize', () => {
    //   clearTimeout(this.resizeId)
    //   this.resizeId = setTimeout(this.reportWindowSize, 500)
    // })
    // inital draw
    this.$refs.video.addEventListener('canplay', this.drawCanvas)
    // add labelling key event
    window.addEventListener('keydown', this.key, false)
  }
  public toggleVideo(): void {
    if (this.labelling) {
      this.message = true
      setTimeout(() => (this.message = false), 3000)
    } else {
      if (this.$refs.video) {
        if (this.$refs.video.paused) {
          this.setplaybackRate(1)
        } else {
          this.$refs.video.pause()
          this.playing = false
        }
      }
    }
  }

  public initplaybackRate(): void {
    if (this.$refs.video) {
      this.playbackRate = this.$refs.video.playbackRate
    }
  }

  public key(e: KeyboardEvent): void {
    if (e.code === 'Space' && e.target == document.body) {
      e.preventDefault()
      this.toggleVideo()
    }
  }

  public setplaybackRate(rate: number): void {
    if (this.$refs.video) {
      this.$refs.video.playbackRate = rate
      this.playbackRate = this.$refs.video.playbackRate
      this.$refs.video.play()
      this.playing = true
    }
  }

  public drawCanvas() {
    // take current frame and send draw image with existing labels
    if (this.$refs.video) {
      this.drawImage(this.$refs.video, this.currentFrame, this.allLabels)
    }
  }

  public labelVideo(): void {
    if (this.labelling == true) return
    this.labelling = true
    this.$refs.video.pause()
    this.playing = false
    this.drawCanvas()
    this.addDrawEvents()
  }
  public confirmLabels() {
    this.labelling = false
    this.message = false
    this.setplaybackRate(1)
    this.removeDrawEvents()
    this.createLabels()
  }

  // https://nathanielpaulus.wordpress.com/2016/09/04/finding-the-true-dimensions-of-an-html5-videos-active-area/
  // TODO: better way for adjusting video size
  public setVideoDimensions(video: HTMLVideoElement) {
    // Ratio of the video's intrisic dimensions
    const videoRatio = video.videoWidth / video.videoHeight
    // The width and height of the video element
    let width = 1000,
      height = 900
    // The ratio of the element's width to its height
    const elementRatio = width / height
    // If the video element is short and wide
    if (elementRatio > videoRatio) width = height * videoRatio
    // It must be tall and thin, or exactly equal to the original ratio
    else height = width / videoRatio

    this.elWidth = width
    this.elHeight = height
  }

  public reportWindowSize() {
    this.setVideoDimensions(this.$refs.video)
    this.initDrawer(
      this.taskId,
      this.source,
      this.$refs.canvas,
      this.elWidth,
      this.elHeight
    )
    if (this.labelling) this.labelVideo()
  }
}
</script>

<style lang="scss" scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.notification {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 9;
}
.control {
  display: inline-block;
}
.section {
  padding: 0.2rem;
}
</style>

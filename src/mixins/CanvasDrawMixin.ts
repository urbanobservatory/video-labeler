/*
 * A mixin for code for handling canvas drawing
 *  loosely based on https://jsfiddle.net/richardcwc/ukqhf54k/
 *  and http://jsfiddle.net/Cpvxf/128/
 * // TODO: make sure that the video pixels are honoured
 *
 */

import { Component, Vue } from 'vue-property-decorator'
import { DRAW_PROPERTIES } from '../const'
import { v4 as uuidv4 } from 'uuid'
import { Label, Point, Rectangle } from '../types'

@Component
class CanvasDrawMixin extends Vue {
  private video: HTMLVideoElement
  private context: CanvasRenderingContext2D
  private canvas: HTMLCanvasElement
  private filename: string
  private task: number
  private paint: boolean
  private coordinates: Point[] = []
  private rectangles: Rectangle[] = []
  private width = 0
  private height = 0
  private labelFrame = 0

  // Rectangle
  private lastMousex = 0
  private lastMousey = 0
  private mousex = 0
  private mousey = 0
  private lastWidth = 0
  private lastHeight = 0
  private selectedRect = -1
  private highlightedRect = -1
  // Drag
  // TL,BL,TR,BR
  private dragTL = false
  private dragBL = false
  private dragTR = false
  private dragBR = false
  private draggedRect = -1
  private closeEnough = 10

  /**
   * Initialize drawer
   * @param {string} filename
   * @param {HTMLCanvasElement} canvas
   * @param {number} width
   * @param {number} height
   */
  public initDrawer(
    task: number,
    filename: string,
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ): void {
    this.task = task
    this.filename = filename
    this.canvas = canvas
    this.width = width
    this.height = height
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.context.lineJoin = DRAW_PROPERTIES.lineJoin as CanvasLineJoin
    this.context.lineWidth = DRAW_PROPERTIES.lineWidth
  }

  /**
   * Draw captured image to canvas
   * - also passes the frame number and existing labels
   * @param {HTMLCanvasElement} canvas
   * @param {number} frame
   * @param {Label[]} labels
   */
  public drawImage(
    video: HTMLVideoElement,
    frame: number,
    labels: Label[]
  ): void {
    // set frame and video
    this.labelFrame = frame
    this.video = video
    // clear variables
    this.paint = false
    this.coordinates = []
    this.rectangles = []
    labels.forEach(label => {
      const rect = this.coordsToRect(label)
      this.rectangles.push(rect)
    })
    this.redraw()
  }

  /**
   * Init drawer event listeners
   */
  public addDrawEvents(): void {
    // remove old events
    this.removeDrawEvents()
    // add new events
    this.canvas.addEventListener('mousedown', this.mouseDownEventHandler)
    this.canvas.addEventListener('mouseup', this.mouseUpEventHandler)
    this.canvas.addEventListener('mousemove', this.mouseMoveEventHandler)
    window.addEventListener('keydown', this.keyDeleteEventHandler, false)
  }

  /**
   * Remove drawer event listeners
   */
  public removeDrawEvents(): void {
    this.canvas.removeEventListener('mousedown', this.mouseDownEventHandler)
    this.canvas.removeEventListener('mouseup', this.mouseUpEventHandler)
    this.canvas.removeEventListener('mousemove', this.mouseMoveEventHandler)
    this.highlightedRect = -1
    this.selectedRect = -1
    this.redraw()
  }

  /**
   * Creates new label from frame
   * - emits `addLabels`
   */
  public createLabels(): void {
    const sourceWidth = this.video.videoWidth
    const sourceHeight = this.video.videoHeight
    const labels: Label[] = []
    this.rectangles.forEach(rect => {
      const coordinates: Point[] = []
      coordinates.push([
        rect.x / (this.width / sourceWidth),
        rect.y / (this.height / sourceHeight)
      ])
      coordinates.push([
        rect.x / (this.width / sourceWidth),
        (rect.y + rect.height) / (this.height / sourceHeight)
      ])
      coordinates.push([
        (rect.x + rect.width) / (this.width / sourceWidth),
        (rect.y + rect.height) / (this.height / sourceHeight)
      ])
      coordinates.push([
        (rect.x + rect.width) / (this.width / sourceWidth),
        rect.y / (this.height / sourceHeight)
      ])
      coordinates.push([
        rect.x / (this.width / sourceWidth),
        rect.y / (this.height / sourceHeight)
      ])
      labels.push({
        detectionId: uuidv4(),
        labelId: rect.id,
        sourceId: this.filename,
        taskId: this.task,
        frame: this.labelFrame,
        colour: rect.colour,
        label: {
          type: 'Polygon',
          // TODO: check right-hand rule
          coordinates: [this.makePolyCCW(coordinates)]
        }
      })
    })
    this.$emit('addLabels', labels)
  }

  /**
   * Mouse handlers functions
   * - down, move, up
   * @param {MouseEvent} e
   */
  private mouseDownEventHandler(e: MouseEvent) {
    e.preventDefault()
    this.highlightedRect = -1
    const { x, y } = this.getRelativeCoords(e)
    this.lastMousex = x
    this.lastMousey = y
    for (let i = 0; i < this.rectangles.length; i++) {
      if (this.collides(x, y, i)) {
        this.selectedRect = i
        this.highlightedRect = i
      }
      // if resize
      // 4 cases:
      // 1. top left
      if (
        this.checkCloseEnough(x, this.rectangles[i].x) &&
        this.checkCloseEnough(y, this.rectangles[i].y)
      ) {
        this.dragTL = true
        this.draggedRect = i
        this.highlightedRect = i
      }
      // 2. top right
      else if (
        this.checkCloseEnough(
          x,
          this.rectangles[i].x + this.rectangles[i].width
        ) &&
        this.checkCloseEnough(y, this.rectangles[i].y)
      ) {
        this.dragTR = true
        this.draggedRect = i
        this.highlightedRect = i
      }
      // 3. bottom left
      else if (
        this.checkCloseEnough(x, this.rectangles[i].x) &&
        this.checkCloseEnough(
          y,
          this.rectangles[i].y + this.rectangles[i].height
        )
      ) {
        this.dragBL = true
        this.draggedRect = i
        this.highlightedRect = i
      }
      // 4. bottom right
      else if (
        this.checkCloseEnough(
          x,
          this.rectangles[i].x + this.rectangles[i].width
        ) &&
        this.checkCloseEnough(
          y,
          this.rectangles[i].y + this.rectangles[i].height
        )
      ) {
        this.dragBR = true
        this.draggedRect = i
        this.highlightedRect = i
      }
      // (5.) none of them
      else {
        // handle not resizing
      }
    }
    if (this.selectedRect == -1 && this.draggedRect == -1) {
      this.paint = true
    }
    if (this.paint) {
      this.coordinates.push([x, y])
      this.lastWidth = 0
      this.lastHeight = 0
    }
    this.redraw()
  }
  private mouseMoveEventHandler(e: MouseEvent) {
    const { x, y } = this.getRelativeCoords(e)
    this.mousex = x
    this.mousey = y
    if (this.paint) {
      this.coordinates.push([x, y])
      this.drawNew()
    }
    if (this.selectedRect != -1) {
      const dx = this.mousex - this.lastMousex
      const dy = this.mousey - this.lastMousey
      this.lastMousex = this.mousex
      this.lastMousey = this.mousey
      this.rectangles[this.selectedRect].x += dx
      this.rectangles[this.selectedRect].y += dy
      this.redraw()
    }
    if (this.draggedRect != -1) {
      if (this.dragTL) {
        this.rectangles[this.draggedRect].width +=
          this.rectangles[this.draggedRect].x - x
        this.rectangles[this.draggedRect].height +=
          this.rectangles[this.draggedRect].y - y
        this.rectangles[this.draggedRect].x = x
        this.rectangles[this.draggedRect].y = y
      } else if (this.dragTR) {
        this.rectangles[this.draggedRect].width = Math.abs(
          this.rectangles[this.draggedRect].x - x
        )
        this.rectangles[this.draggedRect].height +=
          this.rectangles[this.draggedRect].y - y
        this.rectangles[this.draggedRect].y = y
      } else if (this.dragBL) {
        this.rectangles[this.draggedRect].width +=
          this.rectangles[this.draggedRect].x - x
        this.rectangles[this.draggedRect].height = Math.abs(
          this.rectangles[this.draggedRect].y - y
        )
        this.rectangles[this.draggedRect].x = x
      } else if (this.dragBR) {
        this.rectangles[this.draggedRect].width = Math.abs(
          this.rectangles[this.draggedRect].x - x
        )
        this.rectangles[this.draggedRect].height = Math.abs(
          this.rectangles[this.draggedRect].y - y
        )
      }
      this.redraw()
    }
  }
  private mouseUpEventHandler() {
    this.paint = false
    if (
      this.coordinates.length > 1 &&
      this.selectedRect == -1 &&
      this.draggedRect == -1
    )
      this.addRectangle()
    this.coordinates = []
    this.selectedRect = -1
    this.draggedRect = -1
    this.dragTL = this.dragTR = this.dragBL = this.dragBR = false
  }

  /**
   * Handle object delete on key press
   * - using Delete and Backspace
   * @param {KeyboardEvent} e
   */
  private keyDeleteEventHandler(e: KeyboardEvent): void {
    if (
      (e.code === 'Delete' || e.code === 'Backspace') &&
      e.target == document.body
    ) {
      e.preventDefault()
      if (this.highlightedRect != -1) {
        this.rectangles.splice(this.highlightedRect, 1)
        this.highlightedRect = -1
        this.selectedRect = -1
        this.draggedRect = -1
        this.redraw()
      }
    }
  }

  /**
   * Drawing functions
   */

  /**
   * Draw new rectangle on canvas
   * - used in mousemove event
   * @return {void}
   */
  private drawNew() {
    this.redraw()
    const width = this.mousex - this.lastMousex
    const height = this.mousey - this.lastMousey
    this.context.beginPath()
    this.context.strokeStyle = DRAW_PROPERTIES.strokeStyle
    this.context.lineWidth = DRAW_PROPERTIES.lineWidth
    this.context.rect(this.lastMousex, this.lastMousey, width, height)
    this.context.stroke()
    this.context.closePath()
    this.lastWidth = width
    this.lastHeight = height
  }

  /**
   * Draw previous rectangles on canvas
   * @return {void}
   */
  private drawRects() {
    this.rectangles.forEach(rect => {
      this.context.beginPath()
      this.context.strokeStyle = rect.colour
      if (this.highlightedRect != -1) {
        if (this.rectangles[this.highlightedRect].id == rect.id)
          this.context.strokeStyle = DRAW_PROPERTIES.strokeStyle
      }
      this.context.rect(rect.x, rect.y, rect.width, rect.height)
      this.context.stroke()
      this.context.closePath()
      this.drawHandles(rect)
    })
  }

  /**
   * Draws circle to specific points on canvas
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   */
  private drawCircle(x: number, y: number, radius: number) {
    this.context.fillStyle = '#FF0000'
    this.context.beginPath()
    this.context.arc(x, y, radius, 0, 2 * Math.PI)
    this.context.fill()
  }

  /**
   * Draws handle circles to rectangle
   * @param {Rectangle} rect
   */
  private drawHandles(rect: Rectangle) {
    this.drawCircle(rect.x, rect.y, this.closeEnough)
    this.drawCircle(rect.x + rect.width, rect.y, this.closeEnough)
    this.drawCircle(rect.x + rect.width, rect.y + rect.height, this.closeEnough)
    this.drawCircle(rect.x, rect.y + rect.height, this.closeEnough)
  }

  /**
   * Clear canvas
   * @return {void}
   */
  private cleanCanvas(): void {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  /**
   * Redraw all elements
   * @return {void}
   */
  private redraw(): void {
    this.cleanCanvas()
    this.context.drawImage(this.video, 0, 0, this.width, this.height)
    this.drawRects()
  }

  /**
   * Add new rectangle
   *  - redraw
   */
  private addRectangle() {
    this.rectangles.push({
      id: uuidv4(),
      x: this.lastMousex,
      y: this.lastMousey,
      width: this.lastWidth,
      height: this.lastHeight,
      colour: this.getRandomColour()
    })
    this.redraw()
  }

  /**
   * Helper functions
   *
   */

  /**
   * Check if clicked in rectangle
   * @param {number} x
   * @param {number} y
   * @param {number} rectIndex
   * @return {boolean}
   */
  private collides(x: number, y: number, rectIndex: number): boolean {
    const rect = this.rectangles[rectIndex]
    const left = rect.x + this.closeEnough,
      right = rect.x + rect.width - this.closeEnough
    const top = rect.y + this.closeEnough,
      bottom = rect.y + rect.height - this.closeEnough
    return (
      // handles all types of drawing
      (right >= x && left <= x && bottom >= y && top <= y) ||
      (right <= x && left >= x && bottom <= y && top >= y) ||
      (right <= x && left >= x && bottom >= y && top <= y) ||
      (right >= x && left <= x && bottom <= y && top >= y)
    )
  }

  /**
   * Check if the two points are close enough to each other
   * @param {number} p1
   * @param {number} p2
   */
  private checkCloseEnough(p1: number, p2: number) {
    return Math.abs(p1 - p2) < this.closeEnough
  }

  /**
   * Get relative coordinates on canvas
   * @param {MouseEvent} event
   */
  private getRelativeCoords(event: MouseEvent) {
    return {
      x: event.offsetX,
      y: event.offsetY
    }
  }

  /**
   * Generate random color
   * @return {string}
   */
  private getRandomColour(): string {
    return (
      '#' + ('00000' + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(-6)
    )
  }

  /**
   * Make polygon follow the right-hand rule
   *  - counter clockwise
   *  - TODO: test
   * @param {Point[]} points
   * @return {Point[]}
   */
  private makePolyCCW(points: Point[]): Point[] {
    let sum = 0
    for (let i = 0; i < points.length - 1; i++) {
      sum +=
        (points[i + 1][0] - points[i][0]) * (points[i + 1][1] + points[i][1])
    }
    return sum > 0 ? points.slice().reverse() : points
  }

  /**
   * Get bounding box of coordinates
   *  - [[xmin, ymin], [xmax, ymax]]
   * @param {Point[]} coordinates
   * @return {Point[]}
   */
  private getExtent(coordinates: Point[]): Point[] {
    return coordinates.reduce((acc: Point[], point: Point) => {
      if (!acc[0]) acc[0] = point
      if (!acc[1]) acc[1] = point
      acc[0] = acc[0][0] <= point[0] && acc[0][1] <= point[1] ? acc[0] : point
      acc[1] = acc[1][0] >= point[0] && acc[1][1] >= point[1] ? acc[1] : point
      return acc
    }, [])
  }

  /**
   * Generate rectangle from polygon coordinates
   * @param {Point[]} coordinates
   * @return {Rectangle}
   */
  private coordsToRect(label: Label): Rectangle {
    const sourceWidth = this.video.videoWidth
    const sourceHeight = this.video.videoHeight
    const extent = this.getExtent(label.label.coordinates[0])
    const width =
      extent[1][0] * (this.width / sourceWidth) -
      extent[0][0] * (this.height / sourceHeight)
    // const width = extent[1][0] - extent[0][0]
    const height =
      extent[1][1] * (this.width / sourceWidth) -
      extent[0][1] * (this.height / sourceHeight)
    // const height = extent[1][1] - extent[0][1]
    return {
      id: label.labelId,
      x: extent[0][0] * (this.width / sourceWidth),
      y: extent[0][1] * (this.height / sourceHeight),
      width,
      height,
      colour: label.colour || this.getRandomColour()
    }
  }
}
export default CanvasDrawMixin

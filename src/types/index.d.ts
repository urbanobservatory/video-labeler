/*
 * Types
 */
export type Point = [number, number]
export type Rectangle = {
  id: string
  x: number
  y: number
  width: number
  height: number
  colour: string
}
export type geoLabel = {
  type: 'Polygon'
  coordinates: [Point[]]
}
export type geoCollection = {
  type: 'GeometryCollection'
  geometries: geoLabel[]
}
export type geoExtent = {
  type: 'MultiPoint'
  coordinates: Point[]
}
export type Label = {
  detectionId: string
  labelId: string
  sourceId: string
  taskId: number
  frame: number
  label: geoLabel
  extent?: geoExtent
  colour?: string
}

export type LayerType =
  | 'line'
  | 'station'
  | 'point'
  | 'rectangle'
  | 'circle'
  | 'polygon'
  | 'image'
  | 'pen'
  | 'text';

export interface ViaStop {
  id: string;
  name: string;
  location: [number, number] | { lng: number; lat: number };
  [key: string]: any;
}

export interface Busline {
  name: string;
  start_stop?: string;
  end_stop?: string;
  [key: string]: any;
}

export interface LayerItemData {
  id: string;
  name: string;
  sub?: string;
  category?: string;
  iconClass?: string;
  iconBgClass?: string;
  type: LayerType;
  location?: [number, number];
  path?: [number, number][];
  viaStops?: ViaStop[];
  buslines?: Busline[];
}

export interface LayerStyle {
  color: string;
  strokeWeight: number;
  opacity: number;
  strokeStyle: string;
  lineJoin: string;
  showDir: boolean;
  borderWeight: number;
  borderColor: string;
  fillColor?: string;
  fillOpacity?: number;
  showIcons?: boolean;
  showStations?: boolean;
}

export interface StationStyle {
  showIcons: boolean;
  shape: string;
  color: string;
  size: number;
  iconBorderColor: string;
  iconBorderWidth: number;
  textureUrl: string;
  offsetX: number;
  offsetY: number;
  showLabel: boolean;
  textColor: string;
  bgColor: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  labelBorderColor: string;
  labelBorderWidth: number;
  labelBorderStyle: string;
  labelBorderRadius: number;
  labelOffsetX: number;
  labelOffsetY: number;
  offset: string;
  allowOverZoom?: boolean;
}

export interface SinglePointStyle {
  showLabel: boolean;
  shape: string;
  size: number;
  textureUrl: string;
  offsetX: number;
  offsetY: number;
  offset: string;
  textColor: string;
  bgColor: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  labelBorderColor: string;
  labelBorderWidth: number;
  labelBorderStyle: string;
  labelBorderRadius: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
  allowOverZoom?: boolean;
}

export interface ShapeStyle {
  opacity: number;
  fillColor: string;
  fillOpacity: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;
  anchor: string;
}

export interface ImageStyle {
  opacity: number;
  size: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;
  borderRadius: number;
  imageUrl: string;
  anchor: string;
}

export interface PenStyle {
  opacity: number;
  color: string;
  strokeWeight: number;
  strokeStyle: string;
}

export interface TextStyle {
  opacity: number;
  textColor: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  shadow: boolean;
  borderRadius: number;
  width: string | number;
  anchor: string;
}

export interface StopOverride {
  labelText?: string;
  labelOffsetX?: number;
  labelOffsetY?: number;
  shape?: string;
  color?: string;
  size?: number;
  textColor?: string;
  fontSize?: number;
  bgColor?: string;
  textureUrl?: string;
  [key: string]: any;
}

export interface LayerObject {
  overlay: any;
  labelMarkers?: any[];
  stationMarkers?: any[];
  endpointMarkers?: any[];
  data: LayerItemData;
  style: LayerStyle;
  stationStyle: StationStyle;
  stopOverrides: Map<string, StopOverride>;
  singlePointStyle: SinglePointStyle;
  shapeStyle: ShapeStyle;
  imageStyle: ImageStyle;
  penStyle: PenStyle;
  textStyle: TextStyle;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  activeTab?: 'style' | 'stops' | 'lines';
  editor?: any;
  isEditing: boolean;
  visible: boolean;
  locked: boolean;
}

export interface FolderObject {
  id: string;
  name: string;
  isFolder: true;
  collapsed: boolean;
  children: string[];
  visible: boolean;
}

export interface GlobalTextConfig {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}

export interface CustomFont {
  name: string;
  dataUrl: string;
}

export interface CopiedStyleData {
  type: LayerType;
  style: LayerStyle;
  stationStyle?: StationStyle;
  singlePointStyle?: SinglePointStyle;
  shapeStyle?: ShapeStyle;
  imageStyle?: ImageStyle;
  penStyle?: PenStyle;
  textStyle?: TextStyle;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface HistorySnapshot {
  layerTree: string[];
  folders: [string, FolderObject][];
  layers: any[];
}

export type DrawToolType = 'rectangle' | 'circle' | 'polygon' | 'image' | 'pen' | 'text' | null;

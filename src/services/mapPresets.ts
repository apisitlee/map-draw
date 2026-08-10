import { GlobalTextConfig } from '../types';

export const BUILTIN_PRESETS: Record<string, string[]> = {
  default: ['bg', 'road', 'point', 'building'],
  minimal: ['road', 'point'],
  traffic: ['road', 'point'],
};

export interface PersistedMapState {
  center: [number, number];
  zoom: number;
  rotation: number;
  mapStyle: string;
  globalTextConfig: GlobalTextConfig;
  activeCoreFeatures: string[];
}

const PERSISTED_STATE_KEY = 'app_map_persisted_state';
const CUSTOM_PRESETS_KEY = 'map_feature_presets';

export function getSavedMapState(): PersistedMapState | null {
  try {
    const saved = localStorage.getItem(PERSISTED_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error loading map state:', e);
    return null;
  }
}

export function persistMapState(state: PersistedMapState): void {
  try {
    localStorage.setItem(PERSISTED_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error persisting map state:', e);
  }
}

export interface CustomPreset {
  name: string;
  features: string[];
}

export function getCustomPresets(): Record<string, CustomPreset> {
  try {
    const saved = localStorage.getItem(CUSTOM_PRESETS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveCustomPreset(key: string, preset: CustomPreset): void {
  try {
    const current = getCustomPresets();
    current[key] = preset;
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error saving custom preset:', e);
  }
}

export function deleteCustomPreset(key: string): void {
  try {
    const current = getCustomPresets();
    delete current[key];
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error deleting custom preset:', e);
  }
}

export function buildStationIconSvg(
  shape: string,
  color: string,
  size: number,
  strokeColor: string = '#ffffff',
  strokeWidth: number = 2
): string {
  let pathStr = '';
  const sw = strokeWidth || 0;

  if (shape === 'square') {
    pathStr = `<rect x="2" y="2" width="20" height="20" rx="2" fill="${color}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
  } else if (shape === 'diamond') {
    pathStr = `<polygon points="12,1 23,12 12,23 1,12" fill="${color}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
  } else if (shape === 'pin') {
    pathStr = `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z" fill="${color}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
  } else {
    // Circle
    pathStr = `<circle cx="12" cy="12" r="9" fill="${color}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">${pathStr}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`;
}

export function createCustomIcon(color: string): any {
  const windowAMap = (window as any).AMap;
  if (!windowAMap) return null;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28"><path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5-2.5z"/></svg>`;
  return new windowAMap.Icon({
    size: new windowAMap.Size(28, 28),
    image: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
  });
}

export function getAnchorByOffsetDir(dir: string): string {
  const anchorMap: Record<string, string> = {
    top: 'bottom-center',
    bottom: 'top-center',
    left: 'middle-right',
    right: 'middle-left',
  };
  return anchorMap[dir] || 'bottom-center';
}

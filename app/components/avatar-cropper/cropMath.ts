import type { ImageAsset, Point } from "./types";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const OUTPUT_SIZE = 1024;

export function getCropSize(
  image: Pick<ImageAsset, "width" | "height">,
  zoom: number,
) {
  return Math.min(image.width, image.height) / zoom;
}

export function clampCenter(
  center: Point,
  image: Pick<ImageAsset, "width" | "height">,
  zoom: number,
): Point {
  const cropSize = getCropSize(image, zoom);
  const halfCrop = cropSize / 2;

  return {
    x: Math.min(
      image.width - halfCrop,
      Math.max(halfCrop, center.x),
    ),
    y: Math.min(
      image.height - halfCrop,
      Math.max(halfCrop, center.y),
    ),
  };
}

export function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

import Image from "next/image";
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { clampCenter, getCropSize, OUTPUT_SIZE } from "./cropMath";
import type { ImageAsset, Point } from "./types";
import styles from "./AvatarCropper.module.css";

type CropViewportProps = {
  center: Point;
  circularPreview: boolean;
  image: ImageAsset;
  moveStep: number;
  onCenterChange: (center: Point) => void;
  zoom: number;
};

type DragState = {
  center: Point;
  pointerId: number;
  x: number;
  y: number;
};

export default function CropViewport({
  center,
  circularPreview,
  image,
  moveStep,
  onCenterChange,
  zoom,
}: CropViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cropSize = getCropSize(image, zoom);

  const imageStyle: CSSProperties = {
    height: `${(image.height / cropSize) * 100}%`,
    left: `${50 - (center.x / cropSize) * 100}%`,
    top: `${50 - (center.y / cropSize) * 100}%`,
    width: `${(image.width / cropSize) * 100}%`,
  };

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      center,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setIsDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    const viewport = viewportRef.current;

    if (!drag || !viewport || drag.pointerId !== event.pointerId) return;

    const rect = viewport.getBoundingClientRect();
    const sourcePixelsPerScreenPixel = cropSize / rect.width;
    const nextCenter = {
      x: drag.center.x -
        (event.clientX - drag.x) * sourcePixelsPerScreenPixel,
      y: drag.center.y -
        (event.clientY - drag.y) * sourcePixelsPerScreenPixel,
    };

    onCenterChange(clampCenter(nextCenter, image, zoom));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    setIsDragging(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = {
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
    }[event.key];

    if (!direction) return;

    event.preventDefault();
    const step =
      (cropSize / OUTPUT_SIZE) * moveStep * (event.shiftKey ? 5 : 1);
    onCenterChange(
      clampCenter(
        {
          x: center.x - direction.x * step,
          y: center.y - direction.y * step,
        },
        image,
        zoom,
      ),
    );
  }

  return (
    <div className={styles.stage}>
      <div className={styles.stageTopline}>
        <h2>Preview</h2>
        <span>{Math.round(zoom * 100)}%</span>
      </div>

      <div
        ref={viewportRef}
        className={`${styles.viewport} ${isDragging ? styles.viewportDragging : ""}`}
        tabIndex={0}
        aria-label="Crop preview. Drag the image or use the arrow keys to choose the visible area."
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Image
          className={styles.cropImage}
          src={image.url}
          alt={`Crop preview of ${image.fileName}`}
          width={image.width}
          height={image.height}
          draggable={false}
          priority
          unoptimized
          style={imageStyle}
        />

        <div className={styles.grid} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className={styles.frameCorners} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        {circularPreview && (
          <div className={styles.circleOverlay} aria-hidden="true" />
        )}
      </div>

      <p className={styles.stageHint}>
        Drag the image or use the arrow controls for precision
      </p>
    </div>
  );
}

import type { CSSProperties } from "react";
import { MAX_ZOOM, MIN_ZOOM } from "./cropMath";
import {
  ArrowIcon,
  DownloadIcon,
  ImageIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  ReplaceIcon,
  ResetIcon,
} from "./Icons";
import type { ImageAsset } from "./types";
import styles from "./AvatarCropper.module.css";

type CropControlsProps = {
  circularPreview: boolean;
  error: string | null;
  image: ImageAsset;
  isExporting: boolean;
  isLoading: boolean;
  moveStep: number;
  onCircularPreviewChange: (enabled: boolean) => void;
  onDownload: () => void;
  onMoveStepChange: (step: number) => void;
  onNudge: (x: number, y: number) => void;
  onReplace: () => void;
  onReset: () => void;
  onZoomChange: (zoom: number) => void;
  zoom: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function progressStyle(value: number) {
  return { "--range-progress": `${value}%` } as CSSProperties;
}

export default function CropControls({
  circularPreview,
  error,
  image,
  isExporting,
  isLoading,
  moveStep,
  onCircularPreviewChange,
  onDownload,
  onMoveStepChange,
  onNudge,
  onReplace,
  onReset,
  onZoomChange,
  zoom,
}: CropControlsProps) {
  const zoomProgress = ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;
  const moveProgress = ((moveStep - 1) / 49) * 100;

  return (
    <aside className={styles.controls} aria-label="Crop controls">
      <div className={styles.controlsHeader}>
        <h2>Controls</h2>
        <button className={styles.resetButton} type="button" onClick={onReset}>
          <ResetIcon />
          Reset
        </button>
      </div>

      <div className={styles.fileCard}>
        <span className={styles.fileIcon}>
          <ImageIcon />
        </span>
        <span className={styles.fileDetails}>
          <strong title={image.fileName}>{image.fileName}</strong>
          <span>
            {image.width} × {image.height} · {formatBytes(image.fileSize)}
          </span>
        </span>
        <button
          className={styles.replaceButton}
          type="button"
          onClick={onReplace}
          disabled={isLoading}
          aria-label="Choose a different image"
        >
          <ReplaceIcon />
        </button>
      </div>

      <section className={styles.controlSection} aria-labelledby="zoom-label">
        <div className={styles.controlLabel}>
          <label id="zoom-label" htmlFor="crop-zoom">Zoom</label>
          <output htmlFor="crop-zoom">{Math.round(zoom * 100)}%</output>
        </div>

        <div className={styles.sliderRow}>
          <button
            type="button"
            onClick={() => onZoomChange(zoom - 0.1)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            <MinusIcon />
          </button>
          <input
            id="crop-zoom"
            className={styles.slider}
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step="0.01"
            value={zoom}
            style={progressStyle(zoomProgress)}
            onChange={(event) => onZoomChange(Number(event.target.value))}
          />
          <button
            type="button"
            onClick={() => onZoomChange(zoom + 0.1)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            <PlusIcon />
          </button>
        </div>
      </section>

      <section className={styles.controlSection} aria-labelledby="position-label">
        <div className={styles.controlLabel}>
          <span id="position-label">Position</span>
          <span className={styles.controlValue}>{moveStep} px / press</span>
        </div>

        <div className={styles.positionControls}>
          <div className={styles.dpad} role="group" aria-label="Move image">
            <button
              className={styles.moveUp}
              type="button"
              onClick={() => onNudge(0, -1)}
              aria-label={`Move image up ${moveStep} pixels`}
            >
              <ArrowIcon />
            </button>
            <button
              className={styles.moveLeft}
              type="button"
              onClick={() => onNudge(-1, 0)}
              aria-label={`Move image left ${moveStep} pixels`}
            >
              <ArrowIcon />
            </button>
            <span className={styles.dpadCenter} aria-hidden="true" />
            <button
              className={styles.moveRight}
              type="button"
              onClick={() => onNudge(1, 0)}
              aria-label={`Move image right ${moveStep} pixels`}
            >
              <ArrowIcon />
            </button>
            <button
              className={styles.moveDown}
              type="button"
              onClick={() => onNudge(0, 1)}
              aria-label={`Move image down ${moveStep} pixels`}
            >
              <ArrowIcon />
            </button>
          </div>

          <div className={styles.stepControl}>
            <div className={styles.stepLabel}>
              <label htmlFor="move-step">Move per press</label>
              <output htmlFor="move-step">{moveStep}px</output>
            </div>
            <input
              id="move-step"
              className={styles.slider}
              type="range"
              min="1"
              max="50"
              step="1"
              value={moveStep}
              style={progressStyle(moveProgress)}
              onChange={(event) => onMoveStepChange(Number(event.target.value))}
            />
            <div className={styles.rangeEnds} aria-hidden="true">
              <span>1px</span>
              <span>50px</span>
            </div>
          </div>
        </div>
        <p className={styles.positionHint}>
          Arrow keys use the same step size. Hold Shift for 5×.
        </p>
      </section>

      <section className={styles.controlSection} aria-labelledby="shape-label">
        <div className={styles.controlLabel}>
          <span id="shape-label">Avatar preview</span>
          <span className={styles.controlValue}>
            {circularPreview ? "Circle" : "Square"}
          </span>
        </div>

        <button
          className={styles.shapeToggle}
          type="button"
          role="switch"
          aria-checked={circularPreview}
          onClick={() => onCircularPreviewChange(!circularPreview)}
        >
          <span className={styles.squareGlyph} aria-hidden="true" />
          <span>Square</span>
          <span
            className={`${styles.switchTrack} ${circularPreview ? styles.switchTrackOn : ""}`}
            aria-hidden="true"
          >
            <span />
          </span>
          <span>Circle</span>
          <span className={styles.circleGlyph} aria-hidden="true" />
        </button>
      </section>

      <div className={styles.exportSection}>
        {error && (
          <p className={styles.inlineError} role="alert">
            {error}
          </p>
        )}
        <button
          className={styles.downloadButton}
          type="button"
          onClick={onDownload}
          disabled={isExporting || isLoading}
        >
          <span>{isExporting ? "Preparing PNG…" : "Download PNG"}</span>
          <DownloadIcon />
        </button>
        <div className={styles.exportMeta}>
          <span>1024 × 1024</span>
          <span>Square crop</span>
        </div>
      </div>

      <div className={styles.privacyNote}>
        <LockIcon />
        <span>Processed entirely on your device</span>
      </div>
    </aside>
  );
}

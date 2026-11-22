"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import CropControls from "./CropControls";
import CropViewport from "./CropViewport";
import UploadDropzone from "./UploadDropzone";
import {
  clampCenter,
  clampZoom,
  getCropSize,
  OUTPUT_SIZE,
} from "./cropMath";
import type { ImageAsset, Point } from "./types";
import styles from "./AvatarCropper.module.css";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be decoded"));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, "image/png");
  });
}

export default function AvatarCropper() {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const loadRequestRef = useRef(0);
  const editorDragDepth = useRef(0);
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [center, setCenter] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [moveStep, setMoveStep] = useState(5);
  const [circularPreview, setCircularPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isReplacementDrag, setIsReplacementDrag] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("That image is over 25 MB. Please choose a smaller file.");
      return;
    }

    const requestId = ++loadRequestRef.current;
    const nextUrl = URL.createObjectURL(file);
    setIsLoading(true);

    try {
      const element = await loadImage(nextUrl);

      if (requestId !== loadRequestRef.current) {
        URL.revokeObjectURL(nextUrl);
        return;
      }

      if (!element.naturalWidth || !element.naturalHeight) {
        throw new Error("Image has no dimensions");
      }

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = nextUrl;

      const nextImage: ImageAsset = {
        element,
        fileName: file.name || "Untitled image",
        fileSize: file.size,
        height: element.naturalHeight,
        url: nextUrl,
        width: element.naturalWidth,
      };

      setImage(nextImage);
      setCenter({
        x: nextImage.width / 2,
        y: nextImage.height / 2,
      });
      setZoom(1);
      setCircularPreview(false);
    } catch {
      URL.revokeObjectURL(nextUrl);
      if (requestId === loadRequestRef.current) {
        setError("This image could not be opened. Try a JPG, PNG, WEBP, or AVIF.");
      }
    } finally {
      if (requestId === loadRequestRef.current) setIsLoading(false);
    }
  }, []);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleFile(file);
  }

  function openFileDialog() {
    inputRef.current?.click();
  }

  function handleZoomChange(nextZoomValue: number) {
    if (!image) return;
    const nextZoom = clampZoom(nextZoomValue);
    setZoom(nextZoom);
    setCenter((current) => clampCenter(current, image, nextZoom));
  }

  function resetCrop() {
    if (!image) return;
    setZoom(1);
    setCenter({ x: image.width / 2, y: image.height / 2 });
  }

  function nudgeImage(x: number, y: number) {
    if (!image) return;
    const cropSize = getCropSize(image, zoom);
    const sourceStep = (cropSize / OUTPUT_SIZE) * moveStep;

    setCenter((current) =>
      clampCenter(
        {
          x: current.x - x * sourceStep,
          y: current.y - y * sourceStep,
        },
        image,
        zoom,
      ),
    );
  }

  function handleEditorDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    editorDragDepth.current += 1;
    setIsReplacementDrag(true);
  }

  function handleEditorDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    editorDragDepth.current -= 1;
    if (editorDragDepth.current <= 0) {
      editorDragDepth.current = 0;
      setIsReplacementDrag(false);
    }
  }

  function handleEditorDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    editorDragDepth.current = 0;
    setIsReplacementDrag(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  async function downloadCrop() {
    if (!image) return;

    setError(null);
    setIsExporting(true);

    try {
      const cropSize = getCropSize(image, zoom);
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image.element,
        center.x - cropSize / 2,
        center.y - cropSize / 2,
        cropSize,
        cropSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      );

      const blob = await canvasToBlob(canvas);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const baseName = image.fileName.replace(/\.[^.]+$/, "") || "avatar";
      link.href = downloadUrl;
      link.download = `${baseName}-crop.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    } catch {
      setError("The crop could not be exported. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className={styles.cropper}>
      <input
        ref={inputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*"
        aria-label="Choose image to crop"
        onChange={handleInputChange}
      />

      {!image ? (
        <UploadDropzone
          error={error}
          isLoading={isLoading}
          onBrowse={openFileDialog}
          onFile={(file) => void handleFile(file)}
        />
      ) : (
        <div
          className={styles.editor}
          onDragEnter={handleEditorDragEnter}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={handleEditorDragLeave}
          onDrop={handleEditorDrop}
        >
          <CropViewport
            center={center}
            circularPreview={circularPreview}
            image={image}
            moveStep={moveStep}
            onCenterChange={setCenter}
            zoom={zoom}
          />
          <CropControls
            circularPreview={circularPreview}
            error={error}
            image={image}
            isExporting={isExporting}
            isLoading={isLoading}
            moveStep={moveStep}
            onCircularPreviewChange={setCircularPreview}
            onDownload={() => void downloadCrop()}
            onMoveStepChange={setMoveStep}
            onNudge={nudgeImage}
            onReplace={openFileDialog}
            onReset={resetCrop}
            onZoomChange={handleZoomChange}
            zoom={zoom}
          />

          {isReplacementDrag && (
            <div className={styles.replaceOverlay} aria-hidden="true">
              <span>Drop to replace image</span>
            </div>
          )}

          {isLoading && (
            <div className={styles.loadingOverlay} role="status">
              <span className={styles.spinner} />
              Reading image…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

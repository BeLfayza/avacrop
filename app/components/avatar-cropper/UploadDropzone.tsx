import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { UploadIcon } from "./Icons";
import styles from "./AvatarCropper.module.css";

type UploadDropzoneProps = {
  error: string | null;
  isLoading: boolean;
  onBrowse: () => void;
  onFile: (file: File) => void;
};

export default function UploadDropzone({
  error,
  isLoading,
  onBrowse,
  onFile,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current -= 1;

    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onBrowse();
    }
  }

  return (
    <div className={styles.emptyEditor}>
      <section className={styles.uploadShell} aria-labelledby="upload-panel-title">
        <div className={styles.panelHeader}>
          <h2 id="upload-panel-title">Image</h2>
          <span>JPG, PNG, WEBP, AVIF</span>
        </div>

        <div
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
          role="button"
          tabIndex={0}
          aria-describedby="upload-formats"
          aria-disabled={isLoading}
          onClick={isLoading ? undefined : onBrowse}
          onKeyDown={isLoading ? undefined : handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.uploadIconWrap}>
            <UploadIcon className={styles.uploadIcon} />
          </div>

          <div className={styles.uploadCopy}>
            <h3>
              {isLoading
                ? "Reading your image…"
                : isDragging
                  ? "Drop it here"
                  : "Upload a photo"}
            </h3>
            <p>Drag and drop, or click to browse</p>
          </div>

          <span className={styles.chooseButton}>
            {isLoading ? "Please wait" : "Choose image"}
          </span>

          <p id="upload-formats" className={styles.formats}>
            Maximum file size: 25 MB
          </p>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </section>

      <section className={styles.emptyPreview} aria-labelledby="empty-preview-title">
        <div className={styles.panelHeader}>
          <h2 id="empty-preview-title">Preview</h2>
          <span>1:1 square</span>
        </div>
        <div className={styles.emptyCanvas}>
          <div className={styles.emptyAvatar} aria-hidden="true">
            <span />
          </div>
          <p>Your crop will appear here</p>
        </div>
      </section>
    </div>
  );
}

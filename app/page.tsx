import AvatarCropper from "./components/avatar-cropper/AvatarCropper";
import styles from "./page.module.css";

function CropMark() {
  return (
    <span className={styles.cropMark} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandGroup}>
          <a className={styles.brand} href="#top" aria-label="AVA/CROP home">
            <CropMark />
            <span>AVA/CROP</span>
          </a>
          <a
            className={styles.githubLink}
            href="https://github.com/BeLfayza"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile for BeLfayza"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.69-3.88-1.54-3.88-1.54-.53-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.35.78 1.04.78 2.1v3.11c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
              />
            </svg>
          </a>
        </div>
        <div className={styles.localBadge}>
          <span className={styles.statusDot} aria-hidden="true" />
          Local processing only
        </div>
      </header>
      <main id="top" className={styles.main}>
        <section className={styles.hero} aria-labelledby="page-title">
          <h1 id="page-title" className={styles.title}>
            Crop your avatar
          </h1>
        </section>
        <AvatarCropper />
      </main>
    </div>
  );
}

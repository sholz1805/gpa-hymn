import Image from "next/image";

export function Icon({ name, size = 18, strokeWidth = 1.8, filled = false }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth,
  };
  const paths = {
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" />
        <path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 10h7" />
      </>
    ),
    heart: (
      <path d="M20.8 8.7c0 4.3-8.8 10.1-8.8 10.1S3.2 13 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),
    moon: <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" />
        <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...common}
      fill={filled ? "currentColor" : "none"}
    >
      {paths[name] ?? paths.book}
    </svg>
  );
}

export function BrandMark() {
  return (
    <span className="brand-mark">
      <Image
        alt="Gospel Pentecostal Assembly"
        height={40}
        loading="eager"
        unoptimized
        src="/images/GPALogo.png"
        width={40}
      />
    </span>
  );
}

export function HymnCard({
  hymn,
  isSaved,
  onToggleSave,
  onOpen,
  selectedTopic,
}) {
  const topic = selectedTopic ?? hymn.topics[0];

  return (
    <article
      aria-label={`Open ${hymn.title}`}
      className="hymn-card"
      onClick={() => onOpen(hymn)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(hymn);
        }
      }}
      onKeyUp={(event) => {
        if (event.target === event.currentTarget && event.key === " ") {
          event.preventDefault();
        }
      }}
      role="group"
      tabIndex={0}
    >
      <span aria-hidden="true" className="hymn-row-dot" />
      <div className="hymn-row-copy">
        <div className="hymn-row-meta">
          <span className="card-category">{topic}</span>
          <span className="hymn-card-details">
            {hymn.number && <span className="hymn-number">#{hymn.number}</span>}
            <span className="hymn-author">{hymn.author ?? hymn.meter}</span>
          </span>
        </div>
        <h3>{hymn.title}</h3>
      </div>
      <button
        aria-label={
          isSaved
            ? `Remove ${hymn.title} from favourites`
            : `Add ${hymn.title} to favourites`
        }
        aria-pressed={isSaved}
        className={`icon-button${isSaved ? " saved" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleSave(hymn.id);
        }}
        type="button"
      >
        <Icon filled={isSaved} name="heart" size={17} />
      </button>
      <button
        className="card-read"
        onClick={(event) => {
          event.stopPropagation();
          onOpen(hymn);
        }}
        type="button"
      >
        Read <Icon name="arrow" size={13} />
      </button>
    </article>
  );
}

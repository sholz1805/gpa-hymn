import { Icon, BrandMark } from "./ui";

export default function LibrarySidebar({
  activeView,
  menuOpen,
  offlineStatus,
  offlineLabel,
  installPrompt,
  savedCount,
  onChooseView,
  onInstall,
  onCloseMenu,
}) {
  return (
    <>
      {menuOpen && (
        <button
          aria-label="Close navigation menu"
          className="mobile-scrim"
          onClick={onCloseMenu}
          type="button"
        />
      )}
      <aside className={`sidebar${menuOpen ? " mobile-open" : ""}`}>
        <a
          aria-label="GPA Hymns home"
          className="brand"
          href="#home"
          onClick={() => onChooseView("explore")}
        >
          <BrandMark />
          <span>GPA Hymns</span>
        </a>
        <p className="side-label">Discover</p>
        <nav aria-label="Main navigation" className="side-nav">
          <button
            aria-current={activeView === "explore" ? "page" : undefined}
            className={`nav-button${activeView === "explore" ? " active" : ""}`}
            onClick={() => onChooseView("explore")}
            type="button"
          >
            <Icon name="book" size={18} />
            Hymn library
          </button>
          <button
            className="nav-button"
            onClick={() => {
              onChooseView("explore");
              document.getElementById("themes")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            type="button"
          >
            <Icon name="sparkle" size={18} />
            Browse by topic
          </button>
          <button
            className="nav-button"
            onClick={() => {
              onChooseView("explore");
              (
                document.getElementById("alphabet-index") ??
                document.getElementById("hymn-library")
              )?.scrollIntoView({ behavior: "smooth" });
            }}
            type="button"
          >
            <Icon name="book" size={18} />
            Browse by title
          </button>
          <button
            aria-current={activeView === "saved" ? "page" : undefined}
            className={`nav-button${activeView === "saved" ? " active" : ""}`}
            onClick={() => onChooseView("saved")}
            type="button"
          >
            <Icon name="heart" size={18} />
            My favourites
            <span className="nav-count">{savedCount || ""}</span>
          </button>
        </nav>
        <section aria-label="Offline access" className="offline-card">
          <span
            aria-hidden="true"
            className={`offline-indicator ${offlineStatus}`}
          />
          <div className="offline-card-copy">
            <strong>{offlineLabel}</strong>
            <p>
              Favourites stay on this device. Open the library online once to
              prepare it.
            </p>
          </div>
          {installPrompt && (
            <button className="offline-install" onClick={onInstall} type="button">
              Install app
            </button>
          )}
        </section>
      </aside>
    </>
  );
}

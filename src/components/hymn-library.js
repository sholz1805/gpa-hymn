"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  churchAnthem,
  englishTopics,
  languages,
  suppliedHymns,
  yorubaTopics,
} from "../data/hymns";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const libraryHymns = suppliedHymns;

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function getHymnLetter(title) {
  return normalizeText(title).charAt(0).toUpperCase();
}

const savedHymnsKey = "gpa-hymn-library:saved";
const savedHymnsEvent = "gpa-hymn-library:saved-change";
const themeKey = "gpa-hymn-library:theme";
const themeChangedEvent = "gpa-hymn-library:theme-change";

function subscribeToSavedHymns(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(savedHymnsEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(savedHymnsEvent, onChange);
  };
}

function getSavedHymnsSnapshot() {
  try {
    return window.localStorage.getItem(savedHymnsKey) ?? "[]";
  } catch (error) {
    console.error("Could not read saved hymns from local storage.", error);
    return "[]";
  }
}

function parseSavedHymns(snapshot) {
  try {
    const saved = JSON.parse(snapshot);
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Saved hymns contain invalid data.", error);
    return [];
  }
}

function subscribeToTheme(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(themeChangedEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(themeChangedEvent, onChange);
  };
}

function getThemeSnapshot() {
  try {
    const storedTheme = window.localStorage.getItem(themeKey);
    return storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : "light";
  } catch (error) {
    console.error("Could not read the saved theme from local storage.", error);
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }
}

function Icon({ name, size = 18, strokeWidth = 1.8, filled = false }) {
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
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
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

function BrandMark() {
  return (
    <span className="brand-mark">
      <Image
        alt="Gospel Pentecostal Assembly"
        height={40}
        unoptimized
        src="/images/GPALogo.png"
        width={40}
      />
    </span>
  );
}

function HymnCard({ hymn, isSaved, onToggleSave, onOpen, selectedTopic }) {
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

export default function HymnLibrary() {
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All hymns");
  const [language, setLanguage] = useState("English");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [activeView, setActiveView] = useState("explore");
  const [selectedHymn, setSelectedHymn] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [offlineStatus, setOfflineStatus] = useState(
    process.env.NODE_ENV === "production" ? "checking" : "development",
  );
  const [installPrompt, setInstallPrompt] = useState(null);
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light",
  );
  const topics = language === "English" ? englishTopics : yorubaTopics;
  const savedSnapshot = useSyncExternalStore(
    subscribeToSavedHymns,
    getSavedHymnsSnapshot,
    () => "[]",
  );
  const savedIds = parseSavedHymns(savedSnapshot).filter((id) =>
    libraryHymns.some((hymn) => hymn.id === id),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      Promise.resolve().then(() => setOfflineStatus("unavailable"));
      return undefined;
    }
    if (process.env.NODE_ENV !== "production") return undefined;

    let serviceWorkerReady = false;
    const updateNetworkStatus = () => {
      setOfflineStatus(
        !navigator.onLine
          ? serviceWorkerReady
            ? "offline-ready"
            : "offline"
          : serviceWorkerReady
            ? "ready"
            : "checking",
      );
    };
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        serviceWorkerReady = true;
        updateNetworkStatus();
      })
      .catch((error) => {
        console.error("Could not enable offline hymn access.", error);
        setOfflineStatus("unavailable");
      });

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!selectedHymn) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setSelectedHymn(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedHymn]);

  const matchingHymns = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const numberQuery = query.trim().match(/^#?(\d+)$/);
    const collator = new Intl.Collator(language === "Yoruba" ? "yo" : "en", {
      sensitivity: "base",
    });
    return libraryHymns.filter((hymn) => {
      const matchesTopic =
        selectedTopic === "All hymns" || hymn.topics.includes(selectedTopic);
      const matchesView =
        activeView !== "saved" || savedIds.includes(hymn.id);
      const matchesQuery =
        !normalizedQuery ||
        (numberQuery
          ? hymn.number === Number(numberQuery[1])
          : normalizeText(
              `${hymn.title} ${hymn.author ?? ""} ${hymn.meter ?? ""} ${hymn.topics.join(" ")} ${hymn.verses.join(" ")} ${hymn.chorus?.join(" ") ?? ""}`,
            ).includes(normalizedQuery));
      return (
        hymn.language === language &&
        matchesTopic &&
        matchesView &&
        matchesQuery
      );
    }).sort((first, second) => collator.compare(first.title, second.title));
  }, [activeView, language, query, savedIds, selectedTopic]);
  const activeHymnCount = libraryHymns.filter(
    (hymn) =>
      hymn.language === language &&
      (selectedTopic === "All hymns" || hymn.topics.includes(selectedTopic)) &&
      (activeView !== "saved" || savedIds.includes(hymn.id)),
  ).length;
  const searchResults = query.trim() ? matchingHymns.slice(0, 8) : [];

  const availableLetters = useMemo(
    () => new Set(matchingHymns.map((hymn) => getHymnLetter(hymn.title))),
    [matchingHymns],
  );
  const visibleHymns = useMemo(
    () =>
      matchingHymns.filter(
        (hymn) =>
          !selectedLetter ||
          getHymnLetter(hymn.title) === selectedLetter,
      ),
    [matchingHymns, selectedLetter],
  );
  const letterGroups = useMemo(() => {
    const groups = new Map();
    for (const hymn of visibleHymns) {
      const letter = getHymnLetter(hymn.title);
      groups.set(letter, [...(groups.get(letter) ?? []), hymn]);
    }
    return [...groups.entries()];
  }, [visibleHymns]);
  const offlineLabel = {
    checking: "Preparing offline access",
    ready: "Offline access ready",
    offline: "Offline",
    "offline-ready": "Offline mode",
    unavailable: "Offline access unavailable",
    development: "Offline caching is active",
  }[offlineStatus];

  function chooseView(view) {
    setActiveView(view);
    setSelectedTopic("All hymns");
    setSelectedLetter("");
    setQuery("");
    setMenuOpen(false);
  }

  function openHymn(hymn) {
    setSelectedHymn(hymn);
    setQuery("");
    setSelectedSearchIndex(0);
  }

  function toggleSaved(id) {
    const nextSaved = savedIds.includes(id)
      ? savedIds.filter((savedId) => savedId !== id)
      : [...savedIds, id];
    try {
      window.localStorage.setItem(savedHymnsKey, JSON.stringify(nextSaved));
      window.dispatchEvent(new Event(savedHymnsEvent));
    } catch (error) {
      console.error("Could not save hymns to local storage.", error);
    }
  }

  function selectTheme(topic) {
    setActiveView("explore");
    setSelectedTopic(topic);
    setSelectedLetter("");
    document.getElementById("hymn-library")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function installApp() {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch (error) {
      console.error("Could not install the hymn app.", error);
    }
  }

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    try {
      window.localStorage.setItem(themeKey, nextTheme);
    } catch (error) {
      console.error("Could not save the selected theme to local storage.", error);
    }
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event(themeChangedEvent));
  }

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          aria-label="Close navigation menu"
          className="mobile-scrim"
          onClick={() => setMenuOpen(false)}
          type="button"
        />
      )}
      <aside className={`sidebar${menuOpen ? " mobile-open" : ""}`}>
        <a
          aria-label="GPA Hymns home"
          className="brand"
          href="#home"
          onClick={() => chooseView("explore")}
        >
          <BrandMark />
          <span>GPA Hymns</span>
        </a>
        <p className="side-label">Discover</p>
        <nav aria-label="Main navigation" className="side-nav">
          <button
            aria-current={activeView === "explore" ? "page" : undefined}
            className={`nav-button${activeView === "explore" ? " active" : ""}`}
            onClick={() => chooseView("explore")}
            type="button"
          >
            <Icon name="book" size={18} />
            Hymn library
          </button>
          <button
            className="nav-button"
            onClick={() => {
              chooseView("explore");
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
              chooseView("explore");
              (
                document.getElementById("alphabet-index") ??
                document.getElementById("hymn-library")
              )?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            type="button"
          >
            <Icon name="book" size={18} />
            Browse by title
          </button>
          <button
            aria-current={activeView === "saved" ? "page" : undefined}
            className={`nav-button${activeView === "saved" ? " active" : ""}`}
            onClick={() => chooseView("saved")}
            type="button"
          >
            <Icon name="heart" size={18} />
            My favourites
            <span className="nav-count">{savedIds.length || ""}</span>
          </button>
        </nav>
        <section aria-label="Offline access" className="offline-card">
          <span aria-hidden="true" className={`offline-indicator ${offlineStatus}`} />
          <div className="offline-card-copy">
            <strong>{offlineLabel}</strong>
            <p>Favourites stay on this device. Open the library online once to prepare it.</p>
          </div>
          {installPrompt && (
            <button className="offline-install" onClick={installApp} type="button">
              Install app
            </button>
          )}
        </section>
      </aside>

      <div className="main-shell" id="home">
        <header className="topbar">
          <button
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <Icon name="menu" size={18} />
          </button>
          <a className="mobile-brand" href="#home">
            <BrandMark />
            GPA Hymns
          </a>
          <div className="topbar-greeting">
            A quiet moment for your day
            <strong>Welcome to your hymn library</strong>
          </div>
          <div className="topbar-actions">
            <button
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              type="button"
            >
              <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
            </button>
            <form
              className="search-wrapper"
              onSubmit={(event) => {
                event.preventDefault();
                const result = searchResults[selectedSearchIndex] ?? searchResults[0];
                if (result) openHymn(result);
              }}
            >
              <label className="search-box">
                <Icon name="search" size={17} />
                <input
                  aria-activedescendant={
                    searchResults.length
                      ? `hymn-search-option-${selectedSearchIndex}`
                      : undefined
                  }
                  aria-autocomplete="list"
                  aria-controls="hymn-search-results"
                  aria-expanded={Boolean(query.trim())}
                  aria-haspopup="listbox"
                  aria-label="Search hymns"
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown" && searchResults.length) {
                      event.preventDefault();
                      setSelectedSearchIndex((index) =>
                        Math.min(index + 1, searchResults.length - 1),
                      );
                    } else if (event.key === "ArrowUp" && searchResults.length) {
                      event.preventDefault();
                      setSelectedSearchIndex((index) => Math.max(index - 1, 0));
                    } else if (event.key === "Escape") {
                      setQuery("");
                      setSelectedSearchIndex(0);
                    }
                  }}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedSearchIndex(0);
                  }}
                  onFocus={() => setSelectedSearchIndex(0)}
                  placeholder="Search hymn or number..."
                  role="combobox"
                  type="search"
                  value={query}
                />
              </label>
              {query.trim() && (
                <div
                  aria-label="Search results"
                  className="search-results"
                  id="hymn-search-results"
                  role="listbox"
                >
                  {searchResults.length ? (
                    searchResults.map((hymn, index) => (
                      <button
                        aria-selected={selectedSearchIndex === index}
                        className="search-result"
                        id={`hymn-search-option-${index}`}
                        key={hymn.id}
                        onClick={() => openHymn(hymn)}
                        onMouseEnter={() => setSelectedSearchIndex(index)}
                        role="option"
                        type="button"
                      >
                        {hymn.number && <span className="search-result-number">#{hymn.number}</span>}
                        <span className="search-result-copy">
                          <strong>{hymn.title}</strong>
                          <small>{hymn.topics[0]}</small>
                        </span>
                        <Icon name="arrow" size={14} />
                      </button>
                    ))
                  ) : (
                    <p
                      aria-disabled="true"
                      aria-selected="false"
                      className="search-no-results"
                      role="option"
                    >
                      No matching {language} hymns found.
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>
        </header>

        <main className="page-content">
          <section aria-labelledby="page-title">
            
            <h1 className="page-heading" id="page-title">
              {activeView === "saved" ? "Your favourites" : "Hymns for every season"}
            </h1>
            <p className="page-subtitle">
              {activeView === "saved"
                ? "The hymns you have kept close, all in one place."
                : "Browse the church hymn book by language, topic, or title."}
            </p>
          </section>

          <div aria-label="Hymn language" className="language-control language-control-top" role="group">
            <span>Language</span>
            <div className="language-options">
              {languages.map((item) => (
                <button
                  aria-pressed={language === item}
                  className={`language-button${language === item ? " selected" : ""}`}
                  key={item}
                  onClick={() => {
                    setLanguage(item);
                    setSelectedLetter("");
                    setSelectedTopic("All hymns");
                  }}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {activeView === "explore" && (
            <section aria-label="Church anthem" className="hero anthem-hero">
              <div className="hero-copy">
                <span className="hero-kicker">
                  <Icon name="sparkle" size={13} />
                  The church anthem
                </span>
                <h2>{churchAnthem.title}</h2>
                <p>The song that belongs to our church, at the heart of this hymn book.</p>
                <div className="hero-footer">
                  <button
                    className="primary-button"
                    onClick={() => openHymn(churchAnthem)}
                    type="button"
                  >
                    <Icon name="book" size={15} />
                    Open the anthem
                  </button>
                </div>
              </div>
              <div aria-hidden="true" className="hero-art">
                <Image
                  alt=""
                  className="hero-logo"
                  height={118}
                  unoptimized
                  src="/images/GPALogo.png"
                  width={118}
                />
              </div>
            </section>
          )}

          {activeView === "explore" && (
            <section aria-labelledby="topics-title" className="themes-section" id="themes">
              <details className="topics-dropdown">
                <summary aria-labelledby="topics-title">
                  <span className="topics-summary-copy">
                    <strong id="topics-title">
                      {language === "English"
                        ? "Topical contents"
                        : "AKOJOPO ORIN TI O WA NINU IWE YII"}
                    </strong>
                    <small>
                      {selectedTopic === "All hymns"
                        ? language === "English"
                          ? "Choose a category"
                          : "Yan ẹka orin kan"
                        : selectedTopic}
                    </small>
                  </span>
                  <span aria-hidden="true" className="topic-dropdown-indicator" />
                </summary>
                <div className="topic-list">
                  <button
                    aria-pressed={selectedTopic === "All hymns"}
                    className={`topic-link${selectedTopic === "All hymns" ? " selected" : ""}`}
                    onClick={(event) => {
                      selectTheme("All hymns");
                      event.currentTarget.closest("details").open = false;
                    }}
                    type="button"
                  >
                    <span className="topic-link-name">
                      {language === "English" ? "All hymns" : "Gbogbo orin"}
                    </span>
                    <span className="topic-link-count">
                      {libraryHymns.filter((hymn) => hymn.language === language).length}{" "}
                      {language === "English" ? "hymns" : "orin"}
                    </span>
                  </button>
                  {topics.map((topic) => {
                    const isSelected = selectedTopic === topic.name;
                    const hymnCount = libraryHymns.filter(
                      (hymn) =>
                        hymn.language === language &&
                        hymn.topics.includes(topic.name),
                    ).length;
                    return (
                      <button
                        aria-pressed={isSelected}
                        className={`topic-link${isSelected ? " selected" : ""}`}
                        key={topic.name}
                        onClick={(event) => {
                          selectTheme(topic.name);
                          event.currentTarget.closest("details").open = false;
                        }}
                        type="button"
                      >
                        <span className="topic-link-name">{topic.name}</span>
                        <span className="topic-link-count">
                          {hymnCount}{" "}
                          {language === "English"
                            ? hymnCount === 1
                              ? "hymn"
                              : "hymns"
                            : "orin"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </details>
            </section>
          )}

          <section aria-labelledby="library-title" className="library-section" id="hymn-library">
            <div className="section-heading">
              <div className="library-title">
                <h2 id="library-title">
                  {activeView === "saved"
                    ? "My favourites"
                    : selectedTopic === "All hymns"
                      ? "Hymn index"
                      : selectedTopic}
                </h2>
                <small>
                  {activeView === "saved"
                    ? `${visibleHymns.length} saved`
                    : selectedTopic === "All hymns"
                      ? `${visibleHymns.length} hymns`
                      : language === "English"
                        ? `${activeHymnCount} hymns in this topic`
                        : `${activeHymnCount} orin ninu ẹka yii`}
                </small>
              </div>
              {selectedTopic !== "All hymns" && activeView === "explore" && (
                <button
                  className="text-button"
                  onClick={() => {
                    setSelectedTopic("All hymns");
                    setSelectedLetter("");
                  }}
                  type="button"
                >
                  All topics
                </button>
              )}
              {activeView === "saved" && (
                <button className="text-button" onClick={() => chooseView("explore")} type="button">
                  Explore all hymns
                </button>
              )}
            </div>
            {activeHymnCount > 5 && (
              <div aria-label="Browse hymns alphabetically" className="alphabet-index" id="alphabet-index">
                <label className="alphabet-label" htmlFor="hymn-letter">
                  Browse by letter
                </label>
                <select
                  id="hymn-letter"
                  onChange={(event) => setSelectedLetter(event.target.value)}
                  value={selectedLetter}
                >
                  <option value="">All letters</option>
                  {alphabet
                    .filter((letter) => availableLetters.has(letter))
                    .map((letter) => (
                      <option key={letter} value={letter}>
                        {letter}
                      </option>
                    ))}
                </select>
                {selectedLetter && (
                  <button
                    className="clear-letter"
                    onClick={() => setSelectedLetter("")}
                    type="button"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
            {letterGroups.length ? (
              <div className="alphabet-groups">
                {letterGroups.map(([letter, letterHymns]) => (
                  <section aria-labelledby={`letter-${letter}`} className="letter-group" key={letter}>
                    <h3 id={`letter-${letter}`} className="letter-heading">{letter}</h3>
                    <div className="hymn-grid">
                      {letterHymns.map((hymn) => (
                        <HymnCard
                          hymn={hymn}
                          isSaved={savedIds.includes(hymn.id)}
                          key={hymn.id}
                          onOpen={openHymn}
                          onToggleSave={toggleSaved}
                          selectedTopic={selectedTopic === "All hymns" ? undefined : selectedTopic}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name={language === "Yoruba" ? "book" : activeView === "saved" ? "heart" : "search"} size={24} />
                <strong>
                  {activeView === "saved"
                    ? "No favourites yet"
                    : `No ${language} hymns found`}
                </strong>
                <p>
                  {activeView === "saved"
                    ? "Add a hymn to favourites with the heart icon and it will appear here on this device."
                    : "Try another title, composer, topic, or letter."}
                </p>
                {activeView === "saved" && (
                  <button className="text-button" onClick={() => chooseView("explore")} type="button">
                    Explore all hymns
                  </button>
                )}
                {query && (
                  <button className="text-button" onClick={() => setQuery("")} type="button">
                    Clear search
                  </button>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedHymn && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedHymn(null);
          }}
        >
          <section
            aria-labelledby="modal-title"
            aria-modal="true"
            className="hymn-modal"
            role="dialog"
          >
            <button
              aria-label="Close hymn"
              className="icon-button modal-close"
              onClick={() => setSelectedHymn(null)}
              type="button"
            >
              <Icon name="close" size={17} />
            </button>
            <span className="modal-label">
              <Icon name="book" size={14} />
              {selectedHymn.type ?? selectedHymn.topics?.join(" · ")} 
            </span>
            <h2 id="modal-title">{selectedHymn.title}</h2>
            {selectedHymn.author && <p className="modal-author">{selectedHymn.author}</p>}
            {selectedHymn.number && (
              <p className="modal-number">Hymn #{selectedHymn.number}</p>
            )}
            {selectedHymn.meter && <p className="modal-author">{selectedHymn.meter}</p>}
            <hr className="modal-rule" />
            {selectedHymn.verses.length > 0 && (
              <div className="hymn-verses">
                {selectedHymn.verses.map((verse, index) => (
                  <div className="hymn-verse-group" key={`${selectedHymn.id}-verse-${index + 1}`}>
                    <div className="hymn-verse">
                      <span className="verse-number">
                        {selectedHymn.verseNumbers?.[index] ?? index + 1}.
                      </span>
                      <p>{verse}</p>
                    </div>
                    {selectedHymn.chorus && (
                      <div className="hymn-chorus">
                        <strong>Chorus</strong>
                        <p>{selectedHymn.chorus.join("\n")}</p>
                        {selectedHymn.chorusRepeat && <small>{selectedHymn.chorusRepeat}</small>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {selectedHymn.id === churchAnthem.id ? (
              <div className="modal-actions">
                <span className="hero-meta">Gospel Pentecostal Assembly</span>
              </div>
            ) : (
              <>
                <div className="modal-actions">
                  <button
                    aria-pressed={savedIds.includes(selectedHymn.id)}
                    className="primary-button"
                    onClick={() => toggleSaved(selectedHymn.id)}
                    type="button"
                  >
                    <Icon
                      filled={savedIds.includes(selectedHymn.id)}
                      name="heart"
                      size={15}
                    />
                    {savedIds.includes(selectedHymn.id)
                      ? "Added to favourites"
                      : "Add to favourites"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

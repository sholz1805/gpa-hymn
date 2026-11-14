"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  englishTopics,
  suppliedHymns,
  yorubaTopics,
} from "../data/hymns";
import HymnDetailDialog from "./hymn-library/hymn-detail-dialog";
import LibraryContent from "./hymn-library/library-content";
import LibraryHeader from "./hymn-library/library-header";
import LibrarySidebar from "./hymn-library/library-sidebar";

const libraryHymns = suppliedHymns;
const savedHymnsKey = "gpa-hymn-library:saved";
const savedHymnsEvent = "gpa-hymn-library:saved-change";
const themeKey = "gpa-hymn-library:theme";
const themeChangedEvent = "gpa-hymn-library:theme-change";

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getHymnLetter(title) {
  return normalizeText(title).charAt(0).toUpperCase();
}

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

function useLibraryPreferences() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light",
  );
  const savedSnapshot = useSyncExternalStore(
    subscribeToSavedHymns,
    getSavedHymnsSnapshot,
    () => "[]",
  );
  const savedIds = parseSavedHymns(savedSnapshot).filter((id) =>
    libraryHymns.some((hymn) => hymn.id === id),
  );

  return { theme, savedIds };
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
  const { theme, savedIds } = useLibraryPreferences();
  const topics = language === "English" ? englishTopics : yorubaTopics;

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
      .register("/sw.js", { updateViaCache: "none" })
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

    return libraryHymns
      .filter((hymn) => {
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
      })
      .sort((first, second) => {
        const firstTitle = normalizeText(first.title);
        const secondTitle = normalizeText(second.title);
        return firstTitle < secondTitle ? -1 : firstTitle > secondTitle ? 1 : 0;
      });
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

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setSelectedLetter("");
    setSelectedTopic("All hymns");
  }

  return (
    <div className="app-shell">
      <LibrarySidebar
        activeView={activeView}
        installPrompt={installPrompt}
        menuOpen={menuOpen}
        offlineLabel={offlineLabel}
        offlineStatus={offlineStatus}
        onChooseView={chooseView}
        onCloseMenu={() => setMenuOpen(false)}
        onInstall={installApp}
        savedCount={savedIds.length}
      />
      <div className="main-shell" id="home">
        <LibraryHeader
          language={language}
          menuOpen={menuOpen}
          query={query}
          searchResults={searchResults}
          selectedSearchIndex={selectedSearchIndex}
          theme={theme}
          onOpenHymn={openHymn}
          onQueryChange={setQuery}
          onSelectedSearchIndexChange={setSelectedSearchIndex}
          onToggleMenu={() => setMenuOpen((open) => !open)}
          onToggleTheme={toggleTheme}
        />
        <LibraryContent
          activeHymnCount={activeHymnCount}
          activeView={activeView}
          availableLetters={availableLetters}
          language={language}
          letterGroups={letterGroups}
          query={query}
          savedIds={savedIds}
          selectedLetter={selectedLetter}
          selectedTopic={selectedTopic}
          topics={topics}
          visibleHymns={visibleHymns}
          onChooseView={chooseView}
          onClearQuery={() => setQuery("")}
          onLanguageChange={changeLanguage}
          onOpenHymn={openHymn}
          onSelectLetter={setSelectedLetter}
          onSelectTopic={selectTheme}
          onToggleSaved={toggleSaved}
        />
      </div>
      <HymnDetailDialog
        hymn={selectedHymn}
        saved={selectedHymn ? savedIds.includes(selectedHymn.id) : false}
        onClose={() => setSelectedHymn(null)}
        onToggleSaved={toggleSaved}
      />
    </div>
  );
}

import { Icon, BrandMark } from "./ui";

export default function LibraryHeader({
  theme,
  menuOpen,
  query,
  searchResults,
  selectedSearchIndex,
  language,
  onToggleTheme,
  onToggleMenu,
  onQueryChange,
  onSelectedSearchIndexChange,
  onOpenHymn,
}) {
  function handleSearchSubmit(event) {
    event.preventDefault();
    const result = searchResults[selectedSearchIndex] ?? searchResults[0];
    if (result) onOpenHymn(result);
  }

  function handleSearchKeyDown(event) {
    if (event.key === "ArrowDown" && searchResults.length) {
      event.preventDefault();
      onSelectedSearchIndexChange((index) =>
        Math.min(index + 1, searchResults.length - 1),
      );
    } else if (event.key === "ArrowUp" && searchResults.length) {
      event.preventDefault();
      onSelectedSearchIndexChange((index) => Math.max(index - 1, 0));
    } else if (event.key === "Escape") {
      onQueryChange("");
      onSelectedSearchIndexChange(0);
    }
  }

  return (
    <header className="topbar">
      <button
        aria-label="Open navigation menu"
        aria-expanded={menuOpen}
        className="menu-toggle"
        onClick={onToggleMenu}
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
          onClick={onToggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          type="button"
        >
          <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
        </button>
        <form className="search-wrapper" onSubmit={handleSearchSubmit}>
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
              onKeyDown={handleSearchKeyDown}
              onChange={(event) => {
                onQueryChange(event.target.value);
                onSelectedSearchIndexChange(0);
              }}
              onFocus={() => onSelectedSearchIndexChange(0)}
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
                    onClick={() => onOpenHymn(hymn)}
                    onMouseEnter={() => onSelectedSearchIndexChange(index)}
                    role="option"
                    type="button"
                  >
                    {hymn.number && (
                      <span className="search-result-number">
                        #{hymn.number}
                      </span>
                    )}
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
  );
}

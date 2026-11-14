import Image from "next/image";
import { churchAnthem, languages, suppliedHymns } from "../../data/hymns";
import { HymnCard, Icon } from "./ui";

function PageIntro({ activeView }) {
  return (
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
  );
}

function LanguageControl({ language, onChange }) {
  return (
    <div
      aria-label="Hymn language"
      className="language-control language-control-top"
      role="group"
    >
      <span>Language</span>
      <div className="language-options">
        {languages.map((item) => (
          <button
            aria-pressed={language === item}
            className={`language-button${language === item ? " selected" : ""}`}
            key={item}
            onClick={() => onChange(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function AnthemBanner({ onOpen }) {
  return (
    <section aria-label="Church anthem" className="hero anthem-hero">
      <div className="hero-copy">
        <span className="hero-kicker">
          <Icon name="sparkle" size={13} />
          The church anthem
        </span>
        <h2>{churchAnthem.title}</h2>
        <p>
          The song that belongs to our church, at the heart of this hymn book.
        </p>
        <div className="hero-footer">
          <button
            className="primary-button"
            onClick={() => onOpen(churchAnthem)}
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
          loading="eager"
          unoptimized
          src="/images/GPALogo.png"
          width={118}
        />
      </div>
    </section>
  );
}

function TopicBrowser({
  language,
  topics,
  selectedTopic,
  onSelectTopic,
}) {
  const allHymnCount = suppliedHymns.filter(
    (hymn) => hymn.language === language,
  ).length;

  function chooseTopic(event, topic) {
    onSelectTopic(topic);
    event.currentTarget.closest("details").open = false;
  }

  return (
    <section
      aria-labelledby="topics-title"
      className="themes-section"
      id="themes"
    >
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
            onClick={(event) => chooseTopic(event, "All hymns")}
            type="button"
          >
            <span className="topic-link-name">
              {language === "English" ? "All hymns" : "Gbogbo orin"}
            </span>
            <span className="topic-link-count">
              {allHymnCount} {language === "English" ? "hymns" : "orin"}
            </span>
          </button>
          {topics.map((topic) => {
            const isSelected = selectedTopic === topic.name;
            const hymnCount = suppliedHymns.filter(
              (hymn) =>
                hymn.language === language &&
                hymn.topics.includes(topic.name),
            ).length;

            return (
              <button
                aria-pressed={isSelected}
                className={`topic-link${isSelected ? " selected" : ""}`}
                key={topic.name}
                onClick={(event) => chooseTopic(event, topic.name)}
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
  );
}

function HymnIndex({
  activeView,
  language,
  selectedTopic,
  selectedLetter,
  availableLetters,
  visibleHymns,
  letterGroups,
  savedIds,
  activeHymnCount,
  query,
  onSelectLetter,
  onSelectTopic,
  onChooseView,
  onOpenHymn,
  onToggleSaved,
  onClearQuery,
}) {
  return (
    <section
      aria-labelledby="library-title"
      className="library-section"
      id="hymn-library"
    >
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
            onClick={() => onSelectTopic("All hymns")}
            type="button"
          >
            All topics
          </button>
        )}
        {activeView === "saved" && (
          <button
            className="text-button"
            onClick={() => onChooseView("explore")}
            type="button"
          >
            Explore all hymns
          </button>
        )}
      </div>

      {activeHymnCount > 5 && (
        <div
          aria-label="Browse hymns alphabetically"
          className="alphabet-index"
          id="alphabet-index"
        >
          <label className="alphabet-label" htmlFor="hymn-letter">
            Browse by letter
          </label>
          <select
            id="hymn-letter"
            onChange={(event) => onSelectLetter(event.target.value)}
            value={selectedLetter}
          >
            <option value="">All letters</option>
            {[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
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
              onClick={() => onSelectLetter("")}
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
            <section
              aria-labelledby={`letter-${letter}`}
              className="letter-group"
              key={letter}
            >
              <h3 className="letter-heading" id={`letter-${letter}`}>
                {letter}
              </h3>
              <div className="hymn-grid">
                {letterHymns.map((hymn) => (
                  <HymnCard
                    hymn={hymn}
                    isSaved={savedIds.includes(hymn.id)}
                    key={hymn.id}
                    onOpen={onOpenHymn}
                    onToggleSave={onToggleSaved}
                    selectedTopic={
                      selectedTopic === "All hymns"
                        ? undefined
                        : selectedTopic
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon
            name={
              language === "Yoruba"
                ? "book"
                : activeView === "saved"
                  ? "heart"
                  : "search"
            }
            size={24}
          />
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
            <button
              className="text-button"
              onClick={() => onChooseView("explore")}
              type="button"
            >
              Explore all hymns
            </button>
          )}
          {query && (
            <button
              className="text-button"
              onClick={onClearQuery}
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function LibraryContent(props) {
  return (
    <main className="page-content">
      <PageIntro activeView={props.activeView} />
      <LanguageControl
        language={props.language}
        onChange={props.onLanguageChange}
      />
      {props.activeView === "explore" && (
        <>
          <AnthemBanner onOpen={props.onOpenHymn} />
          <TopicBrowser
            language={props.language}
            onSelectTopic={props.onSelectTopic}
            selectedTopic={props.selectedTopic}
            topics={props.topics}
          />
        </>
      )}
      <HymnIndex {...props} />
    </main>
  );
}

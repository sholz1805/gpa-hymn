import { churchAnthem } from "../../data/hymns";
import { Icon } from "./ui";

export default function HymnDetailDialog({
  hymn,
  saved,
  onClose,
  onToggleSaved,
}) {
  if (!hymn) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
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
          onClick={onClose}
          type="button"
        >
          <Icon name="close" size={17} />
        </button>
        <span className="modal-label">
          <Icon name="book" size={14} />
          {hymn.type ?? hymn.topics?.join(" · ")}
        </span>
        <h2 id="modal-title">{hymn.title}</h2>
        {hymn.author && <p className="modal-author">{hymn.author}</p>}
        {hymn.number && (
          <p className="modal-number">Hymn #{hymn.number}</p>
        )}
        {hymn.meter && <p className="modal-author">{hymn.meter}</p>}
        <hr className="modal-rule" />
        {hymn.verses.length > 0 && (
          <div className="hymn-verses">
            {hymn.verses.map((verse, index) => (
              <div
                className="hymn-verse-group"
                key={`${hymn.id}-verse-${index + 1}`}
              >
                <div className="hymn-verse">
                  <span className="verse-number">
                    {hymn.verseNumbers?.[index] ?? index + 1}.
                  </span>
                  <p>{verse}</p>
                </div>
                {hymn.chorus && (
                  <div className="hymn-chorus">
                    <strong>Chorus</strong>
                    <p>{hymn.chorus.join("\n")}</p>
                    {hymn.chorusRepeat && (
                      <small>{hymn.chorusRepeat}</small>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {hymn.id === churchAnthem.id ? (
          <div className="modal-actions">
            <span className="hero-meta">Gospel Pentecostal Assembly</span>
          </div>
        ) : (
          <div className="modal-actions">
            <button
              aria-pressed={saved}
              className="primary-button"
              onClick={() => onToggleSaved(hymn.id)}
              type="button"
            >
              <Icon filled={saved} name="heart" size={15} />
              {saved ? "Added to favourites" : "Add to favourites"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

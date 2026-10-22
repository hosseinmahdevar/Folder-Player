/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Characters & Bookmarks Manager
 * Implements characters.sabp.xml and bookmarks.sabp.xml tracking
 */
import { useState } from "react";
import {
  Users,
  Bookmark as BookmarkIcon,
  Search,
  Plus,
  Play,
  Trash2,
  UserPlus,
  Tag,
  FileText,
  X,
  ArrowRight
} from "lucide-react";
const CharactersBookmarksView = ({
  book,
  currentPositionMs,
  onSeekBookmark,
  onAddBookmark,
  onAddCharacter,
  onDeleteBookmark,
  onDeleteCharacter,
  onBackToPlayer
}) => {
  const [activeTab, setActiveTab] = useState("characters");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCharModal, setShowAddCharModal] = useState(false);
  const [newCharName, setNewCharName] = useState("");
  const [newCharRole, setNewCharRole] = useState("");
  const [newCharDesc, setNewCharDesc] = useState("");
  const [newCharAllegiance, setNewCharAllegiance] = useState("");
  const [showAddBmModal, setShowAddBmModal] = useState(false);
  const [newBmTitle, setNewBmTitle] = useState("");
  const [newBmDesc, setNewBmDesc] = useState("");
  const [characters, setCharacters] = useState([
    {
      id: "c1",
      bookId: book.id,
      name: "Kaladin Stormblessed",
      role: "Bridge Four Leader & Former Surgeon Apprentice",
      description: "Enslaved darkeyes soldier branded with the shash glyph. Possesses proto-Windrunner gravity and stormlight capabilities.",
      allegiance: "Bridge Four / Alethkar",
      colorAccent: "#38bdf8"
    },
    {
      id: "c2",
      bookId: book.id,
      name: "Dalinar Kholin",
      role: "Highprince of War / The Blackthorn",
      description: "Brother to late King Gavilar. Experiences tactical visions during highstorms and follows the ancient Radiant Way of Kings.",
      allegiance: "House Kholin",
      colorAccent: "#f59e0b"
    },
    {
      id: "c3",
      bookId: book.id,
      name: "Shallan Davar",
      role: "Scholar Ward to Jasnah Kholin",
      description: "Veden noblewoman seeking to rescue her family from debt; secretly plots to substitute a broken Soulcaster.",
      allegiance: "House Davar",
      colorAccent: "#ec4899"
    },
    {
      id: "c4",
      bookId: book.id,
      name: "Sylphrena (Syl)",
      role: "Honorspren companion",
      description: "Airborne windspren entity in female shape, linked to Kaladin through the emerging Nahel bond.",
      allegiance: "Cognitive Realm",
      colorAccent: "#10b981"
    },
    {
      id: "c5",
      bookId: book.id,
      name: "Szeth-son-son-Vallano",
      role: "The Assassin in White",
      description: "Truthless of Shinovar wielding an Honorblade. Compelled to assassinate monarchs by whoever commands his Oathstone.",
      allegiance: "Shinovar / Oathstone Bearer",
      colorAccent: "#e2e8f0"
    }
  ]);
  const [bookmarks, setBookmarks] = useState([
    {
      id: "b1",
      bookId: book.id,
      title: "The Honor Chasm Contemplation",
      description: "Kaladin looks into the chasm abyss in the rain before Syl returns with the poison leaf.",
      fileName: "018_The_Way_of_Kings_Ch24.mp3",
      filePositionMs: 1118200,
      globalPositionMs: 1118200,
      createdAtEpochMs: Date.now() - 864e5,
      colorTag: "amber"
    },
    {
      id: "b2",
      bookId: book.id,
      title: "First Bridge Four Charge",
      description: "The terrifying reality of carrying the wooden span under Parshendi chasm fire.",
      fileName: "006_The_Way_of_Kings_Ch11.mp3",
      filePositionMs: 482100,
      globalPositionMs: 482100,
      createdAtEpochMs: Date.now() - 864e5 * 2,
      colorTag: "blue"
    },
    {
      id: "b3",
      bookId: book.id,
      title: "Dalinar Questions His Sanity",
      description: "Discussion with Navani and Elhokar regarding the highstorm apparitions.",
      fileName: "012_The_Way_of_Kings_Ch15.mp3",
      filePositionMs: 1842e3,
      globalPositionMs: 1842e3,
      createdAtEpochMs: Date.now() - 864e5 * 3,
      colorTag: "green"
    }
  ]);
  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1e3);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor(totalSec % 3600 / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const handleCreateBookmark = (e) => {
    e.preventDefault();
    if (!newBmTitle.trim()) return;
    const newBm = {
      id: `bm-${Date.now()}`,
      bookId: book.id,
      title: newBmTitle,
      description: newBmDesc,
      fileName: book.files[book.currentFileIndex]?.fileName || "current_track.mp3",
      filePositionMs: currentPositionMs,
      globalPositionMs: currentPositionMs,
      createdAtEpochMs: Date.now(),
      colorTag: "amber"
    };
    setBookmarks([newBm, ...bookmarks]);
    onAddBookmark(newBmTitle, newBmDesc);
    setNewBmTitle("");
    setNewBmDesc("");
    setShowAddBmModal(false);
  };
  const handleCreateCharacter = (e) => {
    e.preventDefault();
    if (!newCharName.trim()) return;
    const newChar = {
      id: `char-${Date.now()}`,
      bookId: book.id,
      name: newCharName,
      role: newCharRole,
      description: newCharDesc,
      allegiance: newCharAllegiance,
      colorAccent: "#f59e0b"
    };
    setCharacters([...characters, newChar]);
    onAddCharacter(newChar);
    setNewCharName("");
    setNewCharRole("");
    setNewCharDesc("");
    setNewCharAllegiance("");
    setShowAddCharModal(false);
  };
  const filteredCharacters = characters.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()) || c.allegiance && c.allegiance.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBookmarks = bookmarks.filter(
    (b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.description.toLowerCase().includes(searchQuery.toLowerCase()) || b.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-lg hardware-plate">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)]/15 border border-[var(--primary-container)]/30 flex items-center justify-center text-[var(--primary-container)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[var(--primary)]">
              Characters & Bookmark Notes
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Tome narrative companion stored in <span className="font-mono text-[var(--primary-container)]">characters.sabp.xml</span> & <span className="font-mono text-[var(--primary-container)]">bookmarks.sabp.xml</span>
            </p>
          </div>
        </div>

        <button
    onClick={onBackToPlayer}
    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--primary-container)] text-[var(--bg-base)] shadow-md hover:brightness-105 transition-all"
  >
          <span>Return to Player</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {
    /* Tabs Toolbar */
  }
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-md">
        <div className="flex items-center gap-1 bg-[var(--bg-surface-lowest)] p-1 rounded-lg border border-[var(--border-subtle)]">
          <button
    onClick={() => setActiveTab("characters")}
    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "characters" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-high)]"}`}
  >
            <Users className="w-3.5 h-3.5" />
            <span>Character Roster ({characters.length})</span>
          </button>

          <button
    onClick={() => setActiveTab("bookmarks")}
    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "bookmarks" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-high)]"}`}
  >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span>Timestamped Bookmarks ({bookmarks.length})</span>
          </button>

          <button
    onClick={() => setActiveTab("info")}
    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "info" ? "bg-[var(--bg-surface-high)] text-[var(--primary-container)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-high)]"}`}
  >
            <FileText className="w-3.5 h-3.5" />
            <span>Synopsis (info.txt)</span>
          </button>
        </div>

        {
    /* Search & Add Bar */
  }
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
            <input
    type="text"
    placeholder={`Search ${activeTab}...`}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-high)] rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary-container)]"
  />
          </div>

          {activeTab === "characters" && <button
    onClick={() => setShowAddCharModal(true)}
    className="hardware-plate flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--primary-container)] hover:bg-[var(--bg-surface-high)] transition-colors whitespace-nowrap"
  >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Character</span>
            </button>}

          {activeTab === "bookmarks" && <button
    onClick={() => setShowAddBmModal(true)}
    className="hardware-plate flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--primary-container)] hover:bg-[var(--bg-surface-high)] transition-colors whitespace-nowrap"
  >
              <Plus className="w-3.5 h-3.5" />
              <span>Bookmark Now ({formatTime(currentPositionMs)})</span>
            </button>}
        </div>
      </div>

      {
    /* CONTENT TAB 1: Characters Directory */
  }
      {activeTab === "characters" && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map((char) => <div
    key={char.id}
    className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md hardware-plate hover:border-[var(--primary-container)]/40 transition-colors"
  >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-bold text-[var(--primary)] leading-snug">
                    {char.name}
                  </h3>
                  <button
    onClick={() => {
      setCharacters(characters.filter((c) => c.id !== char.id));
      onDeleteCharacter(char.id);
    }}
    className="text-[var(--text-muted)] hover:text-red-400 p-0.5"
    title="Delete character note"
  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[11px] font-mono font-semibold text-[var(--primary-container)] leading-tight">
                  {char.role}
                </span>

                <p className="text-xs text-[var(--text-high)] leading-relaxed mt-1">
                  {char.description}
                </p>
              </div>

              {char.allegiance && <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                  <Tag className="w-3 h-3 text-[var(--tertiary)]" />
                  <span className="font-mono text-[10px] uppercase font-bold text-[var(--tertiary)] truncate">
                    {char.allegiance}
                  </span>
                </div>}
            </div>)}
        </div>}

      {
    /* CONTENT TAB 2: Bookmarks */
  }
      {activeTab === "bookmarks" && <div className="flex flex-col gap-3">
          {filteredBookmarks.map((bm) => <div
    key={bm.id}
    className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between gap-4 shadow-md hardware-plate hover:border-[var(--primary-container)]/40 transition-colors"
  >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
    onClick={() => onSeekBookmark(bm.filePositionMs, bm.fileName)}
    className="w-10 h-10 rounded-lg bg-[var(--primary-container)] text-[var(--bg-base)] flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform shadow-md"
    title="Jump to bookmark position"
  >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm font-bold text-[var(--primary)] truncate">
                      {bm.title}
                    </h3>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--bg-surface-high)] text-[var(--primary-container)]">
                      {formatTime(bm.filePositionMs)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                    {bm.description}
                  </p>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                    File: {bm.fileName}
                  </span>
                </div>
              </div>

              <button
    onClick={() => {
      setBookmarks(bookmarks.filter((b) => b.id !== bm.id));
      onDeleteBookmark(bm.id);
    }}
    className="text-[var(--text-muted)] hover:text-red-400 p-2 shrink-0"
    title="Remove bookmark"
  >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>)}
        </div>}

      {
    /* CONTENT TAB 3: Synopsis (info.txt) */
  }
      {activeTab === "info" && <div className="bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-md hardware-plate flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--primary-container)]" />
              <h2 className="font-serif text-base font-bold text-[var(--primary)]">
                Local Tome Synopsis ({book.folderPath}/info.txt)
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--secondary)]">UTF-8 Plaintext</span>
          </div>
          <pre className="font-sans text-sm text-[var(--text-high)] leading-relaxed whitespace-pre-wrap">
            {book.sidecars.infoTxt}
          </pre>
        </div>}

      {
    /* Modal: Add Character */
  }
      {showAddCharModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl flex flex-col gap-4 hardware-plate-raised">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <h3 className="font-serif text-base font-bold text-[var(--primary)]">
                Add Character Note (characters.sabp.xml)
              </h3>
              <button onClick={() => setShowAddCharModal(false)} className="text-[var(--text-muted)] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCharacter} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1">Character Name:</label>
                <input
    type="text"
    required
    placeholder="e.g. Jasnah Kholin"
    value={newCharName}
    onChange={(e) => setNewCharName(e.target.value)}
    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs text-white"
  />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1">Role / Epithet:</label>
                <input
    type="text"
    placeholder="e.g. Alethi Princess & Scholar"
    value={newCharRole}
    onChange={(e) => setNewCharRole(e.target.value)}
    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs text-white"
  />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1">Description / Notes:</label>
                <textarea
    rows={3}
    placeholder="Notable traits, patronymic, secrets, plot points..."
    value={newCharDesc}
    onChange={(e) => setNewCharDesc(e.target.value)}
    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs text-white"
  />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1">Allegiance / House:</label>
                <input
    type="text"
    placeholder="e.g. House Kholin / The Veristitalians"
    value={newCharAllegiance}
    onChange={(e) => setNewCharAllegiance(e.target.value)}
    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs text-white"
  />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setShowAddCharModal(false)}
    className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--primary-container)] text-[var(--bg-base)]"
  >
                  Save to Sidecar
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Modal: Add Bookmark */
  }
      {showAddBmModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl flex flex-col gap-4 hardware-plate-raised">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <h3 className="font-serif text-base font-bold text-[var(--primary)]">
                Add Bookmark ({formatTime(currentPositionMs)})
              </h3>
              <button onClick={() => setShowAddBmModal(false)} className="text-[var(--text-muted)] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBookmark} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1">Bookmark Title:</label>
                <input
    type="text"
    required
    placeholder="e.g. Clue discovered in tavern"
    value={newBmTitle}
    onChange={(e) => setNewBmTitle(e.target.value)}
    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs text-white"
  />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--text-muted)] block mb-1">Note / Thoughts:</label>
                <textarea
    rows={3}
    placeholder="Passage commentary or narrative reminder..."
    value={newBmDesc}
    onChange={(e) => setNewBmDesc(e.target.value)}
    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs text-white"
  />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
    type="button"
    onClick={() => setShowAddBmModal(false)}
    className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--primary-container)] text-[var(--bg-base)]"
  >
                  Save Bookmark
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  CharactersBookmarksView
};

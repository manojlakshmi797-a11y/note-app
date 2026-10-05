import { useState } from 'react'

const noteColors = [
  { name: 'white', label: 'White', swatch: 'bg-white', surface: 'bg-white' },
  { name: 'rose', label: 'Rose', swatch: 'bg-rose-200', surface: 'bg-rose-50' },
  { name: 'amber', label: 'Amber', swatch: 'bg-amber-200', surface: 'bg-amber-50' },
  { name: 'mint', label: 'Mint', swatch: 'bg-emerald-200', surface: 'bg-emerald-50' },
  { name: 'sky', label: 'Sky', swatch: 'bg-sky-200', surface: 'bg-sky-50' },
  { name: 'lilac', label: 'Lilac', swatch: 'bg-violet-200', surface: 'bg-violet-50' },
]

function ColorPicker({ name, value, onChange }) {
  return (
    <fieldset className="mb-4">
      <legend className="mb-2 text-sm font-medium text-gray-700">Color</legend>
      <div className="flex gap-3">
        {noteColors.map((color) => (
          <label key={color.name} className="cursor-pointer" title={color.label}>
            <input
              type="radio"
              name={name}
              value={color.name}
              checked={value === color.name}
              onChange={() => onChange(color.name)}
              className="peer sr-only"
            />
            <span
              className={`block size-7 rounded-full border border-gray-300 ${color.swatch} peer-checked:outline peer-checked:outline-2 peer-checked:outline-offset-2 peer-checked:outline-gray-700`}
            />
            <span className="sr-only">{color.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function App() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('white')
  const [notes, setNotes] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editColor, setEditColor] = useState('white')

  function addNote(event) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent) return

    setNotes((currentNotes) => [
      ...currentNotes,
      { id: crypto.randomUUID(), title: trimmedTitle, content: trimmedContent, color },
    ])
    setTitle('')
    setContent('')
    setColor('white')
  }

  function startEditing(note) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
    setEditColor(note.color)
  }

  function saveEdit(event, noteId) {
    event.preventDefault()
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()
    if (!trimmedTitle || !trimmedContent) return

    setNotes((currentNotes) => currentNotes.map((note) => (
      note.id === noteId
        ? { ...note, title: trimmedTitle, content: trimmedContent, color: editColor }
        : note
    )))
    setEditingId(null)
  }

  function deleteNote(noteId) {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId))
    if (editingId === noteId) setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        My Notes
      </h1>

      <form onSubmit={addNote} className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Create Note
        </h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mb-3 w-full rounded border p-3"
          required
        />

        <textarea
          placeholder="Take a note..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="mb-3 w-full rounded border p-3"
          rows="5"
          required
        />

        <ColorPicker name="new-note-color" value={color} onChange={setColor} />

        <button type="submit" className="rounded bg-blue-500 px-5 py-2 text-white hover:bg-blue-600">
          Add Note
        </button>
      </form>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Notes">
        {notes.map((note) => (
          <article
            key={note.id}
            className={`rounded-lg p-5 shadow ${noteColors.find((item) => item.name === note.color)?.surface ?? 'bg-white'}`}
          >
            {editingId === note.id ? (
              <form onSubmit={(event) => saveEdit(event, note.id)}>
                <input
                  type="text"
                  aria-label="Edit title"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="mb-3 w-full rounded border border-gray-300 bg-white/80 p-2"
                  required
                />
                <textarea
                  aria-label="Edit note"
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  className="mb-3 w-full rounded border border-gray-300 bg-white/80 p-2"
                  rows="4"
                  required
                />
                <ColorPicker
                  name={`edit-color-${note.id}`}
                  value={editColor}
                  onChange={setEditColor}
                />
                <div className="flex gap-2">
                  <button type="submit" className="rounded bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded border border-gray-400 px-3 py-2 text-sm text-gray-700 hover:bg-white/70">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="mb-2 text-lg font-semibold text-gray-800">{note.title}</h2>
                <p className="whitespace-pre-wrap text-gray-700">{note.content}</p>
                <div className="mt-4 flex gap-2 border-t border-gray-900/10 pt-3">
                  <button type="button" onClick={() => startEditing(note)} className="rounded border border-gray-400 px-3 py-1.5 text-sm text-gray-700 hover:bg-white/70">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteNote(note.id)} className="rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-100">
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

export default App;
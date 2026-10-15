import axios from 'axios'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type Note = {
  id: number | string
  title: string
  content: string
  color: string
  tags: string[]
  archived: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

type NewNote = Pick<Note, 'title' | 'content' | 'color'> & Partial<Pick<Note, 'tags' | 'archived' | 'stock'>>
type NoteUpdates = Partial<Omit<Note, 'id' | 'createdAt'>>

type NotesContextValue = {
  notes: Note[]
  loading: boolean
  error: string | null
  createNote: (note: NewNote) => Promise<void>
  updateNote: (id: Note['id'], updates: NoteUpdates) => Promise<void>
  deleteNote: (id: Note['id']) => Promise<void>
  toggleArchive: (id: Note['id']) => Promise<void>
  searchNotes: (query: string) => Note[]
  fetchNotes: () => Promise<void>
}

const api = axios.create({ baseURL: 'http://localhost:3001' })
const NotesContext = createContext<NotesContextValue | undefined>(undefined)

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message
  }

  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRequests = useRef(0)

  const beginRequest = () => {
    activeRequests.current += 1
    setLoading(true)
    setError(null)
  }

  const endRequest = () => {
    activeRequests.current -= 1
    setLoading(activeRequests.current > 0)
  }

  const fetchNotes = useCallback(async () => {
    beginRequest()
    try {
      const response = await api.get<Note[]>('/notes')
      setNotes(response.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      throw requestError
    } finally {
      endRequest()
    }
  }, [])

  useEffect(() => {
    void fetchNotes().catch(() => {})
  }, [fetchNotes])

  const createNote = async (note: NewNote) => {
    const now = new Date().toISOString()
    const newNote = {
      ...note,
      tags: note.tags ?? [],
      archived: note.archived ?? false,
      stock: note.stock ?? 0,
      createdAt: now,
      updatedAt: now,
    }

    beginRequest()
    try {
      const response = await api.post<Note>('/notes', newNote)
      setNotes((currentNotes) => [...currentNotes, response.data])
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      throw requestError
    } finally {
      endRequest()
    }
  }

  const updateNote = async (id: Note['id'], updates: NoteUpdates) => {
    beginRequest()
    try {
      const response = await api.patch<Note>(`/notes/${id}`, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      setNotes((currentNotes) => currentNotes.map((note) => (
        String(note.id) === String(id) ? response.data : note
      )))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      throw requestError
    } finally {
      endRequest()
    }
  }

  const deleteNote = async (id: Note['id']) => {
    beginRequest()
    try {
      await api.delete(`/notes/${id}`)
      setNotes((currentNotes) => currentNotes.filter((note) => String(note.id) !== String(id)))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      throw requestError
    } finally {
      endRequest()
    }
  }

  const toggleArchive = async (id: Note['id']) => {
    const note = notes.find((item) => String(item.id) === String(id))
    if (!note) {
      const message = 'The note could not be found.'
      setError(message)
      throw new Error(message)
    }

    await updateNote(id, { archived: !note.archived })
  }

  const searchNotes = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return notes

    return notes.filter((note) => (
      note.title.toLowerCase().includes(normalizedQuery)
      || note.content.toLowerCase().includes(normalizedQuery)
      || note.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
    ))
  }

  return (
    <NotesContext.Provider value={{
      notes,
      loading,
      error,
      createNote,
      updateNote,
      deleteNote,
      toggleArchive,
      searchNotes,
      fetchNotes,
    }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider.')
  }

  return context
}

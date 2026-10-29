import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NotesByDay = Record<string, Record<string, string>>;

const STORAGE_KEY = "@lize/hour-notes-v1";

export function useHourNotes() {
  const [notesByDay, setNotesByDay] = useState<NotesByDay>({});
  const [notesReady, setNotesReady] = useState(false);
  const notesRef = useRef<NotesByDay>({});

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved) as NotesByDay;

          if (!cancelled && parsed && typeof parsed === "object") {
            notesRef.current = parsed;
            setNotesByDay(parsed);
          }
        }
      } catch (error) {
        console.warn("Could not load hour notes:", error);
      } finally {
        if (!cancelled) {
          setNotesReady(true);
        }
      }
    }

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  const setHourNote = useCallback(
    (dayKey: string, hour: number, note: string) => {
      const next: NotesByDay = { ...notesRef.current };
      const dayNotes = { ...(next[dayKey] ?? {}) };
      const hourKey = String(hour);
      const trimmedNote = note.trim();

      if (trimmedNote) {
        dayNotes[hourKey] = trimmedNote;
      } else {
        delete dayNotes[hourKey];
      }

      if (Object.keys(dayNotes).length > 0) {
        next[dayKey] = dayNotes;
      } else {
        delete next[dayKey];
      }

      notesRef.current = next;
      setNotesByDay(next);

      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(
        (error) => {
          console.warn("Could not save hour note:", error);
        },
      );
    },
    [],
  );

  return { notesByDay, notesReady, setHourNote };
}
export type HourMark = "wasted" | "not-wasted";
export type DayMarks = Record<string, HourMark>;
export type SavedMarks = Record<string, DayMarks>;

export type SelectedHour = {
  hour: number;
  dayKey: string;
} | null;

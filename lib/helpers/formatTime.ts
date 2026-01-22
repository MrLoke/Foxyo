import { format, isToday } from "date-fns";
import { pl } from "date-fns/locale";

export const formatTime = (dateString: string | Date): string => {
  if (!dateString) return "";
  const date = new Date(dateString);

  if (isToday(date)) {
    // Jeśli dzisiaj: 14:02
    return format(date, "HH:mm");
  } else {
    // Jeśli kiedy indziej: 17.12.2025 - 14:02
    return format(date, "dd.MM.yyyy - HH:mm", { locale: pl });
  }
};

// format date into "1 Jan 2025, 16:45" format
function formatDateTime(date: Date) {
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formatted;
}

export { formatDateTime };

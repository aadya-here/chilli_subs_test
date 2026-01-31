export type SubmissionDeadline = {
  subDate: string;
  subTime: string;
  subTimezone: string;
};

export function normaliseDate(text: string): SubmissionDeadline {
  // Extract date: "February 1, 2026"
  const dateMatch = text.match(/(\w+)\s+(\d+),\s+(\d{4})/);
  
  // Extract time: "5:00 AM"
  const timeMatch = text.match(/(\d{1,2}):(\d{2})\s+(AM|PM)/i);
  
  // Extract timezone: "(UTC)"
  const tzMatch = text.match(/\((\w+)\)/);

  let subDate = "";
  if (dateMatch) {
    const date = new Date(`${dateMatch[1]} ${dateMatch[2]}, ${dateMatch[3]}`);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    subDate = `${year}-${month}-${day}`;
  }

  return {
    subDate,
    subTime: timeMatch 
      ? `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3]}`
      : "",
    subTimezone: tzMatch 
      ? tzMatch[1]
      : "",
  };
}
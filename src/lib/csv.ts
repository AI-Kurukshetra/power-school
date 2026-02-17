export function toCsv(headers: string[], rows: (string | number | null)[][]) {
  const escapeValue = (value: string | number | null) => {
    const stringValue = value === null ? "" : String(value);
    const needsQuotes = /[",\n]/.test(stringValue);
    const escaped = stringValue.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const lines = [
    headers.map(escapeValue).join(","),
    ...rows.map((row) => row.map(escapeValue).join(",")),
  ];

  return lines.join("\n");
}

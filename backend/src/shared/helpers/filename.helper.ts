export function safeFilename(value: string) {
  return value.replace(/[^\w.-]+/g, '_');
}

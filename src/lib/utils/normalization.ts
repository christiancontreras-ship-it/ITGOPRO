export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, '')
}

export function normalizeTaxId(value: string): string {
  return value.toUpperCase().replace(/[^0-9K]/g, '')
}

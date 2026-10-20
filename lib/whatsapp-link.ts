// wa.me exige el número en formato internacional: solo dígitos, con código de país.
// Con "+" se respeta tal cual; 9 dígitos sin prefijo se asumen españoles (+34).
// Cualquier otro formato es ambiguo y no se arma link para no abrir un chat equivocado.
export function buildWhatsAppUrl(phone: string | null): string | null {
  if (!phone) return null

  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')
  let international: string | null = null

  if (trimmed.startsWith('+') && digits.length >= 8) {
    international = digits
  } else if (digits.length === 9) {
    international = `34${digits}`
  }

  if (!international) return null
  return `https://wa.me/${international}`
}

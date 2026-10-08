export function bytesToBase64(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError("Data harus berupa Uint8Array.");
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 32768) chunks.push(String.fromCharCode(...bytes.subarray(i, i + 32768)));
  return btoa(chunks.join(""));
}

export function base64ToBytes(value) {
  const clean = value.replace(/\s/g, "");
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(clean)) {
    throw new Error("Base64 tidak valid. Gunakan Base64 standar beserta padding = jika diperlukan.");
  }
  return Uint8Array.from(atob(clean), ch => ch.charCodeAt(0));
}

export function toBase64(textString) { return bytesToBase64(new TextEncoder().encode(textString)); }

export function formatScreenOutput(text, mode) {
  if (mode === "BASE64") return toBase64(text);
  if (mode === "UPPERCASE_NO_SPACE") return text.replace(/\s/g, "").toUpperCase();
  if (mode === "LOWERCASE_NO_SPACE") return text.replace(/\s/g, "").toLowerCase();
  throw new Error("Mode tampilan tidak dikenal.");
}

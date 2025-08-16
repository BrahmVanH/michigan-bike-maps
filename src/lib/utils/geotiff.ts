// Convert Uint8Array to base64 data URL
export function uint8ArrayToDataUrl(uint8Array: Uint8Array, mimeType = 'image/jpeg') {
  const binary = Array.from(uint8Array).map(b => String.fromCharCode(b)).join('');
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}
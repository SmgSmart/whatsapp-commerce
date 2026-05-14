// Polyfill for crypto.randomUUID in non-secure contexts (HTTP on LAN IP)
const polyfill = function() {
  return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
};

if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
  Object.defineProperty(window.crypto, 'randomUUID', {
    value: polyfill,
    configurable: true,
    enumerable: false,
    writable: true
  });
}

if (typeof globalThis !== 'undefined' && globalThis.crypto && !globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: polyfill,
    configurable: true,
    enumerable: false,
    writable: true
  });
}

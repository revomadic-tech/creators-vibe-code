/** Admin/create API envelopes vary: `{ data }`, `{ data: { data } }`, or a bare array. */
export function unwrapEnvelope(resp) {
  const top = resp?.data ?? resp;
  if (Array.isArray(top)) return top;
  const inner = top?.data;
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(inner?.data)) return inner.data;
  if (inner && typeof inner === "object") return inner;
  return top && typeof top === "object" ? top : null;
}

export function unwrapEnvelopeList(resp) {
  const value = unwrapEnvelope(resp);
  return Array.isArray(value) ? value : [];
}

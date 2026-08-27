function isUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function firstSentence(text) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const cut = raw.match(/^(.+?[.!?])(?:\s|$)/);
  return (cut ? cut[1] : raw).slice(0, 180);
}

function uniqueLines(lines, max) {
  const seen = new Set();
  const out = [];
  for (const line of lines) {
    const clean = String(line || "").replace(/\s+/g, " ").trim();
    if (!clean) continue;
    const key = clean.toLowerCase().replace(/['’‘`]/g, "'");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length >= max) break;
  }
  return out;
}

function splitAdCopy(raw) {
  if (!raw) return { hook: "", body: "", headline: "", cta: "", sourceUrl: null };
  const trimmed = String(raw).trim();
  if (isUrl(trimmed)) {
    return { hook: "", body: "", headline: "", cta: "", sourceUrl: trimmed };
  }

  let text = trimmed;
  let headline = "";
  let cta = "";

  const headlineMatch = text.match(/\bHeadline:\s*(.+)/i);
  if (headlineMatch) {
    headline = headlineMatch[1].replace(/\s+/g, " ").trim();
    text = text.replace(/\bHeadline:\s*.+/i, "").trim();
  }
  const ctaMatch = text.match(/\b(?:CTA|Offer):\s*(.+)/i);
  if (ctaMatch) {
    cta = ctaMatch[1].replace(/\s+/g, " ").trim();
    text = text.replace(/\b(?:CTA|Offer):\s*.+/i, "").trim();
  }

  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paras.length >= 2) {
    return {
      hook: firstSentence(paras[0]),
      body: paras.slice(1).join("\n\n"),
      headline,
      cta,
      sourceUrl: null,
    };
  }

  const sentences = text.match(/[^.!?]+[.!?](?:\s|$)/g);
  if (sentences && sentences.length >= 2) {
    return {
      hook: sentences[0].trim(),
      body: sentences.slice(1).join(" ").replace(/\s+/g, " ").trim(),
      headline,
      cta,
      sourceUrl: null,
    };
  }

  return { hook: firstSentence(text), body: text, headline, cta, sourceUrl: null };
}

function defaultCta(product) {
  if (!product) return "30 days risk-free.";
  return `${product} · 30 days risk-free.`;
}

/** Structured ad-copy doc for a task formed from an admin brief. */
export function resolveAdCopyDoc(item, adminBrief) {
  const parsed = splitAdCopy(item?.adCopy);
  const creative = adminBrief?.creativeBrief || {};
  const hooks = uniqueLines(
    [parsed.hook, ...(creative.hooks || [])],
    5,
  );
  const bodies = uniqueLines(
    [parsed.body, creative.scriptBody].filter((line) => line && line !== parsed.hook),
    3,
  );

  return {
    title: item?.product
      ? `${item.product} — ${item.name || "Ad copy"}`
      : item?.name || "Ad copy",
    product: item?.product || "",
    taskName: item?.name || "",
    angle: item?.angle || "",
    painPoint: item?.painPoint || "",
    style: item?.editingStyle || "",
    platform: item?.platform || "",
    parentBrief: adminBrief?.title || "",
    sourceUrl: parsed.sourceUrl,
    hooks,
    bodies,
    headline: parsed.headline || "",
    cta: parsed.cta || defaultCta(item?.product),
    tips: creative.scriptTips || "",
  };
}

export function formatAdCopyPlain(doc) {
  if (!doc) return "";
  const lines = [doc.title, ""];
  if (doc.hooks.length) {
    lines.push("HOOK VARIATIONS");
    doc.hooks.forEach((hook, i) => lines.push(`${i + 1}. ${hook}`));
    lines.push("");
  }
  if (doc.bodies.length) {
    lines.push("BODY VARIATIONS");
    doc.bodies.forEach((body, i) => {
      lines.push(`Body ${i + 1}`);
      lines.push(body);
      lines.push("");
    });
  }
  if (doc.headline) {
    lines.push("HEADLINE");
    lines.push(doc.headline);
    lines.push("");
  }
  if (doc.cta) {
    lines.push("CTA");
    lines.push(doc.cta);
  }
  return lines.join("\n").trim();
}

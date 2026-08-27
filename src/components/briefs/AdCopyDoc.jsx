import { useState } from "react";
import { Copy } from "lucide-react";
import { formatAdCopyPlain } from "../../lib/resolveAdCopyDoc";

function DocHeading({ children }) {
  return (
    <h3 className="mt-8 mb-3 border-b border-stone-200 pb-1.5 font-serif text-[13px] font-semibold tracking-wide text-stone-800 first:mt-0">
      {children}
    </h3>
  );
}

export default function AdCopyDoc({ doc, page = false }) {
  const [copied, setCopied] = useState(false);
  if (!doc) return null;

  const copyAll = async () => {
    const text = formatAdCopyPlain(doc);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  const meta = [doc.angle, doc.painPoint, doc.style, doc.platform].filter(Boolean);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FBF9F4] shadow-sm shadow-stone-900/[0.04] ${
        page ? "min-h-[520px]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/70 bg-white/70 px-5 py-2.5">
        <p className="truncate font-serif text-[12px] text-stone-500">
          Ad copy{doc.parentBrief ? ` · formed from ${doc.parentBrief}` : ""}
        </p>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:border-stone-300 hover:bg-stone-50"
        >
          <Copy size={11} />
          {copied ? "Copied" : "Copy doc"}
        </button>
      </div>

      <article
        className={`mx-auto font-serif text-stone-800 ${
          page ? "max-w-[640px] px-10 py-10" : "max-w-[560px] px-6 py-7"
        }`}
      >
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-stone-400">
          Ad copy brief
        </p>
        <h2 className={`mt-2 font-medium tracking-tight text-stone-900 ${page ? "text-[28px]" : "text-[22px]"}`}>
          {doc.title}
        </h2>
        {meta.length > 0 && (
          <p className="mt-2 text-[13px] leading-relaxed text-stone-500">
            {meta.join("  ·  ")}
          </p>
        )}

        {doc.sourceUrl ? (
          <p className="mt-3 text-[13px] leading-relaxed text-stone-500">
            Source copy lives in the linked doc. Variations below are pulled from this task and its parent brief.
          </p>
        ) : null}

        <DocHeading>Hook variations ({doc.hooks.length || 0} of 5)</DocHeading>
        {doc.hooks.length > 0 ? (
          <ol className="space-y-3">
            {doc.hooks.map((hook, i) => (
              <li key={hook} className="flex gap-3 text-[15px] leading-[1.65]">
                <span className="w-5 shrink-0 pt-0.5 font-sans text-[11px] font-semibold tabular-nums text-stone-400">
                  {i + 1}.
                </span>
                <span>{hook}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[14px] italic text-stone-400">No hook variations yet.</p>
        )}

        <DocHeading>Body variations</DocHeading>
        {doc.bodies.length > 0 ? (
          <div className="space-y-6">
            {doc.bodies.map((body, i) => (
              <div key={`${i}-${body.slice(0, 24)}`}>
                <p className="mb-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
                  Body {i + 1}
                </p>
                <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-stone-800">
                  {body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] italic text-stone-400">No body variations yet.</p>
        )}

        {doc.headline ? (
          <>
            <DocHeading>Headline</DocHeading>
            <p className="text-[16px] leading-relaxed text-stone-900">{doc.headline}</p>
          </>
        ) : null}

        {doc.cta ? (
          <>
            <DocHeading>CTA</DocHeading>
            <p className="text-[15px] leading-relaxed text-stone-800">{doc.cta}</p>
          </>
        ) : null}

        {doc.tips ? (
          <>
            <DocHeading>Read notes</DocHeading>
            <p className="text-[14px] leading-[1.65] text-stone-600">{doc.tips}</p>
          </>
        ) : null}
      </article>
    </div>
  );
}

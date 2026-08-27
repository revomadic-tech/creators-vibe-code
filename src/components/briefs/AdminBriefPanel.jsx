import {
  CheckCircle2,
  Clapperboard,
  FileText,
  Image as ImageIcon,
  Link2,
  Sparkles,
} from "lucide-react";
import { formatDeliverable } from "../../lib/resolveAdminBrief";

function SectionLabel({ children }) {
  return (
    <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-stone-400">
      {children}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03] ${className}`}>
      {children}
    </section>
  );
}

function CardHead({ icon: Icon, children, action }) {
  return (
    <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-4 py-2.5">
      {Icon ? <Icon size={13} className="text-stone-500" /> : null}
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
        {children}
      </span>
      {action}
    </div>
  );
}

function Prose({ value, empty = "—" }) {
  if (!value) return <p className="text-[12.5px] italic text-stone-400">{empty}</p>;
  return (
    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700">{value}</p>
  );
}

function ChipList({ items = [], empty }) {
  if (!items.length) {
    return empty ? <p className="text-[12px] italic text-stone-400">{empty}</p> : null;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((entry) => (
        <span
          key={entry}
          className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-700"
        >
          {entry}
        </span>
      ))}
    </div>
  );
}

function isVideoUrl(url) {
  return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url);
}

function isHttp(url) {
  return /^https?:\/\//i.test(String(url || "").trim());
}

export default function AdminBriefPanel({ brief, page = false, idPrefix = "brief" }) {
  const creative = brief.creativeBrief || {};

  return (
    <div className="space-y-4">
      <Card>
        <CardHead icon={Sparkles}>Campaign brief</CardHead>
        <div className="space-y-3 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
              {brief.campaign || "Ad Production"}
            </p>
            <h3 className={`mt-1 font-semibold tracking-tight text-stone-900 ${page ? "text-[18px]" : "text-[15px]"}`}>
              {brief.title}
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone-600">
              Parent campaign guidelines. Keep following these while you carry out this cut — they do not change per task.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className={`grid grid-cols-2 ${page ? "sm:grid-cols-4" : ""} gap-px bg-stone-100/80`}>
          {[
            ["Campaign", brief.campaign],
            ["Category", (creative.category || brief.category || "ugc").toUpperCase()],
            ["Stakeholder", brief.stakeholder],
            ["Reviewer", brief.reviewer],
            ["Audience", [creative.gender, creative.ageRange].filter(Boolean).join(" · ")],
            ["Start", brief.startDate],
            ["Due", brief.dueDate],
            ["Art director", brief.artDirector ? "Notes below" : "—"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 bg-white px-3 py-2">
              <div className="mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-stone-400">
                {label}
              </div>
              <p className="truncate text-[12px] font-medium text-stone-700" title={value || ""}>
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {brief.products?.length > 0 && (
        <Card>
          <div className="px-3.5 py-3">
            <SectionLabel>Products in this campaign</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {brief.products.map((product) => (
                <span
                  key={product.id || product.title}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 py-0.5 pl-1 pr-2.5 text-[12px] font-medium text-stone-700"
                >
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt="" className="h-5 w-5 rounded-full object-cover" />
                  ) : null}
                  {product.title}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {(creative.dos?.length || creative.donts?.length) ? (
        <div>
          <p className="mb-2 px-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
            Guidelines to keep following
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card>
              <div className="rounded-2xl px-3.5 py-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-600">Do&apos;s</p>
                <ul className="space-y-1">
                  {(creative.dos || []).map((line) => (
                    <li key={line} className="text-[12.5px] leading-snug text-stone-700">
                      · {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
            <Card>
              <div className="rounded-2xl px-3.5 py-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-rose-600">Don&apos;ts</p>
                <ul className="space-y-1">
                  {(creative.donts || []).map((line) => (
                    <li key={line} className="text-[12.5px] leading-snug text-stone-700">
                      · {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      <Card>
        <div className="space-y-3 px-3.5 py-3">
          <div>
            <SectionLabel>Distribution</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {(brief.platforms || []).map((p) => (
                <span
                  key={p}
                  className="inline-flex rounded-full border border-stone-300 bg-stone-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-white"
                >
                  {p}
                </span>
              ))}
              {(brief.aspectRatios || []).map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-stone-600"
                >
                  {r}
                </span>
              ))}
              {(creative.toneOfVoice || []).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-medium text-stone-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Campaign deliverables</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {(brief.deliverables || []).map((d, i) => (
                <span
                  key={`${d.type}-${i}`}
                  className="inline-flex items-center gap-1 rounded-md border border-stone-100 bg-stone-50 px-2 py-0.5 text-[11px] text-stone-600"
                >
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  {formatDeliverable(d)}
                  {d.platform ? <span className="text-stone-400">· {d.platform}</span> : null}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead icon={FileText}>Direction</CardHead>
        <div className={`grid gap-3 px-4 py-3 ${page ? "lg:grid-cols-3" : ""}`}>
          <div>
            <SectionLabel>Campaign brief</SectionLabel>
            <Prose value={creative.body} empty="No campaign brief body yet." />
          </div>
          <div>
            <SectionLabel>Visual direction</SectionLabel>
            <Prose value={creative.visualDirection} empty="No visual direction yet." />
          </div>
          <div>
            <SectionLabel>Creative direction</SectionLabel>
            <Prose value={creative.creativeDirection} empty="No creative direction yet." />
          </div>
        </div>
        {brief.artDirector ? (
          <div className="border-t border-stone-100 px-4 py-3">
            <SectionLabel>Art direction</SectionLabel>
            <Prose value={brief.artDirector} />
          </div>
        ) : null}
      </Card>

      <Card>
        <CardHead icon={Clapperboard}>Production reference</CardHead>
        <div className="space-y-3 px-4 py-3">
          <div>
            <SectionLabel>Camera angles</SectionLabel>
            <ChipList items={creative.cameraAngles} empty="None listed." />
          </div>
          <div>
            <SectionLabel>Settings</SectionLabel>
            <ChipList items={creative.settings} empty="None listed." />
          </div>
          <div>
            <SectionLabel>Demo moments</SectionLabel>
            <Prose value={creative.demoMoments} empty="None listed." />
          </div>
          <div>
            <SectionLabel>Requested B-roll</SectionLabel>
            <ChipList items={creative.requestedBRoll} empty="None requested." />
          </div>
        </div>
      </Card>

      {(creative.inspirationUrls?.length || brief.attachments?.length || creative.driveFiles || creative.canvaPresentation) ? (
        <Card>
          <CardHead icon={ImageIcon}>Brand & source assets</CardHead>
          <div className="space-y-3 px-4 py-3">
            {creative.inspirationUrls?.length ? (
              <div className="flex flex-wrap gap-2">
                {creative.inspirationUrls.map((url, i) => (
                  <a
                    key={`${url}-${i}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="relative h-20 w-14 overflow-hidden rounded-lg border border-stone-200 bg-stone-100"
                  >
                    {isVideoUrl(url) ? (
                      <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    )}
                  </a>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(brief.attachments || []).map((file) => (
                <a
                  key={file.url}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:bg-stone-100"
                >
                  <FileText size={10} />
                  <span className="max-w-[160px] truncate">{file.name}</span>
                </a>
              ))}
              {isHttp(creative.driveFiles) && (
                <a
                  href={creative.driveFiles}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:bg-stone-50"
                >
                  <Link2 size={10} /> Drive
                </a>
              )}
              {isHttp(creative.canvaPresentation) && (
                <a
                  href={creative.canvaPresentation}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:bg-stone-50"
                >
                  <Link2 size={10} /> Canva
                </a>
              )}
            </div>
            <ChipList items={creative.tags} />
          </div>
        </Card>
      ) : null}

      <p className="px-1 text-[11px] text-stone-400" id={`${idPrefix}-admin-sync`}>
        This is the parent campaign brief. Task-specific copy and fields live on Task Details — submissions are reviewed as Content cards.
      </p>
    </div>
  );
}

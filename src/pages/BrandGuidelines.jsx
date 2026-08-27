import { useState } from "react";
import {
  Palette,
  Type,
  Hexagon,
  Copy,
  Check,
  Download,
  Package,
  FileDown,
  FileText,
  Image,
  Film,
} from "lucide-react";
import { TabBar } from "../components/ui/Tabs";
import TeamShowcase from "../components/shared/TeamShowcase";
import { brandGuidelines, teamMembers } from "../data/mockData";

const sections = [
  { id: "typography", label: "Typography", icon: Type },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "logos", label: "Logos", icon: Hexagon },
  { id: "products", label: "Product Styling", icon: Package },
  { id: "resources", label: "Resources", icon: FileDown },
];

const resourceIcons = {
  archive: FileDown,
  logos: Image,
  colors: Palette,
  typography: FileText,
  guidelines: FileText,
  motion: Film,
};

export default function BrandGuidelines() {
  const [activeSection, setActiveSection] = useState("typography");
  const [copiedColor, setCopiedColor] = useState(null);

  const copyColor = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto" data-shell-page-scroll>
        <div className="px-6 pb-6 pt-24 fade-in">
          {/* Header */}
          <div className="mb-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                  BRAND
                </h2>
                <p className="text-xs text-white/30 mt-2">
                  REVO brand guidelines, assets, and reference materials
                </p>
              </div>
              <TabBar
                tabs={sections}
                active={activeSection}
                onChange={setActiveSection}
              />
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] text-white/70 text-[13px] font-medium rounded-xl transition-all duration-200">
                  <Download size={15} /> Download Brand Kit
                </button>
              </div>
            </div>
          </div>

          {/* Typography */}
          {activeSection === "typography" && (
            <div className="space-y-8 fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  {brandGuidelines.typography.primary.name}
                </h3>
                <p className="text-xs text-white/30 mb-6">
                  {brandGuidelines.typography.primary.usage}
                </p>

                <div className="space-y-3 mb-8">
                  {brandGuidelines.typography.primary.samples.map(
                    (sample, i) => (
                      <div
                        key={i}
                        className="glass-card rounded-2xl p-6 flex items-end justify-between gap-6"
                      >
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p
                            className="text-white leading-tight"
                            style={{
                              fontWeight: sample.weight,
                              fontSize: sample.size,
                              letterSpacing:
                                sample.weight >= 700 ? "-0.03em" : "0",
                            }}
                          >
                            {sample.text}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-white/50 font-medium">
                            {sample.label}
                          </p>
                          <p className="text-[10px] text-white/20 font-mono mt-0.5">
                            {sample.size} / wt {sample.weight}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <h4 className="text-[13px] font-bold text-white mb-3">
                  Weight Reference
                </h4>
                <div className="grid grid-cols-7 gap-2.5 mb-8">
                  {brandGuidelines.typography.primary.weights.map((w) => {
                    const weight = parseInt(w);
                    return (
                      <div
                        key={w}
                        className="glass-card rounded-xl p-4 text-center"
                      >
                        <p
                          className="text-3xl text-white mb-2"
                          style={{ fontWeight: weight }}
                        >
                          Aa
                        </p>
                        <p className="text-[10px] text-white/25 font-mono">
                          {w}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <h4 className="text-[13px] font-bold text-white mb-3">
                  {brandGuidelines.typography.mono.name}
                </h4>
                <p className="text-xs text-white/30 mb-3">
                  {brandGuidelines.typography.mono.usage}
                </p>
                <div className="glass-card rounded-2xl p-6">
                  <p className="font-mono text-lg text-white mb-1.5">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </p>
                  <p className="font-mono text-lg text-white/50 mb-1.5">
                    abcdefghijklmnopqrstuvwxyz
                  </p>
                  <p className="font-mono text-lg text-white/30">
                    0123456789 !@#$%^&*()
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Colors */}
          {activeSection === "colors" && (
            <div className="space-y-8 fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Primary Palette
                </h3>
                <p className="text-xs text-white/30 mb-4">
                  Core brand colors used across all REVO materials
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {brandGuidelines.colors.primary.map((color) => (
                    <ColorCard
                      key={color.hex}
                      color={color}
                      large
                      onCopy={copyColor}
                      copied={copiedColor === color.hex}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Secondary Palette
                </h3>
                <p className="text-xs text-white/30 mb-4">
                  Supporting colors for UI, accents, and functional states
                </p>
                <div className="grid grid-cols-6 gap-2.5">
                  {brandGuidelines.colors.secondary.map((color) => (
                    <ColorCard
                      key={color.hex}
                      color={color}
                      onCopy={copyColor}
                      copied={copiedColor === color.hex}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-4">
                  Usage Examples
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl overflow-hidden bg-surface-900 border border-white/[0.06] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent-red flex items-center justify-center">
                        <span className="text-white font-black text-lg">
                          R
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-white">
                          REVO CREATE
                        </p>
                        <p className="text-[10px] text-white/25 uppercase tracking-widest">
                          Creative Command Center
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-white/35 leading-relaxed">
                      Primary red accent on dark surface. Used for brand marks,
                      primary CTAs, and highlight indicators.
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden bg-offwhite p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center">
                        <span className="text-white font-black text-lg">
                          R
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-surface-900">
                          REVO CREATE
                        </p>
                        <p className="text-[10px] text-surface-900/35 uppercase tracking-widest">
                          Creative Command Center
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-surface-900/40 leading-relaxed">
                      Inverted light treatment. Used for print, packaging, and
                      light-mode contexts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logos */}
          {activeSection === "logos" && (
            <div className="space-y-6 fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Logo Suite
                </h3>
                <p className="text-xs text-white/30 mb-6">
                  Official REVO brand marks and their approved usage contexts
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {brandGuidelines.logos.map((logo, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl border border-white/[0.06] overflow-hidden ${
                        logo.bg === "dark" ? "bg-surface-800" : "bg-offwhite"
                      }`}
                    >
                      <div className="aspect-[2/1] flex items-center justify-center p-8">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              logo.bg === "dark"
                                ? "bg-accent-red"
                                : "bg-surface-900"
                            }`}
                          >
                            <span className="text-white font-black text-xl">
                              R
                            </span>
                          </div>
                          {logo.variant !== "Symbol Only" && (
                            <span
                              className={`text-2xl font-black tracking-tight ${
                                logo.bg === "dark"
                                  ? "text-white"
                                  : "text-surface-900"
                              }`}
                            >
                              REVO
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`px-5 py-4 border-t ${
                          logo.bg === "dark"
                            ? "border-white/[0.06]"
                            : "border-surface-900/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={`text-[13px] font-semibold ${
                                logo.bg === "dark"
                                  ? "text-white"
                                  : "text-surface-900"
                              }`}
                            >
                              {logo.name}
                            </p>
                            <p
                              className={`text-[11px] mt-0.5 ${
                                logo.bg === "dark"
                                  ? "text-white/30"
                                  : "text-surface-900/35"
                              }`}
                            >
                              {logo.variant} · {logo.usage}
                            </p>
                          </div>
                          <button
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              logo.bg === "dark"
                                ? "text-white/25 hover:text-white hover:bg-white/[0.06]"
                                : "text-surface-900/25 hover:text-surface-900 hover:bg-surface-900/[0.06]"
                            }`}
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-4">
                  Minimum Clear Space
                </h3>
                <div className="glass-card rounded-2xl p-8 flex items-center justify-center">
                  <div className="relative">
                    <div className="border-2 border-dashed border-accent-red/25 rounded-xl p-12">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-red flex items-center justify-center">
                          <span className="text-white font-black">R</span>
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">
                          REVO
                        </span>
                      </div>
                    </div>
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 bg-surface-800 text-[10px] text-accent-red/50 font-mono">
                      2x height minimum
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Styling */}
          {activeSection === "products" && (
            <div className="space-y-6 fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Product Line Styling
                </h3>
                <p className="text-xs text-white/30 mb-6">
                  Visual direction and mood references for each REVO product
                  line
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {brandGuidelines.productStyles.map((ps) => (
                    <div
                      key={ps.name}
                      className="group rounded-2xl overflow-hidden glass-card card-hover"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={ps.thumbnail}
                          alt={ps.name}
                          className="w-full h-full object-cover img-cinematic transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 gradient-overlay" />
                        <div className="absolute bottom-3 left-4">
                          <p className="text-lg font-black text-white">
                            {ps.name}
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-white/40">{ps.mood}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/20 mr-1">
                            Palette
                          </span>
                          {ps.palette.map((hex) => (
                            <div
                              key={hex}
                              className="w-6 h-6 rounded-lg border border-white/[0.08] cursor-pointer hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: hex }}
                              onClick={() => copyColor(hex)}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-4">
                  Example Layouts
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden glass-card card-hover"
                    >
                      <img
                        src={`https://picsum.photos/seed/layout${i}/600/400`}
                        alt=""
                        className="w-full aspect-[3/2] object-cover img-cinematic"
                      />
                      <div className="p-3">
                        <p className="text-xs font-semibold text-white">
                          Layout Example {i}
                        </p>
                        <p className="text-[10px] text-white/25 mt-0.5">
                          Campaign application reference
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resources */}
          {activeSection === "resources" && (
            <div className="space-y-6 fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Downloadable Resources
                </h3>
                <p className="text-xs text-white/30 mb-6">
                  Official brand assets and template files
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {brandGuidelines.resources.map((res) => {
                    const ResIcon = resourceIcons[res.type] || FileDown;
                    return (
                      <div
                        key={res.name}
                        className="glass-card rounded-2xl p-5 flex items-center gap-4 card-hover cursor-pointer group"
                      >
                        <div className="w-11 h-11 rounded-xl bg-accent-red/10 flex items-center justify-center flex-shrink-0">
                          <ResIcon size={19} className="text-accent-red" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate">
                            {res.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/25">
                            <span>{res.size}</span>
                            <span className="text-white/10">·</span>
                            <span>Updated {res.updated}</span>
                          </div>
                        </div>
                        <button className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.04] text-white/25 group-hover:bg-accent-red group-hover:border-accent-red group-hover:text-white transition-all duration-200">
                          <Download size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Brand Guardians */}
          <div className="mt-8 mb-4">
            <TeamShowcase
              title="Brand"
              titleAccent="Guardians"
              subtitle="The team maintaining and evolving REVO's visual identity standards."
              members={teamMembers}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ColorCard({ color, large, onCopy, copied }) {
  const isLight = ["#f0efe9", "#ffffff"].includes(color.hex.toLowerCase());
  return (
    <div
      onClick={() => onCopy(color.hex)}
      className="group rounded-2xl overflow-hidden border border-white/[0.06] card-hover cursor-pointer"
    >
      <div
        className={`${large ? "h-28" : "h-20"} relative`}
        style={{ backgroundColor: color.hex }}
      >
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {copied ? (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                isLight
                  ? "bg-black/20 text-black/60"
                  : "bg-white/20 text-white"
              }`}
            >
              <Check size={10} /> Copied
            </span>
          ) : (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] ${
                isLight
                  ? "bg-black/10 text-black/40"
                  : "bg-white/10 text-white/60"
              }`}
            >
              <Copy size={10} /> Copy
            </span>
          )}
        </div>
      </div>
      <div className="p-3 bg-black/40 backdrop-blur-xl">
        <p className="text-xs font-semibold text-white">{color.name}</p>
        <p className="text-[10px] text-white/25 font-mono mt-0.5">
          {color.hex}
        </p>
        {large && (
          <p className="text-[10px] text-white/15 mt-1">{color.usage}</p>
        )}
      </div>
    </div>
  );
}

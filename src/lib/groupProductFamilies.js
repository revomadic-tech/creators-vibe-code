const VARIANT_PREFIXES = [
  "beige",
  "pink",
  "black",
  "white",
  "blue",
  "red",
  "green",
  "purple",
  "gold",
  "silver",
  "rose",
  "nude",
  "ivory",
  "cream",
  "gray",
  "grey",
  "brown",
  "orange",
  "yellow",
  "navy",
  "clear",
  "chrome",
  "mini",
  "pro",
  "plus",
  "new",
  "classic",
];

const PREFIX_RE = new RegExp(`^(?:${VARIANT_PREFIXES.join("|")})\\s+`, "i");
const SUFFIX_RE = new RegExp(`\\s+(?:${VARIANT_PREFIXES.join("|")})$`, "i");
const PACK_RE = /\s+\d+[\s-]?packs?$/i;
const TRAILING_PACK_RE = /\s+packs?$/i;
const BRAND_RE = /^revo(?:madic)?\s+/i;
const MARKETING_SUFFIX_RE = /\s+[–—-]\s+.+$/;
const TRAILING_GENERIC_RE =
  /\s+(?:massager|massagers|device|devices|machine|machines|kit|kits)$/i;

const TOKEN_ALIASES = {
  cupping: "cupper",
  cuppers: "cupper",
};

function titleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function productFamilyKey(name) {
  let s = String(name || "").trim();
  s = s.replace(MARKETING_SUFFIX_RE, "");
  s = s.replace(BRAND_RE, "");
  s = s.replace(/^the\s+/i, "");
  s = s.replace(PACK_RE, "");
  s = s.replace(TRAILING_PACK_RE, "");
  s = s.replace(TRAILING_GENERIC_RE, "");
  s = s.replace(/\s+\d+$/g, "");
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(PREFIX_RE, "");
    s = s.replace(SUFFIX_RE, "");
    s = s.replace(BRAND_RE, "");
    s = s.replace(TRAILING_GENERIC_RE, "");
  }
  s = s
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => TOKEN_ALIASES[tok.toLowerCase()] || tok)
    .join(" ");
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function tokenSuffix(shorter, longer) {
  const a = shorter.split(" ").filter(Boolean);
  const b = longer.split(" ").filter(Boolean);
  if (!a.length || a.length >= b.length) return false;
  return a.every((tok, i) => tok === b[b.length - a.length + i]);
}

/**
 * Collapse SKU/color/pack variants onto a parent product.
 * e.g. Smart Cupper 2-Pack + 4-Pack → Smart Cupper
 *      Beige/Pink Face Genie → Face Genie
 */
export function groupProductFamilies(products) {
  const list = (products || []).filter(Boolean);
  if (list.length <= 1) return list;

  const buckets = new Map();
  for (const product of list) {
    const key = productFamilyKey(product.name) || String(product.id);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(product);
  }

  const keys = [...buckets.keys()].sort((a, b) => b.split(" ").length - a.split(" ").length);
  for (const longer of keys) {
    for (const shorter of keys) {
      if (shorter === longer) continue;
      if (!buckets.has(shorter) || !buckets.has(longer)) continue;
      if (tokenSuffix(shorter, longer)) {
        buckets.set(longer, [...buckets.get(longer), ...buckets.get(shorter)]);
        buckets.delete(shorter);
      }
    }
  }

  const families = [...buckets.entries()].map(([, members]) => {
    const sorted = [...members].sort((a, b) => {
      const len = (a.name || "").length - (b.name || "").length;
      if (len !== 0) return len;
      return (b.assetCount || 0) - (a.assetCount || 0);
    });
    const parent = sorted[0];
    const variants = sorted.slice(1);
    const assetCount = members.reduce((sum, p) => sum + (Number(p.assetCount) || 0), 0);
    const variantIds = [...new Set(members.map((p) => String(p.id)))];
    const thumbnail =
      parent.thumbnail || variants.find((p) => p.thumbnail)?.thumbnail || "";
    return {
      ...parent,
      name: parent.name || titleCase(productFamilyKey(parent.name)),
      thumbnail,
      assetCount,
      variantIds,
      variants,
      tagline:
        variants.length > 0
          ? `${variants.length + 1} variants`
          : parent.tagline,
    };
  });

  return families.sort((a, b) => (b.assetCount || 0) - (a.assetCount || 0));
}

export function familyIdsForProductFilter(products, productFilter) {
  if (!productFilter) return [];
  const raw = String(productFilter)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const family = (products || []).find(
    (p) =>
      raw.includes(String(p.id)) ||
      raw.some((id) => (p.variantIds || [p.id]).map(String).includes(id))
  );
  if (family?.variantIds?.length) return family.variantIds.map(String);
  return raw;
}

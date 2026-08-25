import { useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen,
  Upload,
  Star,
  Package,
  FileText,
  Users,
  Layers,
  Sparkles,
} from "lucide-react";

export default function FolderTree({
  assets,
  products,
  partners,
  categories,
  assetTypes,
  briefs,
  typeIcons,
  selectedId,
  onSelect,
  collapsed,
  onToggleCollapsed,
}) {
  const tree = useMemo(
    () =>
      buildLibraryTree({
        assets,
        products,
        partners,
        categories,
        assetTypes,
        briefs,
        typeIcons,
      }),
    [assets, products, partners, categories, assetTypes, briefs, typeIcons]
  );
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState(() => new Set());

  const visibleTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;
    const match = (node) => {
      const self = node.label.toLowerCase().includes(q);
      const children = node.children?.map(match).filter(Boolean) || [];
      if (self || children.length) {
        return { ...node, children: self ? node.children || [] : children };
      }
      return null;
    };
    return tree.map(match).filter(Boolean);
  }, [tree, query]);

  const toggleExpand = (id, e) => {
    e?.stopPropagation();
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (collapsed) {
    return (
      <aside className="app-panel w-11 flex-shrink-0 flex flex-col items-center py-3 gap-2">
        <button
          onClick={onToggleCollapsed}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200"
          title="Expand library"
        >
          <PanelLeftOpen size={15} />
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20">
          <Folder size={15} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="app-panel w-[232px] flex-shrink-0 flex flex-col min-h-0">
      <div className="px-3 pt-3 pb-2.5 border-b border-white/[0.04] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-wider">
            Library
          </p>
          <button
            onClick={onToggleCollapsed}
            className="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all duration-200"
            title="Collapse library"
          >
            <PanelLeftClose size={13} />
          </button>
        </div>
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            placeholder="Search folders..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg py-1.5 pl-7 pr-7 text-[11px] text-white placeholder:text-white/20 outline-none focus:border-white/15 focus:bg-white/[0.06] transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll py-2 px-2">
        {visibleTree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            openIds={query ? new Set(collectIds(visibleTree)) : openIds}
            onToggle={toggleExpand}
            onSelect={onSelect}
          />
        ))}
        {visibleTree.length === 0 && (
          <p className="px-2 py-6 text-[11px] text-white/20 text-center">
            No folders match
          </p>
        )}
      </div>
    </aside>
  );
}

function collectIds(nodes) {
  const ids = [];
  const walk = (list) => {
    list.forEach((n) => {
      ids.push(n.id);
      if (n.children?.length) walk(n.children);
    });
  };
  walk(nodes);
  return ids;
}

function TreeNode({ node, depth, selectedId, openIds, onToggle, onSelect }) {
  const hasChildren = node.children?.length > 0;
  const isOpen = Boolean(hasChildren && openIds.has(node.id));
  const isSelected = selectedId === node.id;
  const Icon = node.icon || (isOpen ? FolderOpen : Folder);

  return (
    <div>
      <button
        onClick={() => (hasChildren ? onToggle(node.id) : onSelect(node))}
        className={`w-full flex items-center gap-1 rounded-lg py-[5px] pr-1.5 text-left transition-all duration-150 group/node ${
          isSelected
            ? "bg-white/[0.08] text-white"
            : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {hasChildren ? (
          <span className="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center text-white/25">
            {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </span>
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}
        <Icon
          size={13}
          strokeWidth={isSelected ? 2 : 1.6}
          className={`flex-shrink-0 ${
            isSelected ? "text-accent-red" : "text-white/30 group-hover/node:text-white/50"
          }`}
        />
        <span className="flex-1 truncate text-[11.5px] font-medium leading-none">
          {node.label}
        </span>
        {typeof node.count === "number" && (
          <span
            className={`flex-shrink-0 text-[9px] font-mono tabular-nums ${
              isSelected ? "text-white/40" : "text-white/15"
            }`}
          >
            {node.count}
          </span>
        )}
      </button>
      {isOpen &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            openIds={openIds}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

function buildLibraryTree({
  assets,
  products,
  partners,
  categories,
  assetTypes,
  briefs,
  typeIcons,
}) {
  const countEq = (key, value) => assets.filter((a) => a[key] === value).length;
  const leaf = (kind, value, label, extra = {}) => ({
    id: `${kind}:${value}`,
    kind,
    value,
    label,
    count: extra.count ?? countEq(extra.countKey || kindToAssetKey(kind), value),
    icon: extra.icon,
  });

  return [
    {
      id: "all",
      kind: "all",
      label: "All Assets",
      count: assets.length,
      icon: Inbox,
    },
    {
      id: "new",
      kind: "new",
      label: "Just Landed",
      count: assets.filter((a) => a.isNew).length,
      icon: Upload,
    },
    {
      id: "featured",
      kind: "featured",
      label: "Featured",
      count: assets.filter((a) => a.isFeatured).length,
      icon: Star,
    },
    {
      id: "products",
      kind: "group",
      label: "Products",
      count: products.length,
      icon: Package,
      children: products.map((p) => leaf("product", p, p)),
    },
    {
      id: "campaigns",
      kind: "group",
      label: "Campaigns",
      count: briefs.length,
      icon: FileText,
      children: briefs.map((b) =>
        leaf("campaign", b.title, b.title, {
          count: assets.filter((a) => a.briefTitle === b.title).length,
        })
      ),
    },
    {
      id: "partners",
      kind: "group",
      label: "Partners",
      count: partners.length,
      icon: Users,
      children: partners.map((p) => leaf("partner", p, p)),
    },
    {
      id: "categories",
      kind: "group",
      label: "Categories",
      count: categories.length,
      icon: Layers,
      children: categories.map((c) => leaf("category", c, c)),
    },
    {
      id: "types",
      kind: "group",
      label: "Types",
      count: assetTypes.length,
      icon: Sparkles,
      children: assetTypes.map((t) =>
        leaf("type", t, t, { icon: typeIcons?.[t] })
      ),
    },
  ];
}

function kindToAssetKey(kind) {
  if (kind === "product") return "product";
  if (kind === "partner") return "partner";
  if (kind === "category") return "category";
  if (kind === "type") return "type";
  return kind;
}

import {
  AD_ANGLE_OPTIONS,
  AD_EDITING_STYLE_OPTIONS,
  AD_PAIN_POINT_OPTIONS,
  AD_PERFORMANCE_OPTIONS,
  AD_PLATFORM_OPTIONS,
  AD_PRIORITY_OPTIONS,
  AD_PRODUCT_OPTIONS,
  AD_STATUS_OPTIONS,
  AD_ANGLE_COLORS,
  AD_EDITING_STYLE_COLORS,
  AD_PAIN_POINT_COLORS,
  AD_PERFORMANCE_COLORS,
  AD_PLATFORM_COLORS,
  AD_PRIORITY_COLORS,
  AD_PRODUCT_COLORS,
  AD_STATUS_COLORS,
} from "../../data/adProduction";
import {
  WD_PLATFORM_COLORS,
  WD_PLATFORM_OPTIONS,
  WD_STATUS_COLORS,
  WD_STATUS_OPTIONS,
  WD_TYPE_COLORS,
  WD_TYPE_OPTIONS,
} from "../../data/productionsWebDev";
import { teamMembers } from "../../data/mockData";

const PEOPLE_OPTIONS = teamMembers.map((m) => ({
  value: m.name,
  label: m.name,
}));

export const BOARD_COLUMN_EDIT = {
  status: {
    key: "status",
    options: [...AD_STATUS_OPTIONS, ...WD_STATUS_OPTIONS.filter((s) => !AD_STATUS_COLORS[s])],
    colors: { ...AD_STATUS_COLORS, ...WD_STATUS_COLORS },
  },
  product: { key: "product", options: AD_PRODUCT_OPTIONS, colors: AD_PRODUCT_COLORS },
  priority: { key: "priority", options: AD_PRIORITY_OPTIONS, colors: AD_PRIORITY_COLORS },
  editor: { key: "editors", people: true },
  owner: { key: "editors", people: true },
  angle: { key: "angle", options: AD_ANGLE_OPTIONS, colors: AD_ANGLE_COLORS },
  due: { key: "dueDate", date: true },
  style: { key: "editingStyle", options: AD_EDITING_STYLE_OPTIONS, colors: AD_EDITING_STYLE_COLORS },
  platform: {
    key: "platform",
    options: [...AD_PLATFORM_OPTIONS, ...WD_PLATFORM_OPTIONS.filter((s) => !AD_PLATFORM_COLORS[s])],
    colors: { ...AD_PLATFORM_COLORS, ...WD_PLATFORM_COLORS },
  },
  painPoint: { key: "painPoint", options: AD_PAIN_POINT_OPTIONS, colors: AD_PAIN_POINT_COLORS },
  strategist: { key: "creativeStrategists", people: true },
  sendDate: { key: "sendDate", date: true },
  performance: {
    key: "performance",
    options: AD_PERFORMANCE_OPTIONS,
    colors: AD_PERFORMANCE_COLORS,
  },
  type: { key: "type", options: WD_TYPE_OPTIONS, colors: WD_TYPE_COLORS },
};

function optionList(options, colors) {
  return (options || []).map((entry) => {
    if (entry && typeof entry === "object") {
      const value = entry.value ?? entry.id;
      return {
        value,
        label: entry.label ?? entry.title ?? value,
        color: entry.color || colors?.[value],
      };
    }
    return { value: entry, label: entry, color: colors?.[entry] };
  });
}

/** Native overlay select so the visible pill/cell stays, and the pick writes through. */
export default function BoardFieldMenu({
  value,
  options,
  colors,
  people = false,
  multiple = false,
  onChange,
  ariaLabel,
  triggerClassName = "relative z-[1] flex min-w-0 max-w-full items-center",
  children,
}) {
  const items = people ? PEOPLE_OPTIONS : optionList(options, colors);
  const current = multiple
    ? (Array.isArray(value) ? value[0] : "") || ""
    : value || "";

  const handleChange = (raw) => {
    if (people || multiple) {
      onChange(raw ? [raw] : []);
      return;
    }
    onChange(raw || null);
  };

  return (
    <label className={`${triggerClassName} cursor-pointer`} data-command-interactive>
      <span className="pointer-events-none min-w-0 flex-1">{children}</span>
      <select
        aria-label={ariaLabel}
        value={current}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          handleChange(e.target.value);
        }}
        className="absolute inset-0 z-[1] cursor-pointer opacity-0"
      >
        <option value="">Clear</option>
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EditableBoardCell({ columnId, item, onPatch, centered = false, children }) {
  const spec = BOARD_COLUMN_EDIT[columnId];
  if (!spec || !onPatch) return children;

  const align = centered ? "justify-center" : "";

  if (spec.date) {
    return (
      <label
        className={`relative flex h-full min-w-0 items-center ${align}`}
        data-command-interactive
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <input
          type="date"
          value={item[spec.key] || ""}
          aria-label={spec.key}
          onChange={(e) => onPatch(item.id, { [spec.key]: e.target.value || null })}
          className="absolute inset-0 z-[1] cursor-pointer opacity-0"
        />
      </label>
    );
  }

  return (
    <BoardFieldMenu
      value={spec.people ? item[spec.key] || [] : item[spec.key]}
      options={spec.options}
      colors={spec.colors}
      people={spec.people}
      multiple={spec.people}
      ariaLabel={`Edit ${columnId}`}
      triggerClassName={`relative z-[1] flex h-full w-full min-w-0 items-center ${align}`}
      onChange={(next) =>
        onPatch(item.id, spec.people ? { [spec.key]: next } : { [spec.key]: next || null })
      }
    >
      <span className={`flex min-h-8 min-w-0 w-full flex-1 items-center ${align}`}>{children}</span>
    </BoardFieldMenu>
  );
}

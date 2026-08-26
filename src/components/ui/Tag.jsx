import { X } from "lucide-react";

const statusColors = {
  "In Progress": "bg-accent-blue/12 text-accent-blue border-accent-blue/15",
  "In Review": "bg-accent-purple/12 text-accent-purple border-accent-purple/15",
  Approved: "bg-accent-teal/12 text-accent-teal border-accent-teal/15",
  Posted: "bg-accent-teal/12 text-accent-teal border-accent-teal/15",
  Complete: "bg-accent-teal/12 text-accent-teal border-accent-teal/15",
  "Pending Approval": "bg-accent-orange/12 text-accent-orange border-accent-orange/15",
  "Needs Review": "bg-accent-purple/12 text-accent-purple border-accent-purple/15",
  "Needs Creator Revisions": "bg-accent-orange/12 text-accent-orange border-accent-orange/15",
  "Ready For Editors": "bg-accent-blue/12 text-accent-blue border-accent-blue/15",
  "Needs Revision": "bg-accent-orange/12 text-accent-orange border-accent-orange/15",
  Delivered: "bg-accent-teal/12 text-accent-teal border-accent-teal/15",
  Draft: "bg-white/[0.06] text-white/45 border-white/[0.06]",
};

const priorityColors = {
  Critical: "bg-accent-red/12 text-accent-red border-accent-red/15",
  High: "bg-accent-orange/12 text-accent-orange border-accent-orange/15",
  Medium: "bg-accent-blue/12 text-accent-blue border-accent-blue/15",
  Low: "bg-white/[0.06] text-white/45 border-white/[0.06]",
};

export function StatusBadge({ status, small }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap border leading-none ${
        small
          ? "px-1.5 py-[3px] text-[9px]"
          : "px-2.5 py-[3px] text-[10px]"
      } ${statusColors[status] || statusColors.Draft}`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[10px] font-medium whitespace-nowrap border leading-none ${
        priorityColors[priority] || priorityColors.Low
      }`}
    >
      {priority}
    </span>
  );
}

export function Tag({ children, onRemove, variant = "default" }) {
  const styles = {
    default:
      "bg-white/[0.04] text-white/40 border-white/[0.05] hover:bg-white/[0.06] hover:text-white/55",
    active:
      "bg-accent-red/10 text-accent-red border-accent-red/15 hover:bg-accent-red/15",
    muted:
      "bg-white/[0.03] text-white/25 border-white/[0.04]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${styles[variant]}`}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:text-white transition-colors"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

export function DeliverableTag({ deliverable }) {
  const color =
    deliverable.status === "Approved"
      ? "bg-accent-teal/8 text-accent-teal border-accent-teal/12"
      : deliverable.status === "In Review"
        ? "bg-accent-purple/8 text-accent-purple border-accent-purple/12"
        : deliverable.status === "In Progress"
          ? "bg-accent-blue/8 text-accent-blue border-accent-blue/12"
          : "bg-white/[0.04] text-white/30 border-white/[0.05]";
  const label =
    deliverable.name.length > 22
      ? deliverable.name.slice(0, 22) + "…"
      : deliverable.name;
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[9px] font-medium border ${color}`}
    >
      {label}
    </span>
  );
}

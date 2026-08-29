import { useEffect, useMemo, useState } from "react";
import { staffTimeTracking, taskThreads } from "../../data/staffPanel";
import { briefs, tasks, teamMembers } from "../../data/mockData";

const LOOP_S = 96;

const SEATS = {
  1: { x: 8, y: 28, size: 210, depth: 2 },
  2: { x: 28, y: 8, size: 168, depth: 1 },
  3: { x: 46, y: 32, size: 228, depth: 3 },
  4: { x: 68, y: 6, size: 160, depth: 0 },
  5: { x: 74, y: 40, size: 196, depth: 2 },
  6: { x: 16, y: 56, size: 200, depth: 3 },
  7: { x: 54, y: 4, size: 148, depth: 0 },
  8: { x: 42, y: 58, size: 216, depth: 4 },
};

const REHEARSAL = [
  {
    at: 0,
    people: [
      { id: 1, status: "online" },
      { id: 2, status: "online" },
      { id: 4, status: "online" },
      { id: 6, status: "online" },
      { id: 7, status: "online" },
    ],
  },
  {
    at: 10,
    people: [
      { id: 1, status: "online" },
      { id: 2, status: "online" },
      { id: 3, status: "away" },
      { id: 4, status: "online" },
      { id: 6, status: "online" },
      { id: 7, status: "online" },
    ],
  },
  {
    at: 22,
    people: [
      { id: 1, status: "online" },
      { id: 2, status: "online" },
      { id: 3, status: "online" },
      { id: 4, status: "online" },
      { id: 6, status: "away" },
      { id: 7, status: "online" },
      { id: 8, status: "away" },
    ],
  },
  {
    at: 36,
    people: [
      { id: 1, status: "online" },
      { id: 2, status: "away" },
      { id: 3, status: "online" },
      { id: 6, status: "online" },
      { id: 7, status: "online" },
      { id: 8, status: "online" },
    ],
  },
  {
    at: 50,
    people: [
      { id: 1, status: "online" },
      { id: 3, status: "online" },
      { id: 5, status: "online" },
      { id: 6, status: "online" },
      { id: 7, status: "away" },
      { id: 8, status: "online" },
    ],
  },
  {
    at: 64,
    people: [
      { id: 1, status: "online" },
      { id: 2, status: "online" },
      { id: 4, status: "online" },
      { id: 5, status: "away" },
      { id: 6, status: "online" },
      { id: 8, status: "online" },
    ],
  },
  {
    at: 78,
    people: [
      { id: 1, status: "online" },
      { id: 2, status: "online" },
      { id: 4, status: "online" },
      { id: 6, status: "online" },
      { id: 7, status: "online" },
    ],
  },
  { at: 90, people: [{ id: 2, status: "online" }, { id: 6, status: "online" }] },
];

function snapshotAt(t) {
  let people = REHEARSAL[0].people;
  for (const step of REHEARSAL) {
    if (t >= step.at) people = step.people;
  }
  return people;
}

function shortBrief(title) {
  return title.replace(/^REVO\s+/, "").replace(/\s+Campaign$/, "");
}

function activityFor(member) {
  const tracking = staffTimeTracking.find((row) => row.memberId === member.id);
  if (tracking?.taskRef) {
    const thread = taskThreads.find((item) => item.taskRef === tracking.taskRef);
    if (thread) {
      return `${thread.taskName.split(" · ").pop()} · ${tracking.taskRef}`;
    }
  }

  const task = tasks.find(
    (item) =>
      item.assignee?.id === member.id &&
      (item.status === "In Progress" || item.status === "In Review"),
  );
  if (task) {
    return `${task.title.split(" ").slice(0, 4).join(" ")} · ${shortBrief(task.briefTitle)}`;
  }
  const anyTask = tasks.find((item) => item.assignee?.id === member.id);
  if (anyTask) {
    return `${anyTask.title.split(" ").slice(0, 4).join(" ")} · ${shortBrief(anyTask.briefTitle)}`;
  }
  const brief = briefs.find((item) =>
    item.assignees?.some((assignee) => assignee.id === member.id),
  );
  if (brief) return `${member.role} · ${shortBrief(brief.title)}`;
  return member.role;
}

function PresencePhoto({ person }) {
  const [failed, setFailed] = useState(false);
  const initials = person.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const src = person.portrait || person.avatar;

  if (failed || !src) {
    return (
      <div
        className="login-presence-photo login-presence-fallback"
        style={{ background: person.color || "#333" }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="login-presence-photo"
      onError={() => setFailed(true)}
    />
  );
}

function useRehearsal() {
  const [people, setPeople] = useState(() => snapshotAt(0));

  useEffect(() => {
    const started = Date.now();
    const tick = () => {
      const next = snapshotAt(((Date.now() - started) / 1000) % LOOP_S);
      setPeople((prev) =>
        prev.length === next.length &&
        prev.every((p, i) => p.id === next[i].id && p.status === next[i].status)
          ? prev
          : next,
      );
    };
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, []);

  return people;
}

export default function LiveWindow() {
  const present = useRehearsal();
  const roster = useMemo(
    () =>
      present
        .map((row) => {
          const member = teamMembers.find((m) => m.id === row.id);
          if (!member) return null;
          return {
            ...member,
            presence: row.status,
            activity: activityFor(member),
            seat: SEATS[member.id],
          };
        })
        .filter(Boolean),
    [present],
  );

  const onlineCount = roster.filter((person) => person.presence === "online").length;

  return (
    <div className="login-live" aria-hidden>
      <div className="login-live-interior">
        {roster.map((person) => (
          <article
            key={person.id}
            className={`login-presence-card login-presence-card--${person.presence}`}
            style={{
              left: `${person.seat.x}%`,
              top: `${person.seat.y}%`,
              width: person.seat.size,
              zIndex: person.seat.depth + 1,
            }}
          >
            <PresencePhoto person={person} />
            <div className="login-presence-shade" />
            <span
              className={`login-presence-dot login-presence-dot--${person.presence}`}
            />
            <div className="login-presence-meta">
              <p className="login-presence-role">{person.role}</p>
              <h3 className="login-presence-name">{person.name}</h3>
              <p className="login-presence-activity">{person.activity}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="login-live-caption">
        {onlineCount} signed in · the studio is warm
      </p>
    </div>
  );
}

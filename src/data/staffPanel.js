// Mock data for the Command Center staff panel — time tracking (REVO Staff),
// task threads, activity, and messages. Task refs (#1639 etc.) point at real
// rows in the Ad Production board seed so the two panes feel connected.

// Current user's Hubstaff-style tracking snapshot.
export const myTimeTracking = {
  todayMinutes: 267,
  weeklyGoalHours: 38,
  activityPct: 76,
  streakDays: 6,
  currentTask: { ref: "#1712", title: "Relief Bundle · finals pass", elapsed: "38m" },
  week: [
    { day: "Mon", minutes: 402 },
    { day: "Tue", minutes: 379 },
    { day: "Wed", minutes: 340 },
    { day: "Thu", minutes: 267, today: true },
    { day: "Fri", minutes: 0 },
    { day: "Sat", minutes: 0 },
    { day: "Sun", minutes: 0 },
  ],
};

// Per-member live tracking state. `state` mirrors mockData presence:
// online → tracking, away → idle, offline → offline.
export const staffTimeTracking = [
  { memberId: 1, state: "tracking", todayMinutes: 318, activityPct: 84, taskRef: "#1639" },
  { memberId: 2, state: "tracking", todayMinutes: 289, activityPct: 71, taskRef: "#1721" },
  { memberId: 3, state: "idle", todayMinutes: 154, activityPct: 62, taskRef: "#1724" },
  { memberId: 4, state: "tracking", todayMinutes: 342, activityPct: 88, taskRef: "#1682" },
  { memberId: 5, state: "offline", todayMinutes: 0, activityPct: 0, taskRef: null },
  { memberId: 6, state: "tracking", todayMinutes: 226, activityPct: 69, taskRef: "#1635" },
  { memberId: 7, state: "tracking", todayMinutes: 301, activityPct: 79, taskRef: "#1676" },
  { memberId: 8, state: "idle", todayMinutes: 187, activityPct: 58, taskRef: "#1619" },
];

export const taskThreads = [
  {
    id: "th-1639",
    taskRef: "#1639",
    taskName: "Relief Bundle · Curiosity hook re-cut",
    status: "Revisions Needed",
    participantIds: [1, 4, 3],
    unread: 3,
    replies: 14,
    lastMessage: { memberId: 4, text: "Pushed v3 — tightened the first 2s and swapped the proof shot.", time: "6m" },
  },
  {
    id: "th-1721",
    taskRef: "#1721",
    taskName: "Relief Bundle · static carousel set",
    status: "Ready For Review",
    participantIds: [3, 2],
    unread: 1,
    replies: 6,
    lastMessage: { memberId: 3, text: "All 5 frames exported @2x, review link inside.", time: "22m" },
  },
  {
    id: "th-1712",
    taskRef: "#1712",
    taskName: "Relief Bundle · finals pass",
    status: "Approved",
    participantIds: [1, 6, 7],
    unread: 0,
    replies: 21,
    lastMessage: { memberId: 7, text: "Grade matched to the winner from last week.", time: "1h" },
  },
  {
    id: "th-1682",
    taskRef: "#1682",
    taskName: "Face Genie · before/after UGC",
    status: "Approved",
    participantIds: [4, 8],
    unread: 0,
    replies: 9,
    lastMessage: { memberId: 8, text: "Creator selects uploaded to the gallery.", time: "3h" },
  },
  {
    id: "th-1619",
    taskRef: "#1619",
    taskName: "Relief Bundle · launch checklist",
    status: "Ready For Launch",
    participantIds: [6, 2, 5],
    unread: 2,
    replies: 11,
    lastMessage: { memberId: 6, text: "Captions + thumb variants attached, ready for Meta.", time: "4h" },
  },
  {
    id: "th-1676",
    taskRef: "#1676",
    taskName: "Face Genie · final review notes",
    status: "Final Review",
    participantIds: [7, 1],
    unread: 0,
    replies: 4,
    lastMessage: { memberId: 1, text: "Two timing notes at 00:08 and 00:19, otherwise clean.", time: "5h" },
  },
];

export const staffActivity = [
  { id: "a1", memberId: 4, kind: "upload", text: "uploaded v3 edit to", target: "#1639", time: "6m", unread: true },
  { id: "a2", memberId: 3, kind: "status", text: "moved to Ready For Review", target: "#1724", time: "18m", unread: true },
  { id: "a3", memberId: 7, kind: "time", text: "logged 2h 40m on", target: "#1676", time: "34m" },
  { id: "a4", memberId: 1, kind: "mention", text: "mentioned you in", target: "#1712", time: "52m", unread: true },
  { id: "a5", memberId: 2, kind: "comment", text: "commented on the shot list for", target: "#1721", time: "1h" },
  { id: "a6", memberId: 6, kind: "approval", text: "approved finals for", target: "#1682", time: "2h" },
  { id: "a7", memberId: 8, kind: "upload", text: "added creator selects to", target: "#1682", time: "3h" },
  { id: "a8", memberId: 5, kind: "status", text: "flagged budget review on", target: "#1619", time: "5h" },
];

export const timeOffBalance = {
  vacation: { used: 6, total: 18 },
  sick: { used: 1, total: 6 },
  personal: { used: 0, total: 3 },
};

export const timeOffRequests = [
  {
    id: "pto-1",
    type: "Vacation",
    start: "2026-09-14",
    end: "2026-09-18",
    days: 5,
    status: "Approved",
    note: "Family trip",
  },
  {
    id: "pto-2",
    type: "Personal",
    start: "2026-10-02",
    end: "2026-10-02",
    days: 1,
    status: "Pending",
    note: "Personal appointment",
  },
];

export const staffMessages = [
  { id: "m1", memberId: 4, preview: "Can you eyeball the hook timing before I render finals?", time: "4m", unread: 2 },
  { id: "m2", memberId: 1, preview: "Client notes are in — nothing scary, mostly copy tweaks.", time: "31m", unread: 1 },
  { id: "m3", memberId: 3, preview: "Sending the carousel frames in 10.", time: "1h", unread: 0 },
  { id: "m4", memberId: 7, preview: "Grade LUT attached, reuse it for the whole batch.", time: "2h", unread: 0 },
  { id: "m5", memberId: 6, preview: "Launch copy options for #1619, pick your top two…", time: "3h", unread: 0, draft: true },
  { id: "m6", memberId: 2, preview: "Reshoot slots confirmed for Thursday.", time: "6h", unread: 0 },
];

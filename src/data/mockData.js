const IMG = (id, w = 800, h = 600) =>
  `https://picsum.photos/seed/${id}/${w}/${h}`;

const FACE = (id) => `https://i.pravatar.cc/150?img=${id}`;

export const currentUser = {
  id: 0,
  name: "Kai Montero",
  role: "Senior Creative Director",
  avatar: FACE(12),
  workspace: "REVO Studios",
};

export const teamMembers = [
  { id: 1, name: "Aisha Patel", role: "Video Editor", avatar: FACE(25), status: "online", portrait: IMG("portrait1", 500, 700), socials: { x: true, instagram: true, dribbble: false, linkedin: true, github: false }, color: "#3b82f6", stats: { assetsDelivered: 284, approvalRate: 97, avgTurnaround: "1.8d", activeBriefs: 3, impressions: "1.2M", topCategory: "Video", deliveredThisMonth: 34, revisionsAvg: 0.4 }, adStats: { editsDelivered: 82, adSpendAttributed: 48200, ctr: 3.8, cpm: 12.4, roas: 4.2, thumbStopRate: 42, hookRate: 68, creativeWinRate: 31 }, organicStats: { editsDelivered: 202, totalViews: 1240000, avgWatchTime: 18.4, saveRate: 4.2, shareRate: 2.8, completionRate: 62, viralCoeff: 1.4, avgEngRate: 8.6 } },
  { id: 2, name: "Marcus Chen", role: "Photographer", avatar: FACE(33), status: "online", portrait: IMG("portrait2", 500, 700), socials: { x: true, instagram: true, dribbble: false, linkedin: true, github: true }, color: "#e8442e", stats: { assetsDelivered: 512, approvalRate: 94, avgTurnaround: "2.1d", activeBriefs: 2, impressions: "890K", topCategory: "Photo", deliveredThisMonth: 41, revisionsAvg: 0.6 }, adStats: { editsDelivered: 156, adSpendAttributed: 72400, ctr: 2.9, cpm: 14.8, roas: 3.6, thumbStopRate: 38, hookRate: 55, creativeWinRate: 22 }, organicStats: { editsDelivered: 356, totalViews: 890000, avgWatchTime: 12.1, saveRate: 6.8, shareRate: 3.4, completionRate: 48, viralCoeff: 1.1, avgEngRate: 6.2 } },
  { id: 3, name: "Luna Rivera", role: "Graphic Designer", avatar: FACE(44), status: "away", portrait: IMG("portrait3", 500, 700), socials: { x: false, instagram: true, dribbble: true, linkedin: true, github: false }, color: "#14b8a6", stats: { assetsDelivered: 376, approvalRate: 96, avgTurnaround: "1.5d", activeBriefs: 4, impressions: "1.6M", topCategory: "Graphic", deliveredThisMonth: 28, revisionsAvg: 0.3 }, adStats: { editsDelivered: 124, adSpendAttributed: 56800, ctr: 4.1, cpm: 10.2, roas: 5.1, thumbStopRate: 52, hookRate: 71, creativeWinRate: 38 }, organicStats: { editsDelivered: 252, totalViews: 1600000, avgWatchTime: 14.8, saveRate: 8.2, shareRate: 4.1, completionRate: 55, viralCoeff: 1.6, avgEngRate: 9.4 } },
  { id: 4, name: "James Okafor", role: "Motion Designer", avatar: FACE(51), status: "online", portrait: IMG("portrait4", 500, 700), socials: { x: true, instagram: false, dribbble: true, linkedin: false, github: true }, color: "#8b5cf6", stats: { assetsDelivered: 198, approvalRate: 91, avgTurnaround: "2.8d", activeBriefs: 2, impressions: "2.1M", topCategory: "Motion", deliveredThisMonth: 12, revisionsAvg: 0.9 }, adStats: { editsDelivered: 64, adSpendAttributed: 91200, ctr: 5.2, cpm: 8.6, roas: 6.8, thumbStopRate: 58, hookRate: 78, creativeWinRate: 44 }, organicStats: { editsDelivered: 134, totalViews: 2100000, avgWatchTime: 22.6, saveRate: 5.6, shareRate: 6.2, completionRate: 71, viralCoeff: 2.1, avgEngRate: 11.8 } },
  { id: 5, name: "Sofia Andersson", role: "Art Director", avatar: FACE(5), status: "offline", portrait: IMG("portrait5", 500, 700), socials: { x: true, instagram: true, dribbble: true, linkedin: true, github: false }, color: "#f26b3a", stats: { assetsDelivered: 156, approvalRate: 99, avgTurnaround: "3.2d", activeBriefs: 5, impressions: "3.4M", topCategory: "Campaign", deliveredThisMonth: 8, revisionsAvg: 0.2 }, adStats: { editsDelivered: 48, adSpendAttributed: 124600, ctr: 4.8, cpm: 9.2, roas: 7.4, thumbStopRate: 61, hookRate: 82, creativeWinRate: 52 }, organicStats: { editsDelivered: 108, totalViews: 3400000, avgWatchTime: 26.2, saveRate: 9.4, shareRate: 7.8, completionRate: 74, viralCoeff: 2.8, avgEngRate: 14.2 } },
  { id: 6, name: "Tariq Hassan", role: "Video Editor", avatar: FACE(60), status: "online", portrait: IMG("portrait6", 500, 700), socials: { x: true, instagram: true, dribbble: false, linkedin: false, github: true }, color: "#eab308", stats: { assetsDelivered: 321, approvalRate: 93, avgTurnaround: "2.0d", activeBriefs: 3, impressions: "980K", topCategory: "Video", deliveredThisMonth: 26, revisionsAvg: 0.7 }, adStats: { editsDelivered: 98, adSpendAttributed: 38600, ctr: 3.2, cpm: 15.6, roas: 3.1, thumbStopRate: 35, hookRate: 52, creativeWinRate: 18 }, organicStats: { editsDelivered: 223, totalViews: 980000, avgWatchTime: 15.2, saveRate: 3.8, shareRate: 2.4, completionRate: 52, viralCoeff: 1.2, avgEngRate: 7.1 } },
  { id: 7, name: "Mika Tanaka", role: "Colorist", avatar: FACE(15), status: "online", portrait: IMG("portrait7", 500, 700), socials: { x: false, instagram: true, dribbble: false, linkedin: true, github: false }, color: "#ec4899", stats: { assetsDelivered: 445, approvalRate: 98, avgTurnaround: "1.2d", activeBriefs: 1, impressions: "640K", topCategory: "Color Grade", deliveredThisMonth: 52, revisionsAvg: 0.2 }, adStats: { editsDelivered: 178, adSpendAttributed: 31200, ctr: 2.6, cpm: 18.2, roas: 2.8, thumbStopRate: 28, hookRate: 44, creativeWinRate: 14 }, organicStats: { editsDelivered: 267, totalViews: 640000, avgWatchTime: 10.8, saveRate: 3.2, shareRate: 1.8, completionRate: 44, viralCoeff: 0.9, avgEngRate: 5.4 } },
  { id: 8, name: "Elena Volkov", role: "Photographer", avatar: FACE(9), status: "away", portrait: IMG("portrait8", 500, 700), socials: { x: true, instagram: true, dribbble: false, linkedin: true, github: true }, color: "#06b6d4", stats: { assetsDelivered: 389, approvalRate: 95, avgTurnaround: "1.9d", activeBriefs: 2, impressions: "1.1M", topCategory: "Photo", deliveredThisMonth: 31, revisionsAvg: 0.5 }, adStats: { editsDelivered: 112, adSpendAttributed: 52800, ctr: 3.6, cpm: 11.8, roas: 4.6, thumbStopRate: 46, hookRate: 62, creativeWinRate: 28 }, organicStats: { editsDelivered: 277, totalViews: 1100000, avgWatchTime: 16.4, saveRate: 5.8, shareRate: 3.6, completionRate: 58, viralCoeff: 1.3, avgEngRate: 7.8 } },
];

export const products = [
  "REVO Core", "REVO Sport", "REVO Luxe", "REVO Kids",
  "REVO Home", "REVO Travel", "REVO Studio", "REVO x Puma",
];

export const partners = [
  "Nike", "Adidas", "Puma", "New Balance", "Converse",
  "Under Armour", "Reebok", "ASICS",
];

export const statuses = ["In Progress", "In Review", "Approved", "Needs Revision", "Delivered", "Draft"];
export const assetTypes = ["Photo", "Video", "Graphic", "Motion", "3D Render", "Illustration"];
export const categories = ["Campaign", "Product Shot", "Lifestyle", "Editorial", "Social", "Packaging", "Event", "BTS"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomDate(daysBack = 90) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().split("T")[0];
}

const assetTitles = [
  "Hero Campaign Shot", "Product Detail Close-up", "Lifestyle Urban Series",
  "Studio Portrait A", "Motion Reel Snippet", "Social Grid Asset",
  "Packaging Front View", "BTS Studio Day", "Editorial Spread Left",
  "3D Product Spin", "Event Coverage Main", "Campaign Video Thumb",
  "Flat Lay Composition", "Night Street Series", "Color Study Warm",
  "Texture Detail Macro", "Model Lookbook Page", "Product on White",
  "Overhead Arrangement", "Cinematic Still Frame",
];

const briefLinks = [
  { id: 1, title: "REVO Sport SS26 Campaign" },
  { id: 2, title: "REVO Luxe Brand Film" },
  { id: 3, title: "REVO x Puma Co-Brand" },
  { id: 5, title: "REVO Home Lifestyle Shoot" },
];

export const assets = Array.from({ length: 80 }, (_, i) => {
  const id = i + 1;
  const w = [800, 900, 1000, 1200][i % 4];
  const h = [600, 700, 800, 900, 500][i % 5];
  const type = randomFrom(assetTypes);
  const editor = randomFrom(teamMembers);
  const status = randomFrom(statuses);
  const daysAgo = Math.floor(Math.random() * 14);
  const linkedBrief = Math.random() > 0.35 ? randomFrom(briefLinks) : null;
  return {
    id,
    title: assetTitles[i % 20],
    thumbnail: IMG(`asset${id}`, w, h),
    type,
    category: randomFrom(categories),
    product: randomFrom(products),
    partner: randomFrom(partners),
    status,
    editor: editor.name,
    editorId: editor.id,
    editorAvatar: editor.avatar,
    editorNeeded: Math.random() > 0.7,
    dateSubmitted: randomDate(),
    daysAgo,
    isNew: daysAgo <= 3,
    isFeatured: i < 8,
    dimensions: `${w * 3}x${h * 3}`,
    fileSize: `${(Math.random() * 45 + 2).toFixed(1)} MB`,
    tags: [randomFrom(categories), randomFrom(assetTypes), randomFrom(products)],
    views: Math.floor(Math.random() * 2000 + 50),
    downloads: Math.floor(Math.random() * 300 + 5),
    width: w,
    height: h,
    briefId: linkedBrief?.id || null,
    briefTitle: linkedBrief?.title || null,
    colorDominant: [`#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}`][0],
    aspectLabel: w > h ? "Landscape" : w === h ? "Square" : "Portrait",
  };
});

export const briefs = [
  {
    id: 1,
    title: "REVO Sport SS26 Campaign",
    campaign: "Spring/Summer 2026",
    description: "Full creative campaign for the Spring/Summer 2026 Sport line. Includes hero photography, video content, social assets, and retail packaging design.",
    product: "REVO Sport",
    partner: "Nike",
    status: "In Progress",
    priority: "High",
    progress: 68,
    dueDate: "2026-05-15",
    dateCreated: "2026-02-01",
    thumbnail: IMG("brief1", 1200, 800),
    assignees: [teamMembers[0], teamMembers[1], teamMembers[3]],
    deliverables: [
      { id: "d1", name: "Hero Photography (12 shots)", status: "Approved", count: 12, completed: 12 },
      { id: "d2", name: "Campaign Video 60s", status: "In Review", count: 1, completed: 1 },
      { id: "d3", name: "Campaign Video 30s Cut", status: "In Progress", count: 1, completed: 0 },
      { id: "d4", name: "Social Grid Assets", status: "In Progress", count: 24, completed: 16 },
      { id: "d5", name: "Stories Templates", status: "Draft", count: 8, completed: 0 },
      { id: "d6", name: "Retail POS Materials", status: "Draft", count: 6, completed: 0 },
    ],
    references: [IMG("ref1a", 600, 400), IMG("ref1b", 600, 400), IMG("ref1c", 600, 400)],
    linkedAssets: [1, 2, 5, 10, 14],
    notes: [
      { author: teamMembers[0], text: "Hero shots approved by client. Moving to video phase.", date: "2026-03-20" },
      { author: teamMembers[1], text: "Studio B booked for reshoots April 5–6.", date: "2026-03-28" },
    ],
    tasks: 52,
    tasksCompleted: 35,
    comments: 24,
  },
  {
    id: 2,
    title: "REVO Luxe Brand Film",
    campaign: "Brand Awareness",
    description: "Cinematic brand film capturing the essence of REVO Luxe. 90-second hero piece with 15s and 6s cutdowns for digital.",
    product: "REVO Luxe",
    partner: "Converse",
    status: "In Review",
    priority: "High",
    progress: 85,
    dueDate: "2026-04-30",
    dateCreated: "2026-01-15",
    thumbnail: IMG("brief2", 1200, 800),
    assignees: [teamMembers[3], teamMembers[6]],
    deliverables: [
      { id: "d7", name: "90s Hero Film", status: "In Review", count: 1, completed: 1 },
      { id: "d8", name: "15s Digital Cutdown", status: "In Review", count: 1, completed: 1 },
      { id: "d9", name: "6s Bumper Ads", status: "In Progress", count: 3, completed: 2 },
      { id: "d10", name: "BTS Content", status: "Approved", count: 8, completed: 8 },
    ],
    references: [IMG("ref2a", 600, 400), IMG("ref2b", 600, 400)],
    linkedAssets: [3, 8, 11],
    notes: [
      { author: teamMembers[3], text: "Final color pass complete. Awaiting director sign-off.", date: "2026-04-05" },
    ],
    tasks: 28,
    tasksCompleted: 24,
    comments: 18,
  },
  {
    id: 3,
    title: "REVO x Puma Co-Brand",
    campaign: "Collaboration Drop",
    description: "Co-branded visual identity and content package for the REVO x Puma collaboration drop.",
    product: "REVO x Puma",
    partner: "Puma",
    status: "In Progress",
    priority: "Critical",
    progress: 42,
    dueDate: "2026-06-01",
    dateCreated: "2026-03-01",
    thumbnail: IMG("brief3", 1200, 800),
    assignees: [teamMembers[2], teamMembers[4], teamMembers[1]],
    deliverables: [
      { id: "d11", name: "Co-brand Logo Suite", status: "Approved", count: 1, completed: 1 },
      { id: "d12", name: "Product Photography", status: "In Progress", count: 30, completed: 12 },
      { id: "d13", name: "Lookbook Design", status: "Draft", count: 1, completed: 0 },
      { id: "d14", name: "Social Launch Kit", status: "Draft", count: 20, completed: 0 },
      { id: "d15", name: "Event Collateral", status: "Draft", count: 8, completed: 0 },
    ],
    references: [IMG("ref3a", 600, 400), IMG("ref3b", 600, 400), IMG("ref3c", 600, 400), IMG("ref3d", 600, 400)],
    linkedAssets: [4, 7, 15, 20],
    notes: [
      { author: teamMembers[4], text: "Puma brand team approved co-brand marks. Photography next.", date: "2026-03-18" },
      { author: teamMembers[2], text: "Lookbook wireframes shared for internal review.", date: "2026-04-01" },
    ],
    tasks: 64,
    tasksCompleted: 27,
    comments: 31,
  },
  {
    id: 4,
    title: "REVO Kids Illustration Series",
    campaign: "Kids Launch",
    description: "Playful illustration series for the Kids line, covering packaging, web, and in-store display.",
    product: "REVO Kids",
    partner: "New Balance",
    status: "Approved",
    priority: "Medium",
    progress: 100,
    dueDate: "2026-04-01",
    dateCreated: "2025-12-10",
    thumbnail: IMG("brief4", 1200, 800),
    assignees: [teamMembers[2]],
    deliverables: [
      { id: "d16", name: "Character Illustrations", status: "Approved", count: 8, completed: 8 },
      { id: "d17", name: "Packaging Artwork", status: "Approved", count: 4, completed: 4 },
      { id: "d18", name: "Web Banner Set", status: "Approved", count: 6, completed: 6 },
    ],
    references: [IMG("ref4a", 600, 400)],
    linkedAssets: [6, 12],
    notes: [
      { author: teamMembers[2], text: "All deliverables approved. Brief closed.", date: "2026-03-30" },
    ],
    tasks: 18,
    tasksCompleted: 18,
    comments: 9,
  },
  {
    id: 5,
    title: "REVO Home Lifestyle Shoot",
    campaign: "Home Collection",
    description: "Lifestyle photography series shot on location in Lisbon. Focus on natural light, warm tones, and intimate settings.",
    product: "REVO Home",
    partner: "ASICS",
    status: "In Progress",
    priority: "Medium",
    progress: 55,
    dueDate: "2026-05-20",
    dateCreated: "2026-02-20",
    thumbnail: IMG("brief5", 1200, 800),
    assignees: [teamMembers[1], teamMembers[7]],
    deliverables: [
      { id: "d19", name: "Location Photography", status: "In Progress", count: 40, completed: 22 },
      { id: "d20", name: "Post-Production Edit", status: "In Progress", count: 40, completed: 18 },
      { id: "d21", name: "Social Selects", status: "Draft", count: 15, completed: 0 },
    ],
    references: [IMG("ref5a", 600, 400), IMG("ref5b", 600, 400)],
    linkedAssets: [9, 13, 17],
    notes: [
      { author: teamMembers[1], text: "Lisbon shoot days 1–3 complete. Strong material.", date: "2026-04-02" },
    ],
    tasks: 36,
    tasksCompleted: 20,
    comments: 14,
  },
  {
    id: 6,
    title: "REVO Travel Campaign Q3",
    campaign: "Q3 Global",
    description: "Global travel campaign featuring destination-inspired product styling across 5 cities.",
    product: "REVO Travel",
    partner: "Under Armour",
    status: "Draft",
    priority: "Low",
    progress: 12,
    dueDate: "2026-08-01",
    dateCreated: "2026-03-25",
    thumbnail: IMG("brief6", 1200, 800),
    assignees: [teamMembers[4]],
    deliverables: [
      { id: "d22", name: "City Mood Boards", status: "In Progress", count: 5, completed: 2 },
      { id: "d23", name: "Shot Lists", status: "Draft", count: 5, completed: 0 },
      { id: "d24", name: "Talent Casting", status: "Draft", count: 1, completed: 0 },
    ],
    references: [],
    linkedAssets: [],
    notes: [],
    tasks: 40,
    tasksCompleted: 5,
    comments: 6,
  },
];

export const tasks = [
  { id: 1, title: "Finalize 30s campaign cutdown", briefId: 1, briefTitle: "REVO Sport SS26 Campaign", status: "In Review", assignee: teamMembers[0], dueDate: "2026-04-12", priority: "High" },
  { id: 2, title: "Color grade brand film bumper #3", briefId: 2, briefTitle: "REVO Luxe Brand Film", status: "In Progress", assignee: teamMembers[6], dueDate: "2026-04-14", priority: "High" },
  { id: 3, title: "Retouch product shots batch 2", briefId: 3, briefTitle: "REVO x Puma Co-Brand", status: "In Progress", assignee: teamMembers[1], dueDate: "2026-04-15", priority: "Critical" },
  { id: 4, title: "Design social grid template set", briefId: 1, briefTitle: "REVO Sport SS26 Campaign", status: "In Progress", assignee: teamMembers[2], dueDate: "2026-04-18", priority: "Medium" },
  { id: 5, title: "Export hero film 4K master", briefId: 2, briefTitle: "REVO Luxe Brand Film", status: "In Review", assignee: teamMembers[3], dueDate: "2026-04-11", priority: "High" },
  { id: 6, title: "Select lifestyle shoot top 20", briefId: 5, briefTitle: "REVO Home Lifestyle Shoot", status: "In Progress", assignee: teamMembers[7], dueDate: "2026-04-16", priority: "Medium" },
  { id: 7, title: "Create Tokyo mood board", briefId: 6, briefTitle: "REVO Travel Campaign Q3", status: "Draft", assignee: teamMembers[4], dueDate: "2026-04-25", priority: "Low" },
  { id: 8, title: "Upload POS layout drafts", briefId: 1, briefTitle: "REVO Sport SS26 Campaign", status: "Draft", assignee: teamMembers[2], dueDate: "2026-04-22", priority: "Medium" },
];

export const savedViews = [
  { id: 1, name: "My Review Queue", icon: "eye", count: 14, filters: { status: "In Review" }, description: "Assets waiting for your review" },
  { id: 2, name: "REVO Sport Assets", icon: "zap", count: 86, filters: { product: "REVO Sport" }, description: "All Sport line creative" },
  { id: 3, name: "Photography", icon: "camera", count: 412, filters: { type: "Photo" }, description: "Photo assets only" },
  { id: 4, name: "Needs Editor", icon: "user-plus", count: 23, filters: { editorNeeded: true }, description: "Unassigned work" },
  { id: 5, name: "This Week", icon: "clock", count: 47, filters: { daysAgo: 7 }, description: "Uploaded in last 7 days" },
  { id: 6, name: "Campaign Hero Shots", icon: "star", count: 31, filters: { category: "Campaign" }, description: "Hero campaign imagery" },
  { id: 7, name: "Video & Motion", icon: "film", count: 128, filters: { type: "Video" }, description: "All motion content" },
  { id: 8, name: "Approved & Delivered", icon: "check", count: 892, filters: { status: "Approved" }, description: "Final approved assets" },
];

export const galleries = [
  {
    id: 1, title: "SS26 Campaign Selects", description: "Final approved shots from the Spring/Summer campaign shoot",
    thumbnail: IMG("gal1", 900, 600), assetCount: 48, createdBy: teamMembers[4], dateCreated: "2026-03-15", lastUpdated: "2026-04-08",
    isShared: true, tags: ["Campaign", "SS26", "Approved"],
    coverImages: [IMG("gal1a", 400, 400), IMG("gal1b", 400, 400), IMG("gal1c", 400, 400), IMG("gal1d", 400, 400)],
  },
  {
    id: 2, title: "Brand Film Stills", description: "Selected stills from the REVO Luxe brand film shoot",
    thumbnail: IMG("gal2", 900, 600), assetCount: 32, createdBy: teamMembers[3], dateCreated: "2026-03-01", lastUpdated: "2026-04-05",
    isShared: true, tags: ["Film", "Luxe", "Stills"],
    coverImages: [IMG("gal2a", 400, 400), IMG("gal2b", 400, 400), IMG("gal2c", 400, 400), IMG("gal2d", 400, 400)],
  },
  {
    id: 3, title: "Product Detail Library", description: "High-res product detail shots for all REVO lines",
    thumbnail: IMG("gal3", 900, 600), assetCount: 120, createdBy: teamMembers[1], dateCreated: "2026-01-20", lastUpdated: "2026-04-10",
    isShared: false, tags: ["Product", "Detail", "Library"],
    coverImages: [IMG("gal3a", 400, 400), IMG("gal3b", 400, 400), IMG("gal3c", 400, 400), IMG("gal3d", 400, 400)],
  },
  {
    id: 4, title: "Mood & Inspiration", description: "Curated inspiration board for upcoming creative direction",
    thumbnail: IMG("gal4", 900, 600), assetCount: 67, createdBy: teamMembers[2], dateCreated: "2026-02-10", lastUpdated: "2026-04-03",
    isShared: true, tags: ["Mood", "Inspiration", "Direction"],
    coverImages: [IMG("gal4a", 400, 400), IMG("gal4b", 400, 400), IMG("gal4c", 400, 400), IMG("gal4d", 400, 400)],
  },
  {
    id: 5, title: "Puma Collab References", description: "Reference imagery and moodboards for the Puma collaboration",
    thumbnail: IMG("gal5", 900, 600), assetCount: 25, createdBy: teamMembers[4], dateCreated: "2026-03-05", lastUpdated: "2026-04-01",
    isShared: true, tags: ["Puma", "Collab", "Reference"],
    coverImages: [IMG("gal5a", 400, 400), IMG("gal5b", 400, 400), IMG("gal5c", 400, 400), IMG("gal5d", 400, 400)],
  },
  {
    id: 6, title: "Social Best Performers", description: "Top performing social content from Q1 2026",
    thumbnail: IMG("gal6", 900, 600), assetCount: 36, createdBy: teamMembers[0], dateCreated: "2026-04-01", lastUpdated: "2026-04-09",
    isShared: false, tags: ["Social", "Performance", "Q1"],
    coverImages: [IMG("gal6a", 400, 400), IMG("gal6b", 400, 400), IMG("gal6c", 400, 400), IMG("gal6d", 400, 400)],
  },
];

export const brandGuidelines = {
  colors: {
    primary: [
      { name: "REVO Black", hex: "#0a0a0a", usage: "Primary backgrounds, text" },
      { name: "REVO White", hex: "#f0efe9", usage: "Primary text on dark, clean surfaces" },
      { name: "REVO Red", hex: "#e8442e", usage: "Primary accent, CTAs, highlights" },
    ],
    secondary: [
      { name: "Charcoal", hex: "#1a1a1a", usage: "Card backgrounds, secondary surfaces" },
      { name: "Warm Gray", hex: "#2a2a2a", usage: "Borders, dividers, muted surfaces" },
      { name: "Signal Blue", hex: "#3b82f6", usage: "Links, informational accents" },
      { name: "Studio Orange", hex: "#f26b3a", usage: "Warnings, secondary highlights" },
      { name: "Deep Teal", hex: "#14b8a6", usage: "Success states, positive indicators" },
      { name: "Electric Purple", hex: "#8b5cf6", usage: "Special editions, creative accents" },
    ],
  },
  typography: {
    primary: {
      name: "Inter",
      weights: ["Light 300", "Regular 400", "Medium 500", "Semibold 600", "Bold 700", "ExtraBold 800", "Black 900"],
      usage: "All UI text, headings, and body copy",
      samples: [
        { weight: 900, size: "64px", label: "Display", text: "REVO CREATE" },
        { weight: 800, size: "40px", label: "H1", text: "Creative Command" },
        { weight: 700, size: "28px", label: "H2", text: "Brief Overview" },
        { weight: 600, size: "20px", label: "H3", text: "Asset Details" },
        { weight: 400, size: "15px", label: "Body", text: "The quick brown fox jumps over the lazy dog. Creative operations at scale require precision and taste." },
        { weight: 500, size: "12px", label: "Caption", text: "METADATA · STATUS · TAGS" },
      ],
    },
    mono: { name: "JetBrains Mono", weights: ["Regular 400", "Medium 500"], usage: "Code references, IDs, technical metadata" },
  },
  logos: [
    { name: "REVO Primary Mark", variant: "Full Logo", usage: "Primary brand identifier", bg: "dark" },
    { name: "REVO Wordmark", variant: "Text Only", usage: "Compact spaces, inline usage", bg: "dark" },
    { name: "REVO Icon", variant: "Symbol Only", usage: "Favicons, app icons, small marks", bg: "dark" },
    { name: "REVO Primary Mark", variant: "Inverted", usage: "Light background applications", bg: "light" },
  ],
  productStyles: [
    { name: "REVO Sport", mood: "Dynamic, high-energy, bold", palette: ["#e8442e", "#0a0a0a", "#f0efe9"], thumbnail: IMG("prodstyle1", 600, 400) },
    { name: "REVO Luxe", mood: "Refined, cinematic, warm", palette: ["#8b5cf6", "#1a1a1a", "#f0efe9"], thumbnail: IMG("prodstyle2", 600, 400) },
    { name: "REVO Kids", mood: "Playful, vibrant, friendly", palette: ["#f26b3a", "#3b82f6", "#14b8a6"], thumbnail: IMG("prodstyle3", 600, 400) },
    { name: "REVO Home", mood: "Warm, natural, intimate", palette: ["#14b8a6", "#2a2a2a", "#f0efe9"], thumbnail: IMG("prodstyle4", 600, 400) },
  ],
  resources: [
    { name: "Full Brand Kit (.zip)", size: "248 MB", type: "archive", updated: "2026-03-15" },
    { name: "Logo Suite (.ai, .svg, .png)", size: "18 MB", type: "logos", updated: "2026-03-15" },
    { name: "Color Swatches (.ase)", size: "2 KB", type: "colors", updated: "2026-02-20" },
    { name: "Typography Specimen (.pdf)", size: "4.2 MB", type: "typography", updated: "2026-02-20" },
    { name: "Photography Guidelines (.pdf)", size: "12 MB", type: "guidelines", updated: "2026-01-10" },
    { name: "Motion Templates (.aep)", size: "340 MB", type: "motion", updated: "2026-03-01" },
  ],
  spacing: { grid: "8px base unit", columns: "12-column grid system", gutters: "24px standard gutter", margins: "32px page margins" },
};

export const notifications = [
  { id: 1, type: "review", message: "Aisha submitted 30s cutdown for review", time: "5m ago", read: false },
  { id: 2, type: "comment", message: "Marcus commented on Lifestyle Urban Series", time: "22m ago", read: false },
  { id: 3, type: "approval", message: "REVO Kids Illustration Series approved", time: "1h ago", read: false },
  { id: 4, type: "assignment", message: "You've been assigned to Travel Campaign Q3", time: "2h ago", read: true },
  { id: 5, type: "delivery", message: "Brand Film final export completed", time: "3h ago", read: true },
];

export const recentActivity = [
  { id: 1, user: teamMembers[0], action: "uploaded 4 new assets to", target: "SS26 Campaign", time: "12m ago" },
  { id: 2, user: teamMembers[3], action: "completed color grade on", target: "Brand Film 90s", time: "34m ago" },
  { id: 3, user: teamMembers[1], action: "started shooting for", target: "Home Lifestyle Shoot", time: "1h ago" },
  { id: 4, user: teamMembers[2], action: "submitted revision for", target: "Co-Brand Logo Suite", time: "2h ago" },
  { id: 5, user: teamMembers[6], action: "approved deliverable in", target: "Kids Illustration Series", time: "3h ago" },
  { id: 6, user: teamMembers[4], action: "created new brief", target: "Travel Campaign Q3", time: "4h ago" },
  { id: 7, user: teamMembers[7], action: "downloaded selects from", target: "Product Detail Library", time: "5h ago" },
];

export const spotlightCampaigns = [
  { id: 1, title: "Sport SS26", subtitle: "Spring/Summer", thumbnail: IMG("spot1", 900, 700), metric: "86 Assets", briefId: 1, product: "REVO Sport" },
  { id: 2, title: "Luxe Film", subtitle: "Brand Awareness", thumbnail: IMG("spot2", 900, 700), metric: "32 Assets", briefId: 2, product: "REVO Luxe" },
  { id: 3, title: "Puma Collab", subtitle: "Co-Brand Drop", thumbnail: IMG("spot3", 900, 700), metric: "54 Assets", briefId: 3, product: "REVO x Puma" },
  { id: 4, title: "Home Lifestyle", subtitle: "Lisbon Shoot", thumbnail: IMG("spot4", 900, 900), metric: "120 Assets", briefId: 5, product: "REVO Home" },
  { id: 5, title: "Kids Launch", subtitle: "Illustration Series", thumbnail: IMG("spot5", 900, 700), metric: "48 Assets", briefId: 4, product: "REVO Kids" },
  { id: 6, title: "Travel Q3", subtitle: "Global Campaign", thumbnail: IMG("spot6", 900, 700), metric: "18 Assets", briefId: 6, product: "REVO Travel" },
];

export const curatedCollections = [
  { id: 1, title: "Campaign Heroes", subtitle: "Best-of selects", thumbnail: IMG("coll1", 900, 700), count: 247, accent: "red" },
  { id: 2, title: "Motion & Video", subtitle: "All formats", thumbnail: IMG("coll2", 900, 700), count: 891, accent: "purple" },
  { id: 3, title: "Product Library", subtitle: "On-white shots", thumbnail: IMG("coll3", 900, 700), count: 1420, accent: "teal" },
  { id: 4, title: "Editorial", subtitle: "Magazine & Press", thumbnail: IMG("coll4", 900, 900), count: 364, accent: "blue" },
  { id: 5, title: "Social Content", subtitle: "Grid & Stories", thumbnail: IMG("coll5", 900, 700), count: 2106, accent: "orange" },
  { id: 6, title: "Packaging", subtitle: "Print-ready", thumbnail: IMG("coll6", 900, 700), count: 518, accent: "red" },
];

export const featuredGalleryCards = [
  { id: 1, title: "SS26 Selects", subtitle: "Campaign Finals", thumbnail: IMG("fgal1", 900, 700), assetCount: 48, curator: teamMembers[4] },
  { id: 2, title: "Brand Film", subtitle: "Stills & BTS", thumbnail: IMG("fgal2", 900, 700), assetCount: 32, curator: teamMembers[3] },
  { id: 3, title: "Product Detail", subtitle: "High-Res Library", thumbnail: IMG("fgal3", 900, 700), assetCount: 120, curator: teamMembers[1] },
  { id: 4, title: "Inspiration", subtitle: "Mood & Direction", thumbnail: IMG("fgal4", 900, 900), assetCount: 67, curator: teamMembers[2] },
  { id: 5, title: "Puma Refs", subtitle: "Collaboration", thumbnail: IMG("fgal5", 900, 700), assetCount: 25, curator: teamMembers[4] },
  { id: 6, title: "Social Best", subtitle: "Top Performers", thumbnail: IMG("fgal6", 900, 700), assetCount: 36, curator: teamMembers[0] },
];

export const dashboardStats = {
  totalAssets: 31247,
  assetsThisWeek: 184,
  activeBriefs: 5,
  briefsDueThisMonth: 3,
  teamOnline: 6,
  teamTotal: 8,
  deliverablesPending: 14,
  approvalRate: 94,
};

export const socialPerformance = {
  overview: {
    totalImpressions: 4_872_000,
    impressionsChange: 12.4,
    totalEngagements: 312_000,
    engagementsChange: 8.7,
    totalReach: 2_140_000,
    reachChange: -2.1,
    avgEngagementRate: 6.4,
    engagementRateChange: 1.2,
    totalExports: 847,
    exportsThisWeek: 62,
    topPlatform: "Instagram",
    topPlatformShare: 42,
  },
  platformBreakdown: [
    { name: "Instagram", impressions: 2_046_000, engagements: 148_000, rate: 7.2, color: "#E1306C", trend: "up" },
    { name: "TikTok", impressions: 1_380_000, engagements: 96_000, rate: 6.9, color: "#00f2ea", trend: "up" },
    { name: "YouTube", impressions: 892_000, engagements: 42_000, rate: 4.7, color: "#FF0000", trend: "stable" },
    { name: "LinkedIn", impressions: 554_000, engagements: 26_000, rate: 4.7, color: "#0A66C2", trend: "down" },
  ],
  weeklyTrend: [
    { week: "W1", impressions: 980_000, engagements: 62_000 },
    { week: "W2", impressions: 1_120_000, engagements: 71_000 },
    { week: "W3", impressions: 1_040_000, engagements: 68_000 },
    { week: "W4", impressions: 1_320_000, engagements: 84_000 },
    { week: "W5", impressions: 1_410_000, engagements: 92_000 },
  ],
  topPerformingContent: [
    {
      id: 1, title: "SS26 Hero Campaign Shot", thumbnail: IMG("perf1", 600, 600),
      platform: "Instagram", format: "Carousel",
      impressions: 284_000, engagements: 24_800, saves: 3_200, shares: 1_840,
      engagementRate: 8.7, editor: teamMembers[0], brief: "REVO Sport SS26",
      insight: "Carousel format drove 3x more saves vs. single image",
      publishedAt: "2 days ago",
    },
    {
      id: 2, title: "Brand Film 15s Cutdown", thumbnail: IMG("perf2", 600, 600),
      platform: "TikTok", format: "Video",
      impressions: 512_000, engagements: 38_400, saves: 5_100, shares: 4_200,
      engagementRate: 7.5, editor: teamMembers[3], brief: "REVO Luxe Brand Film",
      insight: "First 2 seconds hook increased completion rate by 40%",
      publishedAt: "4 days ago",
    },
    {
      id: 3, title: "Product Detail Macro", thumbnail: IMG("perf3", 600, 600),
      platform: "Instagram", format: "Reel",
      impressions: 196_000, engagements: 18_200, saves: 4_800, shares: 920,
      engagementRate: 9.3, editor: teamMembers[1], brief: "REVO x Puma",
      insight: "Macro detail with text overlay had highest save-to-view ratio this month",
      publishedAt: "1 day ago",
    },
    {
      id: 4, title: "Lifestyle Lisbon BTS", thumbnail: IMG("perf4", 600, 600),
      platform: "YouTube", format: "Short",
      impressions: 148_000, engagements: 11_200, saves: 1_600, shares: 890,
      engagementRate: 7.6, editor: teamMembers[7], brief: "REVO Home Lifestyle",
      insight: "BTS content outperformed polished edits by 2x on engagement",
      publishedAt: "3 days ago",
    },
    {
      id: 5, title: "Puma Collab Teaser", thumbnail: IMG("perf5", 600, 600),
      platform: "TikTok", format: "Video",
      impressions: 380_000, engagements: 29_600, saves: 6_400, shares: 3_100,
      engagementRate: 7.8, editor: teamMembers[2], brief: "REVO x Puma Co-Brand",
      insight: "Teaser format with countdown drove 2x share rate",
      publishedAt: "5 days ago",
    },
    {
      id: 6, title: "Kids Illustration Reel", thumbnail: IMG("perf6", 600, 600),
      platform: "Instagram", format: "Reel",
      impressions: 122_000, engagements: 14_600, saves: 2_800, shares: 1_200,
      engagementRate: 12.0, editor: teamMembers[2], brief: "REVO Kids",
      insight: "Illustration animation had highest engagement rate across all Q1 content",
      publishedAt: "6 days ago",
    },
  ],
  editorInsights: [
    { tip: "Carousel posts are generating 3.2x more saves than single images this quarter", category: "Format" },
    { tip: "Content with text overlays sees 28% higher engagement on Instagram Reels", category: "Creative" },
    { tip: "BTS content outperforms polished edits by 2x on engagement rate", category: "Content Type" },
    { tip: "First 2s hook increased video completion rate by 40% on TikTok", category: "Editing" },
  ],
};

export const revoProducts = [
  {
    id: "wave",
    name: "WAVE",
    tagline: "Ultrasonic Skin Device",
    description: "Precision ultrasonic cleansing and infusion technology for professional-grade skin treatment at home.",
    thumbnail: IMG("revo-wave", 900, 700),
    color: "#3b82f6",
    assetCount: 342,
    briefCount: 4,
    ugcCount: 86,
    topMetric: "1.2M Impressions",
  },
  {
    id: "pill",
    name: "PILL",
    tagline: "LED Therapy Capsule",
    description: "Targeted LED light therapy in a portable capsule form factor. Red, blue, and near-infrared wavelengths.",
    thumbnail: IMG("revo-pill", 900, 700),
    color: "#e8442e",
    assetCount: 218,
    briefCount: 3,
    ugcCount: 52,
    topMetric: "890K Impressions",
  },
  {
    id: "cupper",
    name: "CUPPER",
    tagline: "Smart Cupping System",
    description: "Intelligent vacuum cupping with heat therapy. App-connected for personalized treatment routines.",
    thumbnail: IMG("revo-cupper", 900, 700),
    color: "#14b8a6",
    assetCount: 156,
    briefCount: 2,
    ugcCount: 41,
    topMetric: "640K Impressions",
  },
  {
    id: "face-genie",
    name: "FACE GENIE",
    tagline: "Microcurrent Sculptor",
    description: "Advanced microcurrent facial toning and sculpting. EMS technology for visible lift and definition.",
    thumbnail: IMG("revo-facegenie", 900, 700),
    color: "#8b5cf6",
    assetCount: 289,
    briefCount: 5,
    ugcCount: 73,
    topMetric: "1.8M Impressions",
  },
  {
    id: "collagen-jelly",
    name: "COLLAGEN JELLY",
    tagline: "Ingestible Beauty",
    description: "Marine collagen peptide supplement in jelly form. Bioavailable formula for skin, hair, and nail support.",
    thumbnail: IMG("revo-collagenjelly", 900, 700),
    color: "#f26b3a",
    assetCount: 194,
    briefCount: 3,
    ugcCount: 48,
    topMetric: "720K Impressions",
  },
];

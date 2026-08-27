const SHOP = (file, v, w = 600) =>
  `https://revomadic.com/cdn/shop/files/${file}?v=${v}&width=${w}`;

const IMG = (id, w = 600, h = 800) =>
  `https://picsum.photos/seed/${id}/${w}/${h}`;

const PRODUCT_THUMBS = {
  cupper: SHOP("REVO-Smart-Cup.jpg", "1746888998"),
  "face-genie": SHOP("FG_Device.jpg", "1776521918"),
  wave: SHOP("Wave_Shopify_f2cc9493-19f3-4bc4-a7de-b91972c489d2.png", "1783435939"),
  sculptor: SHOP("Sculptor_1st_Variant.webp", "1787678925"),
  "collagen-jelly": SHOP("Collagen-Jelly_a2a13f9c-46fe-4de4-bc8a-fad8ddb2ee25.jpg", "1748528264"),
};

const DELIVERABLE_LABELS = {
  "ugc-video": "UGC Video",
  "ugc-image": "UGC Image",
  "ig-reel": "Instagram Reel",
  "ig-carousel": "Instagram Carousel",
  tiktok: "TikTok Video",
  "yt-short": "YouTube Short",
};

function brief({
  id,
  uuid,
  title,
  campaign,
  productKey,
  productTitle,
  ...rest
}) {
  return {
    id,
    uuid,
    title,
    status: "Active",
    campaign,
    stakeholder: "Sofia Andersson",
    reviewer: "Kai Montero",
    artDirector: rest.artDirector || "",
    startDate: "2026-07-01",
    dueDate: "2026-08-15",
    products: [
      {
        id: productKey,
        title: productTitle,
        thumbnail: PRODUCT_THUMBS[productKey] || "",
      },
    ],
    ...rest,
  };
}

const RELIEF_BUNDLE = brief({
  id: "relief-bundle",
  uuid: "7c2a1f4e-9b31-4d80-a6e2-reliefbundle01",
  title: "Relief Bundle — Recovery Ads",
  campaign: "Ad Production Q3",
  productKey: "cupper",
  productTitle: "Relief Bundle",
  category: "ugc",
  artDirector:
    "Warm, clinical-but-human. Skin texture stays real. Marks from cupping are proof, not a flaw — hold them long enough to read.",
  platforms: ["Meta", "TikTok"],
  aspectRatios: ["9:16", "4:5"],
  deliverables: [
    { platform: "Meta", type: "ugc-video", quantity: 1 },
    { platform: "Meta", type: "ig-carousel", quantity: 1 },
    { platform: "TikTok", type: "tiktok", quantity: 1 },
  ],
  attachments: [
    { name: "Relief Bundle talking points", url: "https://docs.google.com/document/d/relief-bundle-talking-points" },
    { name: "Ad Production brand kit", url: "https://drive.google.com/relief-bundle-brand-kit" },
  ],
  creativeBrief: {
    category: "ugc",
    gender: "All",
    ageRange: "25-54",
    dos: [
      "Lead with the physical sensation, not the device name",
      "Show the four therapies in one continuous 10-minute routine",
      "Keep the cupping marks visible — they are the proof",
      "Close on 30-day risk-free, not a discount scream",
    ],
    donts: [
      "No spa-luxury gloss or stock 'zen' B-roll",
      "Do not compare to massage guns as 'better vibration'",
      "No medical claims or doctor-in-a-coat framing",
      "Avoid dark, cold color grades",
    ],
    cameraAngles: ["Eye-level front", "Close-up on tissue / marks", "Over-shoulder routine"],
    settings: ["Bright bathroom or bedroom", "Home, not studio", "Natural window light"],
    toneOfVoice: ["Educational", "Direct", "Relatable", "Unpolished"],
    demoMoments:
      "Shoulder / neck tension → cup placement → lift (not compress) → blood-return marks → 10-minute wrap.",
    scriptTips:
      "Keep it conversational. Name the feeling first ('concrete in the shoulders'), then the mechanism, then the at-home version. First line must stop the thumb.",
    scriptBody:
      "Open on the sensation. Explain that tightness is a muscle that shut off its own blood supply. Show why compression makes it worse. Demo the lift. End on four therapies, ten minutes, 30 days risk-free.",
    requestedBRoll: [
      "Cup seating on shoulder / back",
      "Mark / flush close-up after a pass",
      "Hands setting the 10-minute routine",
      "Product lineup of the four therapies",
    ],
    hooks: [
      "That concrete feeling in your shoulders isn't tightness.",
      "Athletes pay $200 a session for these circles.",
      "Massage guns compress it more. This does the opposite.",
      "The marks aren't bruises. They're blood coming back.",
      "Four therapies. Ten minutes. 30 days risk-free.",
    ],
    inspirationUrls: [
      IMG("relief-inspo-1", 540, 720),
      IMG("relief-inspo-2", 540, 720),
      PRODUCT_THUMBS.cupper,
    ],
    driveFiles: "https://drive.google.com/relief-bundle-q3",
    canvaPresentation: "https://www.canva.com/relief-bundle-deck",
    tags: ["UGC", "Recovery", "Meta", "Evergreen"],
    body:
      "Evergreen paid-social brief for Relief Bundle. Editors cut ad-ready 9:16 from this spec — one angle, one pain point, one hook per task. Admin reviews the package before launch.",
    visualDirection:
      "Natural daylight, real skin, handheld or locked-off phone. Hold product and tissue close-ups long enough to read. Warm grade, no teal-orange.",
    creativeDirection:
      "Authority without a lab coat. The creator is someone who finally found the thing that works. Mechanism first, offer last.",
  },
});

const FACE_GENIE = brief({
  id: "face-genie",
  uuid: "a18e4c90-2d77-4b11-9c04-facegenie0001",
  title: "Face Genie — Lift & Sculpt",
  campaign: "Ad Production Q3",
  productKey: "face-genie",
  productTitle: "Face Genie",
  category: "ugc",
  artDirector: "Clean vanity, glass-skin close-ups, microcurrent in frame. No filter-smooth skin.",
  platforms: ["Meta", "TikTok"],
  aspectRatios: ["9:16", "1:1"],
  deliverables: [
    { platform: "Meta", type: "ugc-video", quantity: 1 },
    { platform: "TikTok", type: "tiktok", quantity: 1 },
  ],
  attachments: [
    { name: "Face Genie routine map", url: "https://docs.google.com/document/d/face-genie-routine" },
  ],
  creativeBrief: {
    category: "ugc",
    gender: "Female",
    ageRange: "25-44",
    dos: [
      "Show jawline / cheek before the device moves",
      "Keep EMS sensation honest — tingling is fine",
      "End on visible lift, not a product dump",
    ],
    donts: [
      "No heavy beauty filters",
      "Don't promise surgical results",
      "Avoid dark, smoky glam lighting",
    ],
    cameraAngles: ["Mirror / vanity front", "Profile jawline", "Device-on-skin close-up"],
    settings: ["Bright vanity", "Bathroom window light"],
    toneOfVoice: ["Aspirational", "Honest", "Routine-first"],
    demoMoments: "Cleanse → gel → jaw / cheek passes → hold for lift → after still.",
    scriptTips: "Talk like a friend who found a device that actually stays in the routine.",
    scriptBody:
      "Start with the area that bothers you. Show the pass. Hold a still of the lift. Close on daily use, not a miracle.",
    requestedBRoll: ["Gel texture", "Jawline profile", "Device in hand at vanity"],
    hooks: [
      "I never thought a device could do this to my jawline.",
      "This is the 5-minute lift I actually kept.",
    ],
    inspirationUrls: [IMG("fg-inspo-1", 540, 720), PRODUCT_THUMBS["face-genie"]],
    driveFiles: "https://drive.google.com/face-genie-q3",
    canvaPresentation: "",
    tags: ["UGC", "Skincare", "Lift"],
    body: "Paid-social brief for Face Genie. One sculpting angle per cut. Admin fulfills review from the submitted package.",
    visualDirection: "Bright, clean, real skin texture. Microcurrent visible on the face.",
    creativeDirection: "Self-care that looks like a habit, not a campaign.",
  },
});

const WAVE = brief({
  id: "wave",
  uuid: "d4b09a22-6e18-4f3c-8aa1-wavebrief00001",
  title: "WAVE — Ultrasonic Skin",
  campaign: "Ad Production Q3",
  productKey: "wave",
  productTitle: "WAVE",
  category: "ugc",
  artDirector: "Cool-clean, water and steel, close on infusion. Still luxurious, never sterile.",
  platforms: ["Meta", "YouTube"],
  aspectRatios: ["9:16", "16:9"],
  deliverables: [
    { platform: "Meta", type: "ugc-video", quantity: 1 },
    { platform: "YouTube", type: "yt-short", quantity: 1 },
  ],
  attachments: [],
  creativeBrief: {
    category: "ugc",
    gender: "All",
    ageRange: "25-44",
    dos: ["Show water / mist on skin", "Let the device sound stay in"],
    donts: ["No spa-robot voiceover", "Don't bury the face under steam"],
    cameraAngles: ["Three-quarter vanity", "Skin macro"],
    settings: ["Modern bathroom", "Soft daylight"],
    toneOfVoice: ["Clean", "Confident", "Educational"],
    demoMoments: "Prep → ultrasonic pass → infusion → glow still.",
    scriptTips: "Mechanism in one sentence, then the feel.",
    scriptBody: "Show the pass. Name what ultrasonic is doing. End on at-home facial, not a clinic.",
    requestedBRoll: ["Mist / water on skin", "Device head close-up"],
    hooks: ["This is the facial I stopped booking."],
    inspirationUrls: [PRODUCT_THUMBS.wave, IMG("wave-inspo-1", 540, 720)],
    driveFiles: "https://drive.google.com/wave-q3",
    canvaPresentation: "",
    tags: ["UGC", "Skincare", "WAVE"],
    body: "Editor brief for WAVE paid social. Keep the device hero and the skin honest.",
    visualDirection: "Cool daylight, wet skin, product chrome readable.",
    creativeDirection: "Clinic results, home setting.",
  },
});

const SCULPTOR = brief({
  id: "sculptor",
  uuid: "e91c55ab-0f2d-4aa7-b3e8-sculptor00001",
  title: "Sculptor / Cellulite Kit",
  campaign: "Ad Production Q3",
  productKey: "sculptor",
  productTitle: "Sculptor",
  category: "ugc",
  artDirector: "Honest body, warm light, before/after frames that don't cheat the crop.",
  platforms: ["Meta", "TikTok"],
  aspectRatios: ["9:16", "4:5"],
  deliverables: [
    { platform: "Meta", type: "ugc-video", quantity: 1 },
    { platform: "Meta", type: "ugc-image", quantity: 2 },
  ],
  attachments: [
    { name: "Sculptor do / don't list", url: "https://docs.google.com/document/d/sculptor-dodont" },
  ],
  creativeBrief: {
    category: "ugc",
    gender: "Female",
    ageRange: "25-54",
    dos: ["Show the treatment area in context", "Keep suction / heat visible"],
    donts: ["No shame framing", "No extreme retouch on skin dimpling"],
    cameraAngles: ["Three-quarter body", "Treatment-head close-up"],
    settings: ["Bedroom / bathroom, home light"],
    toneOfVoice: ["Honest", "Encouraging", "Direct"],
    demoMoments: "Area → device on skin → pass → still of texture.",
    scriptTips: "Talk about dimpling and time, not 'fixing' a body.",
    scriptBody: "Name the area. Show the pass. Hold the after. Close on at-home, not a clinic.",
    requestedBRoll: ["Device on thigh / hip", "Texture still"],
    hooks: ["I stopped hiding this in photos."],
    inspirationUrls: [PRODUCT_THUMBS.sculptor, IMG("sculptor-inspo-1", 540, 720)],
    driveFiles: "https://drive.google.com/sculptor-q3",
    canvaPresentation: "",
    tags: ["UGC", "Body", "Cellulite"],
    body: "Paid-social brief for Sculptor and Cellulite Kit. One body area per cut.",
    visualDirection: "Warm, real skin, no beauty-glaze.",
    creativeDirection: "Self-trust, not transformation porn.",
  },
});

const COLLAGEN = brief({
  id: "collagen-jelly",
  uuid: "f03d88c1-71a4-4e2b-9d10-collagen00001",
  title: "Collagen Jelly — Daily Ritual",
  campaign: "Ad Production Q3",
  productKey: "collagen-jelly",
  productTitle: "Collagen Jelly",
  category: "ugc",
  artDirector: "Kitchen / vanity daylight. Packet and texture are the hero.",
  platforms: ["Meta", "TikTok"],
  aspectRatios: ["9:16", "1:1"],
  deliverables: [
    { platform: "Meta", type: "ugc-video", quantity: 1 },
    { platform: "TikTok", type: "tiktok", quantity: 1 },
  ],
  attachments: [],
  creativeBrief: {
    category: "ugc",
    gender: "All",
    ageRange: "25-44",
    dos: ["Show the jelly texture", "Keep it daily, not clinical"],
    donts: ["No lab-coat science dump", "Don't over-promise 'glass skin overnight'"],
    cameraAngles: ["Top-down packet", "Taste / texture close-up"],
    settings: ["Kitchen counter", "Morning vanity"],
    toneOfVoice: ["Casual", "Habit-first", "Warm"],
    demoMoments: "Tear → texture → eat → skin still.",
    scriptTips: "Ritual over ingredients list.",
    scriptBody: "This is the thing I actually keep doing. Show texture. Close on the habit.",
    requestedBRoll: ["Packet tear", "Jelly close-up"],
    hooks: ["The collagen I didn't forget after week one."],
    inspirationUrls: [PRODUCT_THUMBS["collagen-jelly"]],
    driveFiles: "",
    canvaPresentation: "",
    tags: ["UGC", "Ingestible"],
    body: "Editor brief for Collagen Jelly. Keep it a daily ritual, not a supplement ad.",
    visualDirection: "Soft daylight, food-texture close-ups.",
    creativeDirection: "Habit, not hype.",
  },
});

const FALLBACK = brief({
  id: "ad-production",
  uuid: "00000000-0000-4000-8000-adproduction01",
  title: "Ad Production Brief",
  campaign: "Ad Production Q3",
  productKey: "cupper",
  productTitle: "REVO",
  category: "ugc",
  artDirector: "Follow the product board style and the cut's angle / pain point.",
  platforms: ["Meta"],
  aspectRatios: ["9:16"],
  deliverables: [{ platform: "Meta", type: "ugc-video", quantity: 1 }],
  attachments: [],
  creativeBrief: {
    category: "ugc",
    gender: "All",
    ageRange: "25-44",
    dos: ["Match the task angle and pain point", "Deliver ad-ready 9:16"],
    donts: ["Don't invent claims not in the ad copy"],
    cameraAngles: ["Eye-level"],
    settings: ["Home / natural light"],
    toneOfVoice: ["Direct"],
    demoMoments: "Hook → demo → offer.",
    scriptTips: "Use the task ad copy as the spoken spine.",
    scriptBody: "",
    requestedBRoll: [],
    hooks: [],
    inspirationUrls: [],
    driveFiles: "",
    canvaPresentation: "",
    tags: ["UGC"],
    body: "Shared Ad Production brief. Fulfill the Monday cut using this spec, then send the package to Admin for review.",
    visualDirection: "",
    creativeDirection: "",
  },
});

export const ADMIN_BRIEFS_BY_PRODUCT = {
  "relief bundle": RELIEF_BUNDLE,
  "cupper mixed": RELIEF_BUNDLE,
  cupper: RELIEF_BUNDLE,
  "face genie only": FACE_GENIE,
  "face genie & collagen jelly": FACE_GENIE,
  "face genie": FACE_GENIE,
  wave: WAVE,
  sculptor: SCULPTOR,
  "cellulite kit": SCULPTOR,
  "collagen jelly": COLLAGEN,
};

export const DEFAULT_ADMIN_BRIEF = FALLBACK;

export function deliverableLabel(type) {
  return DELIVERABLE_LABELS[type] || type;
}

export { PRODUCT_THUMBS };

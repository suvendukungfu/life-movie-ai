export interface MemoryItem {
  id: string;
  title: string;
  year: string;
  location: string;
  annotation: string;
  imageUrl: string;
  aspect: string;
  rotation: number;
  tapeColor?: "neutral" | "amber" | "dark";
  tag?: string;
}

export interface DirectorStyle {
  id: string;
  name: string;
  tagline: string;
  note: string;
  fontClass: string;
  colorGrade: string;
  aspectRatio: string;
  previewImage: string;
  sampleLogline: string;
  soundtrackMood: string;
}

export interface StoryCategory {
  id: string;
  title: string;
  handwrittenSub: string;
  posterImage: string;
  colorTheme: string;
  tag: string;
  quote: string;
}

export const STORY_CATEGORIES: StoryCategory[] = [
  {
    id: "college",
    title: "COLLEGE",
    handwrittenSub: "the 2am cafeteria debates & 8am exams",
    posterImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#E26D3B",
    tag: "COMING OF AGE",
    quote: "We didn't know we were making memories, we were just trying to survive finals.",
  },
  {
    id: "love",
    title: "LOVE",
    handwrittenSub: "the train ride where everything shifted",
    posterImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#D45D55",
    tag: "ROMANTIC DRAMA",
    quote: "A look held two seconds too long on the platform.",
  },
  {
    id: "family",
    title: "FAMILY",
    handwrittenSub: "three generations around one small kitchen table",
    posterImage: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#8C6D53",
    tag: "CHRONICLE",
    quote: "The recipes nobody wrote down and the laughter that shook the ceiling.",
  },
  {
    id: "friends",
    title: "FRIENDS",
    handwrittenSub: "the ones who stayed when the world got loud",
    posterImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#C27D38",
    tag: "ENSEMBLE",
    quote: "Ten years in one photograph. None of us grew up.",
  },
  {
    id: "travel",
    title: "TRAVEL",
    handwrittenSub: "getting lost on a mountain pass with no cell signal",
    posterImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#4A6B5B",
    tag: "EXPEDITION",
    quote: "The missed bus turned out to be the entire reason we came.",
  },
  {
    id: "wedding",
    title: "WEDDING",
    handwrittenSub: "tears in the back row & confetti in the hair",
    posterImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#C59B63",
    tag: "CELEBRATION",
    quote: "One day that took twenty years of small accidents to happen.",
  },
  {
    id: "childhood",
    title: "CHILDHOOD",
    handwrittenSub: "scraped knees, tree forts & long golden sunsets",
    posterImage: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#B8860B",
    tag: "ORIGIN STORY",
    quote: "When 8pm was midnight and the backyard was the edge of the known universe.",
  },
  {
    id: "startup",
    title: "STARTUP",
    handwrittenSub: "empty whiteboard, pizza boxes & day 1 belief",
    posterImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#435560",
    tag: "ODYSSEY",
    quote: "Everyone said we were crazy. They were right, but we built it anyway.",
  },
  {
    id: "mylife",
    title: "MY LIFE",
    handwrittenSub: "all of it. the quiet Tuesday mornings to the giant leaps",
    posterImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
    colorTheme: "#A85338",
    tag: "AUTOBIOGRAPHY",
    quote: "A million quiet moments forming one unforgettable film.",
  },
];

export const DIRECTOR_STYLES: DirectorStyle[] = [
  {
    id: "bollywood",
    name: "BOLLYWOOD",
    tagline: "High emotion, sweeping strings & dramatic slowdowns",
    note: "make it dramatic.",
    fontClass: "font-display text-[#E26D3B]",
    colorGrade: "sepia(25%) saturate(140%) contrast(110%)",
    aspectRatio: "2.35 / 1",
    previewImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
    sampleLogline: "When two lives collide across four continents, destiny refuses to blink.",
    soundtrackMood: "Grand orchestral strings, dholak heartbeat, melancholic flute",
  },
  {
    id: "documentary",
    name: "DOCUMENTARY",
    tagline: "Unvarnished reality, natural audio & archival silence",
    note: "keep it honest.",
    fontClass: "font-serif-editorial text-[#383431]",
    colorGrade: "contrast(105%) saturate(85%) brightness(95%)",
    aspectRatio: "1.85 / 1",
    previewImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop",
    sampleLogline: "Raw footage from bedroom desks, voice notes, and thirty seconds before the storm.",
    soundtrackMood: "Intimate acoustic guitar, ambient rain, room tone",
  },
  {
    id: "nostalgia",
    name: "NOSTALGIA",
    tagline: "Kodachrome tones, 8mm film gate wobble & faded warmth",
    note: "make it feel like 2008.",
    fontClass: "font-hand text-[#C85A28]",
    colorGrade: "sepia(35%) hue-rotate(-10deg) contrast(115%) brightness(90%)",
    aspectRatio: "4 / 3",
    previewImage: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=1000&auto=format&fit=crop",
    sampleLogline: "Disposable camera flashes on blurry Friday evenings that defined a decade.",
    soundtrackMood: "Analog synthesizer, cassette tape hiss, indie lo-fi piano",
  },
  {
    id: "romance",
    name: "ROMANCE",
    tagline: "Soft focus highlights, poetic pacing & intimate closeups",
    note: "slow down the moment.",
    fontClass: "font-serif-editorial italic text-[#D45D55]",
    colorGrade: "saturate(110%) brightness(105%) contrast(98%)",
    aspectRatio: "2.39 / 1",
    previewImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop",
    sampleLogline: "Two people looking in opposite directions until one whispered your name.",
    soundtrackMood: "Solo cello, warm rhodes piano, gentle vinyl crackle",
  },
  {
    id: "comingofage",
    name: "COMING OF AGE",
    tagline: "Summer golden hour, restless energy & youthful uncertainty",
    note: "we were unstoppable.",
    fontClass: "font-display text-[#D9822B]",
    colorGrade: "contrast(120%) saturate(125%) hue-rotate(5deg)",
    aspectRatio: "16 / 9",
    previewImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
    sampleLogline: "The last summer before everyone packed their suitcases and moved away.",
    soundtrackMood: "Indie rock guitar strumming, foot stomps, uplifting brass",
  },
  {
    id: "minimal",
    name: "MINIMAL",
    tagline: "Stripped-back cinema, stark stillness & deliberate pause",
    note: "less is everything.",
    fontClass: "font-mono text-[#201D1C]",
    colorGrade: "grayscale(100%) contrast(130%) brightness(95%)",
    aspectRatio: "1 / 1",
    previewImage: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1000&auto=format&fit=crop",
    sampleLogline: "Between the monumental milestones lie thirty thousand quiet breaths.",
    soundtrackMood: "Single resonant piano notes, ambient wind, meditative silence",
  },
];

export const DESK_PHOTOS: MemoryItem[] = [
  {
    id: "p1",
    title: "First Day in the City",
    year: "SEPTEMBER 2019",
    location: "Platform 4, New Delhi",
    annotation: "one suitcase and no return ticket.",
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=800&auto=format&fit=crop",
    aspect: "aspect-[4/5]",
    rotation: -3.5,
    tapeColor: "neutral",
    tag: "ORIGIN",
  },
  {
    id: "p2",
    title: "Late Night at the Diner",
    year: "NOVEMBER 2021",
    location: "Chai Point, 2:40 AM",
    annotation: "the one who was always 45 mins late.",
    imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop",
    aspect: "aspect-[1/1]",
    rotation: 4.2,
    tapeColor: "amber",
    tag: "THE CREW",
  },
  {
    id: "p3",
    title: "The Road Trip That Stalled",
    year: "MAY 2022",
    location: "Shimla Bypass",
    annotation: "punctured tyre, cold tea & laughing till ribs hurt.",
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
    aspect: "aspect-[5/4]",
    rotation: -2.1,
    tapeColor: "dark",
    tag: "JOURNEY",
  },
  {
    id: "p4",
    title: "The Balcony Conversation",
    year: "OCTOBER 2023",
    location: "6th Floor Balcony",
    annotation: "we had no idea this would matter so much.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    aspect: "aspect-[3/4]",
    rotation: 2.8,
    tapeColor: "amber",
    tag: "TURNING POINT",
  },
  {
    id: "p5",
    title: "The Graduation Rooftop",
    year: "JUNE 2024",
    location: "Old Campus Roof",
    annotation: "summer 2024. none of us wanted to leave.",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop",
    aspect: "aspect-[4/3]",
    rotation: -4.8,
    tapeColor: "neutral",
    tag: "FINALE",
  },
];

export const TIMELINE_CHAPTERS = [
  {
    year: "2019",
    chapter: "CHAPTER 01",
    title: "THE BEGINNING",
    handwritten: "a blank page & a train ticket",
    description: "An empty room, an unpacked cardboard box, and the nervous realization that your youth had officially commenced.",
    photo: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=800&auto=format&fit=crop",
    duration: "Scene length: 1m 45s",
    bpm: "64 BPM (Adagio)",
  },
  {
    year: "2020",
    chapter: "CHAPTER 02",
    title: "THE ENSEMBLE",
    handwritten: "strangers who became everything",
    description: "The sudden influx of characters. Shared playlists, borrowed bikes, and phone calls lasting until the sun hit the curtains.",
    photo: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop",
    duration: "Scene length: 3m 12s",
    bpm: "92 BPM (Andante)",
  },
  {
    year: "2022",
    chapter: "CHAPTER 03",
    title: "EVERYTHING CHANGED",
    handwritten: "the turning point nobody saw coming",
    description: "The unexpected detour. A job rejected, a flight missed, a secret confessed in the middle of a monsoon shower.",
    photo: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    duration: "Scene length: 4m 05s",
    bpm: "110 BPM (Crescendo)",
  },
  {
    year: "2024",
    chapter: "CHAPTER 04",
    title: "THE CROSSROADS",
    handwritten: "learning how to say both hello and goodbye",
    description: "The quiet triumph of becoming the person you needed when you were eighteen. Packing the bags once again.",
    photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    duration: "Scene length: 2m 50s",
    bpm: "78 BPM (Sostenuto)",
  },
  {
    year: "2026",
    chapter: "CHAPTER 05",
    title: "THE FILM IS BORN",
    handwritten: "your life. on the big screen.",
    description: "All the disparate photos, voice notes, scribbled tickets, and silent tears woven into an archival cinematic masterwork.",
    photo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
    duration: "Feature cut: 24 mins",
    bpm: "Grand Finale",
  },
];

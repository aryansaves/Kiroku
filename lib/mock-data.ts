import type { Log, PublicUser } from "@/lib/types";

export const demoUser: PublicUser = {
  _id: "demo-user",
  username: "demo",
  displayName: "Mira",
  bio: "logged from telegram. shown here without ceremony.",
  links: [
    { label: "letterboxd", url: "https://letterboxd.com" },
    { label: "anilist", url: "https://anilist.co" },
    { label: "reading list", url: "https://openlibrary.org" }
  ],
  avatarUrl: null,
  platforms: {
    mal: { linked: false },
    anilist: { linked: true }
  },
  theme: {
    colorScheme: {
      background: "#fff7d6",
      text: "#121212",
      accent: "#ff4b1f",
      card: "#fff7d6"
    },
    font: "var(--font-serif)",
    layout: "grid",
    customCss: "",
    stickers: [
      {
        id: "star-note",
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Cpath fill='%23ff4b1f' d='M16 16h16v16H16zM32 32h16v16H32zM48 48h16v16H48zM64 64h16v16H64zM64 16h16v16H64zM48 32h16v16H48zM32 48h16v16H32zM16 64h16v16H16z'/%3E%3C/svg%3E",
        x: 28,
        y: 102,
        size: 54,
        rotation: 0
      }
    ],
    nowPlaying: {
      url: "https://open.spotify.com",
      source: "spotify"
    },
    guestbookEnabled: true
  },
  createdAt: "2026-01-12T12:00:00.000Z"
};

export const demoLogs: Log[] = [
  {
    _id: "vinland",
    mediaType: "anime",
    status: "completed",
    rating: 9,
    notes: "Brutal ending, but somehow gentler than expected.",
    progress: { episode: null, chapter: null, page: null, percentage: null },
    title: "Vinland Saga Season 2",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx136430-2hPvh5c4q0wS.jpg",
    metadata: {
      studio: "MAPPA",
      year: 2023,
      episodes: 24,
      director: null,
      runtime: null,
      author: null
    },
    createdAt: "2026-06-11T19:10:00.000Z",
    updatedAt: "2026-06-11T19:10:00.000Z"
  },
  {
    _id: "dune",
    mediaType: "book",
    status: "watching",
    rating: null,
    notes: "Political ecology with a knife under the table.",
    progress: { episode: null, chapter: null, page: 312, percentage: 58 },
    title: "Dune",
    coverImage:
      "https://covers.openlibrary.org/b/id/12645131-L.jpg",
    metadata: {
      studio: null,
      year: 1965,
      episodes: null,
      director: null,
      runtime: null,
      author: "Frank Herbert"
    },
    createdAt: "2026-06-09T11:20:00.000Z",
    updatedAt: "2026-06-09T11:20:00.000Z"
  },
  {
    _id: "perfect-days",
    mediaType: "movie",
    status: "completed",
    rating: 8.5,
    notes: "A routine that keeps unfolding new rooms.",
    progress: { episode: null, chapter: null, page: null, percentage: null },
    title: "Perfect Days",
    coverImage:
      "https://image.tmdb.org/t/p/w500/1lQftpEARVVB9op4TaYiIbactzG.jpg",
    metadata: {
      studio: null,
      year: 2023,
      episodes: null,
      director: "Wim Wenders",
      runtime: 124,
      author: null
    },
    createdAt: "2026-06-03T21:45:00.000Z",
    updatedAt: "2026-06-03T21:45:00.000Z"
  },
  {
    _id: "hollow-knight",
    mediaType: "game",
    status: "planned",
    rating: null,
    notes: "Saved for a long rainy weekend.",
    progress: { episode: null, chapter: null, page: null, percentage: null },
    title: "Hollow Knight",
    coverImage: null,
    metadata: {
      studio: null,
      year: 2017,
      episodes: null,
      director: null,
      runtime: null,
      author: null
    },
    createdAt: "2026-05-28T10:20:00.000Z",
    updatedAt: "2026-05-28T10:20:00.000Z"
  }
];

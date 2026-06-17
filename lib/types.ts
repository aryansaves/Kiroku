export type MediaType =
  | "anime"
  | "movie"
  | "series"
  | "book"
  | "manga"
  | "comic";

export type LogStatus =
  | "watching"
  | "completed"
  | "dropped"
  | "planned"
  | "rewatching";

export type JournalLayout = "grid" | "feed" | "masonry";

export type Theme = {
  colorScheme: {
    background: string;
    text: string;
    accent: string;
    card: string;
  };
  font: string;
  layout: JournalLayout;
  customCss: string;
  stickers: Sticker[];
  nowPlaying: {
    url: string | null;
    source: "spotify" | "soundcloud" | "youtube" | null;
  };
  guestbookEnabled: boolean;
};

export type Sticker = {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
};

export type PublicUser = {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  links: Array<{ label: string; url: string }>;
  avatarUrl: string | null;
  platforms?: {
    mal?: { linked: boolean };
    anilist?: { linked: boolean };
  };
  theme: Theme;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type Log = {
  _id: string;
  mediaType: MediaType;
  status: LogStatus;
  rating: number | null;
  notes: string | null;
  progress: {
    episode: number | null;
    chapter: number | null;
    page: number | null;
    percentage: number | null;
  };
  title: string;
  coverImage: string | null;
  externalIds?: {
    anilistId: number | null;
    malId: number | null;
    tmdbId: number | null;
  };
  metadata: {
    studio: string | null;
    year: number | null;
    episodes: number | null;
    director: string | null;
    runtime: number | null;
    author: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type PaginatedLogs = {
  logs: Log[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type GuestbookEntry = {
  _id: string;
  visitorName: string;
  message: string;
  createdAt: string;
};

export type GuestbookEntries = {
  entries: GuestbookEntry[];
};

export type ProfileUpdate = {
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  links: Array<{ label: string; url: string }>;
  nowPlaying?: Theme["nowPlaying"];
};

export type ThemeUpdate = Pick<
  Theme,
  "colorScheme" | "font" | "layout" | "customCss" | "guestbookEnabled"
>;

export type ChatParsed = {
  mediaType: MediaType;
  title: string | null;
  action: "log" | "update" | "query";
  status: LogStatus;
  progress: {
    episode: number | null;
    chapter: number | null;
    page: number | null;
    percentage: number | null;
  };
  rating: number | null;
  notes: string | null;
  confidence: "high" | "low";
};

export type ChatSearchItem = {
  canonicalTitle: string;
  coverImage: string | null;
  mediaType: string;
  year: number | null;
  externalIds: {
    anilistId: number | null;
    malId: number | null;
    tmdbId: number | null;
  };
};

export type ChatLogPayload = {
  mediaType: MediaType;
  status: LogStatus;
  title: string;
  coverImage: string | null;
  rating: number | null;
  notes: string | null;
  progress: {
    episode: number | null;
    chapter: number | null;
    page: number | null;
    percentage: number | null;
  };
  externalIds: {
    anilistId: number | null;
    malId: number | null;
    tmdbId: number | null;
  };
  forceNew?: boolean;
};

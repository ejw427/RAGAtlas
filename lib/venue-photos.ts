/** Daytime Circuit of the Americas stills used across landing + session chrome. */
export const VENUE_PHOTOS = {
  hero: "/cota-hero-day.jpg",
  tower: "/cota-tower-day.jpg",
  track: "/cota-track-day.jpg",
  mainStraight: "/cota-main-straight-day.jpg",
  esses: "/cota-esses-day.jpg",
  pitlane: "/cota-pitlane-day.jpg",
  garage: "/cota-garage-day.jpg",
} as const;

export type VenuePhotoId = keyof typeof VENUE_PHOTOS;

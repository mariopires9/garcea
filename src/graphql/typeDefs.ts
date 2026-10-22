export const typeDefs = /* GraphQL */ `
  enum GalleryItemType {
    PHOTO
    VIDEO
  }

  enum EventType {
    FOLCLORE
    OUTROS
  }

  enum OfficialContactType {
    EMAIL
    PHONE
    FACEBOOK
  }

  enum SocialPlatform {
    FACEBOOK
    INSTAGRAM
    YOUTUBE
    TWITTER
    WHATSAPP
    SPOTIFY
    OTHER
  }

  enum MoveDirection {
    UP
    DOWN
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Event {
    id: ID!
    title: String!
    description: String!
    date: String!
    location: String!
    posterUrl: String
    type: EventType!
    createdAt: String!
    createdBy: User!
    galleryItems: [GalleryItem!]!
  }

  type GalleryItem {
    id: ID!
    type: GalleryItemType!
    url: String!
    thumbnailUrl: String
    caption: String
    createdAt: String!
    event: Event
    uploadedBy: User!
  }

  type HomeSection {
    id: ID!
    title: String!
    description: String!
    order: Int!
    createdAt: String!
    updatedAt: String!
    featuredPhotos: [GalleryItem!]!
  }

  type HistorialSection {
    description: String!
    updatedAt: String!
  }

  type OfficialContact {
    id: ID!
    type: OfficialContactType!
    label: String
    value: String!
    createdAt: String!
  }

  type SocialLink {
    id: ID!
    platform: SocialPlatform!
    url: String!
    order: Int!
    createdAt: String!
  }

  input EventInput {
    title: String!
    description: String!
    date: String!
    location: String!
    posterUrl: String
    type: EventType!
  }

  input GalleryItemInput {
    type: GalleryItemType!
    url: String!
    thumbnailUrl: String
    caption: String
    eventId: ID
  }

  input GalleryItemUpdateInput {
    caption: String
    thumbnailUrl: String
  }

  input HomeSectionInput {
    title: String!
    description: String!
  }

  input OfficialContactInput {
    type: OfficialContactType!
    label: String
    value: String!
  }

  input SocialLinkInput {
    platform: SocialPlatform!
    url: String!
  }

  type Query {
    events: [Event!]!
    event(id: ID!): Event
    galleryItems(eventId: ID, year: Int): [GalleryItem!]!
    galleryItem(id: ID!): GalleryItem
    homeSections: [HomeSection!]!
    homeSection(id: ID!): HomeSection
    historialSection: HistorialSection
    officialContacts: [OfficialContact!]!
    socialLinks: [SocialLink!]!
  }

  type Mutation {
    createEvent(input: EventInput!): Event!
    updateEvent(id: ID!, input: EventInput!): Event!
    deleteEvent(id: ID!): Boolean!

    createGalleryItem(input: GalleryItemInput!): GalleryItem!
    updateGalleryItem(id: ID!, input: GalleryItemUpdateInput!): GalleryItem!
    deleteGalleryItem(id: ID!): Boolean!
    deleteGalleryItems(ids: [ID!]!): Int!

    createHomeSection(input: HomeSectionInput!): HomeSection!
    updateHomeSection(id: ID!, input: HomeSectionInput!): HomeSection!
    deleteHomeSection(id: ID!): Boolean!
    moveHomeSection(id: ID!, direction: MoveDirection!): Boolean!
    featureHomeSectionPhoto(homeSectionId: ID!, galleryItemId: ID!): GalleryItem!
    unfeatureHomeSectionPhoto(homeSectionId: ID!, galleryItemId: ID!): Boolean!

    updateHistorialSection(description: String!): HistorialSection!

    createOfficialContact(input: OfficialContactInput!): OfficialContact!
    deleteOfficialContact(id: ID!): Boolean!

    createSocialLink(input: SocialLinkInput!): SocialLink!
    deleteSocialLink(id: ID!): Boolean!
    moveSocialLink(id: ID!, direction: MoveDirection!): Boolean!
  }
`;

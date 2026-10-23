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
    "Only returned to logged-in admins."
    email: String!
    isOwner: Boolean!
    createdAt: String!
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
    order: Int!
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
    eventId: ID
  }

  "Omitted fields are left unchanged; eventId: null removes the event."
  input GalleryItemUpdateInput {
    url: String
    thumbnailUrl: String
    eventId: ID
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

  input UserInput {
    name: String!
    email: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  type Query {
    events: [Event!]!
    event(id: ID!): Event
    "Newest first. Without \`limit\` returns every matching item."
    galleryItems(eventId: ID, year: Int, limit: Int): [GalleryItem!]!
    galleryItemsCount(eventId: ID, year: Int): Int!
    galleryItem(id: ID!): GalleryItem
    homeSections: [HomeSection!]!
    homeSection(id: ID!): HomeSection
    historialSection: HistorialSection
    officialContacts: [OfficialContact!]!
    officialContact(id: ID!): OfficialContact
    socialLinks: [SocialLink!]!
    socialLink(id: ID!): SocialLink
    users: [User!]!
    user(id: ID!): User
    me: User!
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
    updateOfficialContact(id: ID!, input: OfficialContactInput!): OfficialContact!
    deleteOfficialContact(id: ID!): Boolean!
    moveOfficialContact(id: ID!, direction: MoveDirection!): Boolean!

    createSocialLink(input: SocialLinkInput!): SocialLink!
    updateSocialLink(id: ID!, input: SocialLinkInput!): SocialLink!
    deleteSocialLink(id: ID!): Boolean!
    moveSocialLink(id: ID!, direction: MoveDirection!): Boolean!

    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    changePassword(id: ID!, currentPassword: String, newPassword: String!): Boolean!
    deleteUser(id: ID!): Boolean!
  }
`;

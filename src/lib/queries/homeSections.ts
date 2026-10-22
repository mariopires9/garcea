export const HOME_SECTIONS_QUERY = /* GraphQL */ `
  query HomeSections {
    homeSections {
      id
      title
      description
      order
      featuredPhotos {
        id
        type
        url
        thumbnailUrl
      }
    }
  }
`;

export const HOME_SECTION_QUERY = /* GraphQL */ `
  query HomeSection($id: ID!) {
    homeSection(id: $id) {
      id
      title
      description
      featuredPhotos {
        id
        type
        url
        thumbnailUrl
      }
    }
  }
`;

export const GALLERY_ITEMS_FOR_PICKER_QUERY = /* GraphQL */ `
  query GalleryItemsForPicker {
    galleryItems {
      id
      type
      url
      thumbnailUrl
    }
  }
`;

export const CREATE_HOME_SECTION_MUTATION = /* GraphQL */ `
  mutation CreateHomeSection($input: HomeSectionInput!) {
    createHomeSection(input: $input) {
      id
    }
  }
`;

export const UPDATE_HOME_SECTION_MUTATION = /* GraphQL */ `
  mutation UpdateHomeSection($id: ID!, $input: HomeSectionInput!) {
    updateHomeSection(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_HOME_SECTION_MUTATION = /* GraphQL */ `
  mutation DeleteHomeSection($id: ID!) {
    deleteHomeSection(id: $id)
  }
`;

export const MOVE_HOME_SECTION_MUTATION = /* GraphQL */ `
  mutation MoveHomeSection($id: ID!, $direction: MoveDirection!) {
    moveHomeSection(id: $id, direction: $direction)
  }
`;

export const FEATURE_HOME_SECTION_PHOTO_MUTATION = /* GraphQL */ `
  mutation FeatureHomeSectionPhoto($homeSectionId: ID!, $galleryItemId: ID!) {
    featureHomeSectionPhoto(homeSectionId: $homeSectionId, galleryItemId: $galleryItemId) {
      id
    }
  }
`;

export const UNFEATURE_HOME_SECTION_PHOTO_MUTATION = /* GraphQL */ `
  mutation UnfeatureHomeSectionPhoto($homeSectionId: ID!, $galleryItemId: ID!) {
    unfeatureHomeSectionPhoto(homeSectionId: $homeSectionId, galleryItemId: $galleryItemId)
  }
`;

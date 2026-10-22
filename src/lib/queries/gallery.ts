export const GALLERY_ITEMS_QUERY = /* GraphQL */ `
  query GalleryItems($eventId: ID, $year: Int, $limit: Int) {
    galleryItemsCount(eventId: $eventId, year: $year)
    galleryItems(eventId: $eventId, year: $year, limit: $limit) {
      id
      type
      url
      thumbnailUrl
      event {
        id
        title
      }
    }
  }
`;

export const GALLERY_ITEM_QUERY = /* GraphQL */ `
  query GalleryItem($id: ID!) {
    galleryItem(id: $id) {
      id
      type
      url
      thumbnailUrl
      event {
        id
        title
      }
    }
  }
`;

export const CREATE_GALLERY_ITEM_MUTATION = /* GraphQL */ `
  mutation CreateGalleryItem($input: GalleryItemInput!) {
    createGalleryItem(input: $input) {
      id
    }
  }
`;

export const UPDATE_GALLERY_ITEM_MUTATION = /* GraphQL */ `
  mutation UpdateGalleryItem($id: ID!, $input: GalleryItemUpdateInput!) {
    updateGalleryItem(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_GALLERY_ITEM_MUTATION = /* GraphQL */ `
  mutation DeleteGalleryItem($id: ID!) {
    deleteGalleryItem(id: $id)
  }
`;

export const DELETE_GALLERY_ITEMS_MUTATION = /* GraphQL */ `
  mutation DeleteGalleryItems($ids: [ID!]!) {
    deleteGalleryItems(ids: $ids)
  }
`;

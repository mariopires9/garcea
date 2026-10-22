export const EVENTS_QUERY = /* GraphQL */ `
  query Events {
    events {
      id
      title
      description
      date
      location
      posterUrl
      type
    }
  }
`;

export const EVENT_OPTIONS_QUERY = /* GraphQL */ `
  query EventOptions {
    events {
      id
      title
      date
    }
  }
`;

export const EVENT_QUERY = /* GraphQL */ `
  query Event($id: ID!) {
    event(id: $id) {
      id
      title
      description
      date
      location
      posterUrl
      type
      createdBy {
        name
      }
      galleryItems {
        id
        type
        url
        thumbnailUrl
      }
    }
  }
`;

export const CREATE_EVENT_MUTATION = /* GraphQL */ `
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      id
    }
  }
`;

export const UPDATE_EVENT_MUTATION = /* GraphQL */ `
  mutation UpdateEvent($id: ID!, $input: EventInput!) {
    updateEvent(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_EVENT_MUTATION = /* GraphQL */ `
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

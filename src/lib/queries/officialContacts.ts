export const OFFICIAL_CONTACTS_QUERY = /* GraphQL */ `
  query OfficialContacts {
    officialContacts {
      id
      type
      label
      value
    }
  }
`;

export const OFFICIAL_CONTACT_QUERY = /* GraphQL */ `
  query OfficialContact($id: ID!) {
    officialContact(id: $id) {
      id
      type
      label
      value
    }
  }
`;

export const UPDATE_OFFICIAL_CONTACT_MUTATION = /* GraphQL */ `
  mutation UpdateOfficialContact($id: ID!, $input: OfficialContactInput!) {
    updateOfficialContact(id: $id, input: $input) {
      id
    }
  }
`;

export const CREATE_OFFICIAL_CONTACT_MUTATION = /* GraphQL */ `
  mutation CreateOfficialContact($input: OfficialContactInput!) {
    createOfficialContact(input: $input) {
      id
    }
  }
`;

export const MOVE_OFFICIAL_CONTACT_MUTATION = /* GraphQL */ `
  mutation MoveOfficialContact($id: ID!, $direction: MoveDirection!) {
    moveOfficialContact(id: $id, direction: $direction)
  }
`;

export const DELETE_OFFICIAL_CONTACT_MUTATION = /* GraphQL */ `
  mutation DeleteOfficialContact($id: ID!) {
    deleteOfficialContact(id: $id)
  }
`;

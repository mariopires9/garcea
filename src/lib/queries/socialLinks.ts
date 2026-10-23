export const SOCIAL_LINKS_QUERY = /* GraphQL */ `
  query SocialLinks {
    socialLinks {
      id
      platform
      url
    }
  }
`;

export const SOCIAL_LINK_QUERY = /* GraphQL */ `
  query SocialLink($id: ID!) {
    socialLink(id: $id) {
      id
      platform
      url
    }
  }
`;

export const UPDATE_SOCIAL_LINK_MUTATION = /* GraphQL */ `
  mutation UpdateSocialLink($id: ID!, $input: SocialLinkInput!) {
    updateSocialLink(id: $id, input: $input) {
      id
    }
  }
`;

export const CREATE_SOCIAL_LINK_MUTATION = /* GraphQL */ `
  mutation CreateSocialLink($input: SocialLinkInput!) {
    createSocialLink(input: $input) {
      id
    }
  }
`;

export const DELETE_SOCIAL_LINK_MUTATION = /* GraphQL */ `
  mutation DeleteSocialLink($id: ID!) {
    deleteSocialLink(id: $id)
  }
`;

export const MOVE_SOCIAL_LINK_MUTATION = /* GraphQL */ `
  mutation MoveSocialLink($id: ID!, $direction: MoveDirection!) {
    moveSocialLink(id: $id, direction: $direction)
  }
`;

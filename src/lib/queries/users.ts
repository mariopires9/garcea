const USER_FIELDS = /* GraphQL */ `
  id
  name
  email
  isOwner
  createdAt
`;

export const ACCOUNTS_QUERY = /* GraphQL */ `
  query Accounts {
    me {
      ${USER_FIELDS}
    }
    users {
      ${USER_FIELDS}
    }
  }
`;

export const ACCOUNT_QUERY = /* GraphQL */ `
  query Account($id: ID!) {
    me {
      ${USER_FIELDS}
    }
    user(id: $id) {
      ${USER_FIELDS}
    }
  }
`;

export const CREATE_USER_MUTATION = /* GraphQL */ `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
    }
  }
`;

export const UPDATE_USER_MUTATION = /* GraphQL */ `
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = /* GraphQL */ `
  mutation ChangePassword($id: ID!, $currentPassword: String, $newPassword: String!) {
    changePassword(id: $id, currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export const DELETE_USER_MUTATION = /* GraphQL */ `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export type Account = {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  createdAt: string;
};

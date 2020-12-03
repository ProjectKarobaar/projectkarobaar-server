export const registerMutation = `
mutation Register($options: UsernamePasswordInput!){
  register(options:$options) {
    errors {
      field
      message
    }
    user {
      id
      username
    }
  }
}
`;
export const loginMutation = `
mutation Login($usernameOrEmail: String!, $password: String!){
  login (usernameOrEmail: $usernameOrEmail, password: $password){
    errors{
      field
      message
    }
    user{
      id
      username
    }
  }
}
`;
export const meQuery = `
query MeQuery {
  me{
    id
    username
  }
}
`;

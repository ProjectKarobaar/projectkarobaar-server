import { buildSchema } from 'type-graphql';
import { UserResolver } from '../../resolvers/user';
import { HelloResolver } from '../../resolvers/hello';
import { GraphQLSchema } from 'graphql';
export const createSchema = (): Promise<GraphQLSchema> =>
    buildSchema({
        resolvers: [UserResolver, HelloResolver],
        validate: false,
    });

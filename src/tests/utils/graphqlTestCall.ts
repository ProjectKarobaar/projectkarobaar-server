import { ExecutionResult, graphql, GraphQLSchema } from 'graphql';
import { createSchema } from './createSchema';
import { Maybe } from 'graphql/jsutils/Maybe';

interface Options {
    source: string;
    variableValues?: Maybe<{
        [key: string]: any;
    }>;
    userId?: number;
}

let schema: GraphQLSchema;

export const graphqlTestCall = async ({ source, variableValues, userId }: Options): Promise<ExecutionResult> => {
    if (!schema) {
        schema = await createSchema();
    }
    return graphql({
        schema,
        source,
        variableValues,
        contextValue: {
            req: {
                session: {
                    userId,
                },
            },
        },
    });
};

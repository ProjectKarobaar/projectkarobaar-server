import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import { User } from './entities/User';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { __prod__ } from './constants';
import { UserResolver } from './resolvers/user';
import { HelloResolver } from './resolvers/hello';
const main = async () => {
    await createConnection({
        type: 'postgres',
        database: 'deardiary',
        username: 'pruthvi',
        logging: true,
        synchronize: true,
        entities: [User],
    });
    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years for dev
                httpOnly: true,
                secure: __prod__, // cookie works in https?
                sameSite: 'lax', // csrf settings
            },
            saveUninitialized: false,
            secret: 'verysecret', // HIDE IN PROD!!
            resave: false,
        }),
    );
    const apoloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
    });

    apoloServer.applyMiddleware({ app });
    const port = process.env.PORT || '4000';
    app.listen(port, () => {
        console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    });
};

main();

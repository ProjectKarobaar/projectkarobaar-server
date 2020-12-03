import { Connection } from 'typeorm';
import faker from 'faker';
import { createTestConnection } from './utils/createTestConnection';
import { loginMutation, meQuery, registerMutation } from './mutations/authMutations';
import { graphqlTestCall } from './utils/graphqlTestCall';
import { User } from '../entities/User';

let conn: Connection;

beforeAll(async () => {
    conn = await createTestConnection(false); /* Enter the Custom conn command here */
});

afterAll(async () => {
    await conn.close();
});

const user = {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
};

describe('Auth Suite', () => {
    it('Create User', async () => {
        const response = await graphqlTestCall({
            source: registerMutation,
            variableValues: {
                options: user,
            },
        });
        expect(response).toMatchObject({
            data: {
                register: {
                    errors: null,
                    user: {
                        username: user.username,
                    },
                },
            },
        });

        const dbUser = await User.findOne({ where: { email: user.email } });
        expect(dbUser).toBeDefined();
        expect(dbUser?.email).toBe(user.email);
    });
    it('Login User', async () => {
        const loginPayload = {
            usernameOrEmail: user.email,
            password: user.password,
        };
        const response = await graphqlTestCall({
            source: loginMutation,
            variableValues: loginPayload,
        });
        expect(response).toMatchObject({
            data: {
                login: {
                    errors: null,
                    user: {
                        username: user.username,
                    },
                },
            },
        });
    });
    it('Check Valid Credentials', async () => {
        const fakeuser = {
            username: 'fakeuser12',
            email: 'fakeuserpass',
            password: 'fakefake',
        };
        const response = await graphqlTestCall({
            source: loginMutation,
            variableValues: {
                usernameOrEmail: fakeuser.email,
                password: fakeuser.password,
            },
        });
        expect(response).toMatchObject({
            data: {
                login: {
                    errors: [
                        {
                            field: 'login',
                            message: 'invalid credentials',
                        },
                    ],
                    user: null,
                },
            },
        });
    });

    it('Check Me route', async () => {
        const dbUser = await User.findOne({ where: { id: 1 } });
        const response = await graphqlTestCall({
            source: meQuery,
            userId: 1,
        });
        expect(response).toMatchObject({
            data: {
                me: {
                    id: 1,
                    username: dbUser?.username,
                },
            },
        });
        const invalidresponse = await graphqlTestCall({
            source: meQuery,
        });
        expect(invalidresponse).toMatchObject({
            data: {
                me: null,
            },
        });
    });
});

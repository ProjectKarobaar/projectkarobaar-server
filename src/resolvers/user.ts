import { User } from '../entities/User';
import { Resolver, Mutation, Arg, Ctx, Query } from 'type-graphql';
import { UsernamePasswordInput, UserResponse, MyContext } from '../types';
import argon2 from 'argon2';
import { getConnection } from 'typeorm';
@Resolver()
export class UserResolver {
    // @Mutation(() => UserResponse)
    // async changePassword(
    //   @Arg("token") token: string,
    //   @Arg("newPassword") newPassword: string,
    //   @Ctx() { redis, req }: MyContext
    // ): Promise<UserResponse> {
    //   if (newPassword.length <= 2) {
    //     return {
    //       errors: [
    //         {
    //           field: "newPassword",
    //           message: "password length must be more than 2",
    //         },
    //       ],
    //     };
    //   }
    //   const key = FORGET_PASSWORD_PREFIX + token;
    //   const userId = await redis.get(key);
    //   if (!userId) {
    //     return {
    //       errors: [
    //         {
    //           field: "token",
    //           message: "token expired",
    //         },
    //       ],
    //     };
    //   }
    //   const userIdNumber = parseInt(userId);
    //   const user = await User.findOne(parseInt(userId));

    //   if (!user) {
    //     return {
    //       errors: [
    //         {
    //           field: "token",
    //           message: "user no longer exists",
    //         },
    //       ],
    //     };
    //   }
    //   await User.update(
    //     { id: userIdNumber },
    //     {
    //       password: await argon2.hash(newPassword),
    //     }
    //   );
    //   await redis.del(key);
    //   // log in user after change password
    //   req.session.userId = user.id;

    //   return { user };
    // }

    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null;
        }
        return User.findOne(req.session.userId);
    }

    @Mutation(() => UserResponse)
    async register(@Arg('options') options: UsernamePasswordInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'length must be more than 2',
                    },
                ],
            };
        }
        if (options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password length must be more than 2',
                    },
                ],
            };
        }
        const hashedPassword = await argon2.hash(options.password);
        let user; // Use Try Catch Here
        try {
            // Using Query Builder to build custom query instead basicall its makeup is:
            // INSERT INTO "user"("createdAt", "updatedAt", "username", "email", "password") VALUES (DEFAULT, DEFAULT, $1, $2, $3) RETURNING *
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                })
                .returning('*')
                .execute();
            user = result.raw[0];
            // console.log(user);
        } catch (error) {
            console.log(error.code);
            if (error.code == '23505') {
                return {
                    errors: [
                        {
                            field: 'registration',
                            message: 'Username and/or email is already taken',
                        },
                    ],
                };
            }
        }
        //Auto-Login upon Refresh and set cookie
        // Remove if you dont want user to login as soon as user logs in
        req.session.userId = user.id;
        return {
            user,
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext,
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes('@')
                ? { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail } },
        );
        if (!user) {
            return {
                errors: [
                    {
                        field: 'login',
                        message: 'invalid credentials',
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: 'login',
                        message: 'invalid credentials',
                    },
                ],
            };
        }
        // Store User id in session (sent as Cookie and stored in redis... can store entire user obj if props are not changing)
        req.session.userId = user.id;
        return {
            user,
        };
    }
}

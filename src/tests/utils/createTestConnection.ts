import { createConnection, Connection } from 'typeorm';
import { User } from '../../entities/User';
export const createTestConnection = async (drop: boolean): Promise<Connection> =>
    await createConnection({
        type: 'postgres',
        database: 'projectkarobaar_test',
        username: 'postgres',
        password: 'postgres',
        logging: false,
        synchronize: drop,
        entities: [User],
        dropSchema: drop,
    });

export const SERVER_PORT = process.env.PORT || 3000;
export const __prod__ = process.env.NODE_ENV === 'production';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/karobaar';

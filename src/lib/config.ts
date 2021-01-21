export const APP_NODE_ENV: 'production' | 'development' =
  (process.env.NODE_ENV as 'production' | 'development') || 'development';
export const APP_PORT: number = +process.env.PORT! || 4000;
export const APP_GRAPHQL_PATH: string = process.env.APP_GRAPHQL_PATH || '/';
export const APP_HASH_SALT: number = +process.env.APP_HASH_SALT! || 8;
export const APP_SESSION_NAME: string = process.env.APP_SESSION_NAME || 'bk';
export const APP_SESSION_SECRET: string =
  process.env.APP_SESSION_SECRET || 'catbook';
export const APP_SESSION_MAX_AGE: number =
  +process.env.APP_SESSION_MAX_AGE! || 604800000;
export const APP_CLIENT_URL: string =
  process.env.APP_CLIENT_URL || 'http://localhost:3000';

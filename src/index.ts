import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import {
  APP_CLIENT_URL,
  APP_GRAPHQL_PATH,
  APP_NODE_ENV,
  APP_PORT,
  APP_SESSION_MAX_AGE,
  APP_SESSION_NAME,
  APP_SESSION_SECRET,
} from './lib/config';
import resolvers from './resolvers';
import { authChecker } from './lib/authChecker';
import { IContext } from './interfaces/context';
import { User } from './entity';

(async () => {
  await createConnection();

  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: APP_CLIENT_URL,
      credentials: true,
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: APP_NODE_ENV === 'production' ? undefined : false,
    })
  );

  app.use(
    session({
      secret: APP_SESSION_SECRET,
      name: APP_SESSION_NAME,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: APP_NODE_ENV === 'production' ? true : undefined,
        maxAge: APP_SESSION_MAX_AGE,
      },
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers,
      authChecker,
    }),
    context: async ({ req, res }: IContext) => {
      if (req.session.user) {
        const user = await User.findOne({
          where: { username: req.session.user.username },
        });

        req.session.diffUserVersion =
          user && user.version !== req.session.user.version;
      }

      return { req, res };
    },
  });

  server.applyMiddleware({ app, cors: false, path: APP_GRAPHQL_PATH });

  app.listen(APP_PORT, () => console.log('Server listening on port', APP_PORT));
})();

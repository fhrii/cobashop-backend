import { Request, Response } from 'express';

interface UserSession {
  username: string;
  role: string;
  blocked: boolean;
  version: number;
}

export interface IContext {
  req: Request & {
    session: { user?: UserSession; diffUserVersion?: boolean };
  };
  res: Response;
}

import { AuthChecker } from 'type-graphql';
import { IContext } from '../interfaces/context';

export const authChecker: AuthChecker<IContext> = ({ context }, roles) => {
  const { req } = context;

  if (req.session.user && req.session.diffUserVersion) return false;
  else if (
    req.session.user &&
    req.session.user.blocked === false &&
    roles.length > 0
  ) {
    if (roles.includes(req.session.user.role)) return true;
    else return false;
  } else if (req.session.user) return true;

  return false;
};

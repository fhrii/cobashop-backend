import { Log } from '../entity';
import { LogType } from '../enum';
import { createNanoId } from './nanoid';

export const createLog = (type: LogType, message: string) => {
  const log = new Log();

  log.id = createNanoId();
  log.type = type;
  log.message = message;

  log.save();
};

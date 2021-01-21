import { compare, genSalt, hash } from 'bcrypt';
import { APP_HASH_SALT } from '../lib/config';

let salt: string = '';

function getSalt() {
  return salt;
}

async function addSalt() {
  salt = await genSalt(APP_HASH_SALT);
  return salt;
}

export const hashPassword = async (password: string) => {
  const generatedSalt = getSalt() || (await addSalt());
  return hash(password, generatedSalt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => compare(password, hashedPassword);

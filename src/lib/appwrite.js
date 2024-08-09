import { Client, Databases,ID ,Account} from 'appwrite';

const client = new Client();
const DB_ID = '66b5e1cd000838ede3d0';
const COLLECTION_ID = '66b5f628000fb2589afd';

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('66b5e07f003d427d6aa1');

export const databases = new Databases(client);
export const account = new Account(client);
export { DB_ID, COLLECTION_ID ,ID};

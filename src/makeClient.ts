import { LibraClient } from "libra-ts-sdk";

export let client: LibraClient;

export const maybeInitClient = async (): Promise<LibraClient> => {
  if (!client) {
    client = new LibraClient();
  }
  await client.connect();
  client.assertReady();
  return client
}

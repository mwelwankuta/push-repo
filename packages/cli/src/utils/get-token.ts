import { existsSync, readFileSync, writeFileSync } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configFilePath = path.join(__dirname, "../config.conf");

/**
 * gets access_token from config.conf file and returns it as a string
 * @returns access_token
 */
export const getTokenFromConf = () => {
  if (!existsSync(configFilePath)) {
    writeFileSync(configFilePath, "access_token=");
    getTokenFromConf();
  }
  const configFile = readFileSync(configFilePath).toString();
  return configFile.split("=")[1];
};

/**
 * saves access token to config.conf file
 * @param access_token
 * @returns
 */
export const saveTokenToConf = (access_token: string) => {
  if (!access_token) {
    return;
  }
  writeFileSync(configFilePath, `access_token=${access_token}`);
};

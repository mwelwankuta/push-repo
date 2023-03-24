import { existsSync, readFileSync, writeFileSync } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const configFilePath = path.join(__dirname, "../config.conf");
export const getTokenFromConf = () => {
    if (!existsSync(configFilePath)) {
        writeFileSync(configFilePath, "access_token=");
        getTokenFromConf();
    }
    const configFile = readFileSync(configFilePath).toString();
    return configFile.split("=")[1];
};
export const saveTokenToConf = (access_token) => {
    if (!access_token) {
        return;
    }
    writeFileSync(configFilePath, `access_token=${access_token}`);
};
//# sourceMappingURL=getToken.js.map
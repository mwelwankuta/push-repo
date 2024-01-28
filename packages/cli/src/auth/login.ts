import chalk from "chalk";
import readline from "readline";
import { saveTokenToConf } from "../utils/get-token";
import { openInBrowser } from "../utils/open-browser";

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function authenticateUser(): Promise<null | string> {
  return new Promise((resolve) => {
    console.log(chalk.bold.white("[push repo] Opening browser..."));
    readlineInterface.question("Paste access token", (token: string) => {
      if (!token) authenticateUser();

      saveTokenToConf(token);
      resolve(token);
    });

    openInBrowser(
      "https://github.com/login/oauth/authorize?client_id=64dfe7b7577ebc559ecd&scope=repo"
    );
  });
}

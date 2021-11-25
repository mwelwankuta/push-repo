#!/usr/bin/env node
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

import open from "open";
import fetch from "node-fetch";
import inquirer from "inquirer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const accessTokenFilePath = join(__dirname, "secrets.txt");

(async () => {
  // fetch user access token
  async function getAccessToken() {
    console.log("Paste your access token to log in ");
    await open("https://github.com/settings/tokens/new?scopes=repo", {
      wait: true,
    });

    while (true) {
      const { token } = await inquirer.prompt([
        {
          type: "input",
          name: "token",
          message: "Enter your access token:",
        },
      ]);

      if (token) {
        // write access token to secrets
        fs.writeFileSync(accessTokenFilePath, `ACCESS_TOKEN=${token}`);
        break;
      }

      createRepository({ token, projectName });
    }
  }

  async function createRepository({ token, name = "test-repo" }) {
    console.log("Creating repository...\n");

    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        Authorization: `token ${token}`,
      },
    });

    const statusText = response.statusText;

    const error = response.status >= 400;
    if (error) return console.log(`ERROR: ${statusText}`);

    const data = await response.json();
    const originUrl = `${data.url}.git`;

    const run = `git remote add origin ${originUrl},git branch -M main`;
    exec(run[0], () => {
      exec(run[1]);
    });

    console.log(`Successfully created repository ${data.name}`);
  }

  // get github access token from secrets
  const file = readFileSync(accessTokenFilePath, {
    encoding: "utf8",
    flag: "r",
  });

  const token = file.split("=")[1];

  if (!token) {
    // inquirer to get yes or no from user
    const { shouldCreateAccessToken } = await inquirer.prompt([
      {
        type: "list",
        name: "shouldCreateAccessToken",
        message: "You need an access token to create repositories. Create one?",
        choices: ["Yes", "No"],
      },
    ]);

    if (shouldCreateAccessToken === "Yes") await getAccessToken();
    else process.exit();
  }

  if (token) {
    // get project name
    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter the name of your project:",
      },
    ]);

    if (name) return await createRepository({ token, name });

    // stop process
    console.log("You did not enter a project name");
    process.exit();
  }
})();

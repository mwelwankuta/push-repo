#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

import open from "open";
import fetch from "node-fetch";
import inquirer from "inquirer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const accessTokenFilePath = resolve(__dirname, "secrets.txt");

(async () => {
  // get github access token from secrets
  const file = readFileSync(accessTokenFilePath, {
    encoding: "utf8",
    flag: "r",
  });

  const token = file.split("=")[1];

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
        writeFileSync(accessTokenFilePath, `ACCESS_TOKEN=${token}`);
        break;
      }
    }
    getProjectName(token);
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

    const run = `git init,git remote add origin ${originUrl},git branch -M main`;

    const init = run.split(",")[0];
    const remote = run.split(",")[1];
    const branch = run.split(",")[2];

    exec(init, { cwd: process.cwd() });
    exec(remote, { cwd: process.cwd() });
    exec(branch, { cwd: process.cwd() });

    console.log(`Successfully created repository ${data.name}`);
  }

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

  try {
    if (token) {
      getProjectName(token);
    }
  } catch (error) {
    await getAccessToken();
  }

  async function getProjectName(token) {
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

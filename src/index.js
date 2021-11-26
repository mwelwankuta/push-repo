#!/usr/bin/env node
import { readFileSync, readdir, writeFileSync, opendir, readdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

import open from "open";
import fetch from "node-fetch";
import inquirer from "inquirer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const accessTokenFile = resolve(__dirname, "secrets.txt");

(async () => {
  const file = readFileSync(accessTokenFile, {
    encoding: "utf8",
    flag: "r",
  });

  const token = file.split("=")[1];

  const getProjectName = async () => {
    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter the name of your project:",
      },
    ]);

    if (name) return await createRepository({ name, token });

    console.log("You did not enter a project name");
    process.exit();
  };

  const getAccessToken = async () => {
    console.log("  Opening browser...");
    console.log("  Paste your access token to log in ");

    await open("https://github.com/settings/tokens/new?scopes=repo", {
      wait: false,
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
        // write access token to secrets file
        writeFileSync(accessTokenFile, `ACCESS_TOKEN=${token}`);
        break;
      }
    }
    getProjectName(token);
  };

  async function createRepository({ name, token }) {
    console.log("  Creating repository...\n");

    const res = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        Authorization: `token ${token}`,
      },
    });

    const statusText = res.statusText;
    const error = res.status >= 400;
    if (error) return console.log(`ERROR: ${statusText}`);

    const data = await res.json();
    const originUrl = `https://github.com/${data.owner.login}/${data.name}.git`;
    const cwd = process.cwd();

    const files = readdirSync(cwd).length > 0;

    if (files) {
      /*  push an existing repository */
      exec("git init", { cwd });
      exec("git add .", { cwd });
      exec('git commit -m "first commit', { cwd });
      exec(`git remote add origin ${originUrl}`, { cwd });
      exec("git branch -M main", { cwd });
      exec("git push -u origin main", { cwd });

      console.log("  Pushing files...");
    } else {
      /* create a new repository */
      exec("git init", { cwd });

      writeFileSync(resolve(cwd, "README.md"), `# ${data.name}`);

      exec("git add README.md", { cwd });
      exec('git commit -m "first commit"', { cwd });
      exec("git branch -M main", { cwd });
      exec(`git remote add origin ${originUrl}`, { cwd });
      exec("git push -u origin main", { cwd });
    }

    console.log(`  Successfully created repository '${data.name}'`);
  }

  if (!token) {
    const { shouldCreateAccessToken } = await inquirer.prompt([
      {
        type: "list",
        name: "shouldCreateAccessToken",
        message: "You need an access token to create repositories. Create one?",
        choices: ["Yes", "No"],
      },
    ]);

    if (shouldCreateAccessToken === "Yes") return await getAccessToken();

    console.log("  exiting...");
    process.exit();
  }
  
  try {
    if (token) return getProjectName(token);
  } catch (error) {
    await getAccessToken();
  }

})();

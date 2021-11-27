#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { execSync, spawnSync } from "child_process";

import open from "open";
import fetch from "node-fetch";
import inquirer from "inquirer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const accessTokenFile = join(__dirname, "secrets.txt");

(async () => {
  const getProjectName = async () => {
    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter the name of your project:",
      },
    ]);

    if (name) return await createRepository(name);

    console.log("You did not enter a project name");
    process.exit();
  };

  const getAccessToken = async () => {
    console.log("  Opening browser...");

    await open("https://github.com/settings/tokens/new?scopes=repo", {
      wait: true,
    });

    while (true) {
      const { token } = await inquirer.prompt([
        {
          type: "input",
          name: "token",
          message: "Enter your access token to login:",
        },
      ]);

      if (token) {
        // write access token to secrets file
        writeFileSync(accessTokenFile, `ACCESS_TOKEN=${token}`);
        break;
      }
    }
    await getProjectName();
  };

  async function createRepository(name) {
    console.log("  Creating repository...\n");

    const file = readFileSync(accessTokenFile, {
      encoding: "utf8",
      flag: "r",
    });

    const token = file.split("=")[1];

    const res = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
    });

    const statusText = res.statusText;
    const error = res.status >= 400;
    if (error) return console.log(`ERROR: ${statusText}`);

    const data = await res.json();
    const originUrl = `https://github.com/${data.owner.login}/${data.name}.git`;
    const cwd = process.cwd();

    console.log(originUrl);
    const files = readdirSync(cwd).length > 0;

    const gitCommands = (cwd) => {
      console.log(originUrl);
      execSync("git branch -M main", { cwd });
      execSync("git remote remove origin", { cwd });
      execSync(`git remote add origin ${originUrl}`, { cwd });
      console.log("  Pushing files...\n");
      execSync("git push -u origin main", { cwd });
      console.log(`  Successfully created repository '${data.name}'`);
    };

    if (files) {
      // push an existing repository
      console.log("  Initializing repository...\n");
      execSync("git init", { cwd });
      execSync("git add .", { cwd });
      execSync('git commit -m "first commit', { cwd });
      return await gitCommands(cwd); // add origin, rename branch and push code
    }

    // create a new repository
    writeFileSync(resolve(cwd, "README.md"), `# ${data.name}`);
    console.log("  Initializing repository...\n");
    execSync("git init", { cwd });
    execSync("git add README.md", { cwd });
    execSync('git commit -m "first commit"', { cwd });
    gitCommands(cwd); // add origin, rename branch and push code
  }

  const file = readFileSync(accessTokenFile, {
    encoding: "utf8",
    flag: "r",
  });

  const token = file.split("=")[1];

  try {
    if (!token) {
      const { shouldCreateAccessToken } = await inquirer.prompt([
        {
          type: "list",
          name: "shouldCreateAccessToken",
          message:
            "You need an access token to create a repository. Create one?",
          choices: ["Yes", "No"],
        },
      ]);

      if (shouldCreateAccessToken === "Yes") return await getAccessToken();

      console.log("  exiting...");
      process.exit();
    } else if (token) return await getProjectName();
  } catch (error) {
    await getAccessToken();
  }
})();

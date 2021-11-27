#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

import fetch from "node-fetch";
import inquirer from "inquirer";
import chalk from "chalk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const accessTokenFile = join(__dirname, "secrets.txt");

async function open(url) {
  switch (process.platform) {
    case "darwin":
      execSync(`open ${url}`);
      break;
    case "win32":
      execSync(`start ${url}`);
      break;
    default:
      execSync(`xdg-open ${url}`);
  }
}

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

    console.log(chalk.yellow("  You did not enter a project name. try again"));
    getProjectName();
  };

  const getAccessToken = async (shouldOpenBrowser = true) => {
    console.log("  Opening browser...");

    if (shouldOpenBrowser)
      await open("https://github.com/settings/tokens/new?scopes=repo");

    while (true) {
      const { token } = await inquirer.prompt([
        {
          type: "input",
          name: "token",
          message: "Enter your access token to login:",
        },
      ]);

      if (token.trim().length > 0) {
        // write access token to secrets file
        writeFileSync(accessTokenFile, `ACCESS_TOKEN=${token}`);
        break;
      } else {
        getAccessToken(false); // should open browser
      }
    }
    console.log("  you've been logged in, run `start-repo` to get started.");
  };

  async function createRepository(name) {
    console.log("  Creating repository...\n");

    const file = readFileSync(accessTokenFile, {
      encoding: "utf8",
      flag: "r",
    });

    const token = file.split("=")[1];

    if (!token) {
      console.log(chalk.yellow("you are not authenticated. exiting..."));
      process.exit();
    }

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
    if (error) return console.log(chalk.red(`${statusText}`));

    const data = await res.json();
    const originUrl = `https://github.com/${data.owner.login}/${data.name}.git`;
    const cwd = process.cwd();
    const execOptions = { cwd, stdio: "pipe" };

    const files = readdirSync(cwd).length > 0;

    const gitCommands = (execOptions) => {
      execSync("git branch -M main", execOptions);
      execSync(`git remote add origin ${originUrl}`, execOptions);
      console.log("  Pushing files...\n");
      execSync("git push -u origin main", execOptions);
      console.log(
        chalk.green(`  Successfully created repository '${data.name}'`)
      );
    };

    if (files) {
      // push an existing repository
      console.log("  Initializing repository...\n");
      execSync("git init", execOptions);
      execSync("git add .", execOptions);
      execSync(`git commit -m "first commit"`, execOptions);
      return gitCommands(execOptions); // add origin, rename branch and push code
    }

    // create a new repository
    writeFileSync(resolve(cwd, "README.md"), `# ${data.name}`);
    console.log("  Initializing repository...\n");
    execSync("git init", execOptions);
    execSync("git add README.md", execOptions);
    execSync(`git commit -m "first commit"`, execOptions);
    gitCommands(execOptions); // add origin, rename branch and push code
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
    console.log(" ", chalk.red(error.message));
  }
})();

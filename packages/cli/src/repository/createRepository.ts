import chalk from "chalk";
import { execSync } from "child_process";
import type { ExecSyncOptionsWithStringEncoding } from "child_process";
import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { getTokenFromConf } from "../utils/getToken.js";

const token = getTokenFromConf();
/**
 * initializes git and pushes code
 * @param name
 * @returns
 */

// TODO: this doesn't work
async function githubReposApi(name: string) {
  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    body: JSON.stringify({
      name,
    }),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const data = await response.json();
  return data;
}

export async function pushRepository(name: string) {
  console.log(chalk.green("[1] created repository"));

  const response = await githubReposApi(name);
  const { name: repository, owner } = response;

  const repoUrl = `https://github.com/${owner.login}/${repository}`;
  const originUrl = `${repoUrl}.git`;

  const cwd = process.cwd();

  const execOptions = {
    cwd,
    stdio: "pipe",
    encoding: "utf-8",
  } as ExecSyncOptionsWithStringEncoding;
  const doesDirectoryContainFiles = readdirSync(cwd).length > 0;

  console.log("  Committing files...\n");
  if (readdirSync(cwd).filter((file) => file === ".git").length === 0)
    execSync("git init", execOptions);

  if (!doesDirectoryContainFiles) {
    writeFileSync(resolve(cwd, "README.md"), `# ${name}`);
    execSync("git add README.md", execOptions);
    gitCommands(repoUrl, originUrl, execOptions);
  }

  execSync("git add .", execOptions);
  return gitCommands(repoUrl, originUrl, execOptions);
}

/**
 * add origin, rename branch & push code
 * @param repoUrl
 * @param originUrl
 * @param execOptions
 */
function gitCommands(
  repoUrl: string,
  originUrl: string,
  execOptions: ExecSyncOptionsWithStringEncoding
) {
  // try to commit files
  try {
    execSync(`git commit -m "first commit"`, execOptions);
  } catch (error) {
    // retry commit
    try {
      execSync(`git commit -m "initial commit"`, execOptions);
    } catch (error) {
      execSync("git branch -M main", execOptions);
    }
  }

  execSync("git branch -M main", execOptions);

  try {
    execSync(`git remote add origin ${originUrl}`, execOptions);
  } catch (error) {
    // replace previous remote
    try {
      console.log("  Removing previous origin\n");
      execSync("git remote remove origin ", execOptions);
      console.log("  adding new origin\n");
      execSync(`git remote add origin ${originUrl}`, execOptions);
    } catch (error) {
      console.log(chalk.red("  Failed to add remote: "), error);
    }
  }

  console.log("  Pushing files...\n");
  execSync("git push -u origin main", execOptions);
  console.log(
    chalk.green(`  Successfully created your repository '${name}'. ${repoUrl}`)
  );
}

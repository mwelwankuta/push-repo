import axios from "axios";
import chalk from "chalk";
import type { ExecSyncOptionsWithStringEncoding } from "child_process";
import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { getTokenFromConf } from "../utils/get-token";
import { getProtocol } from "../utils/process-arguments";
import { Git } from "./git";

const cwd = process.cwd();
const execOptions = {
  cwd,
  stdio: "pipe",
  encoding: "utf-8",
} as ExecSyncOptionsWithStringEncoding;

/**
 * creates a github repository on the authenticated user's account
 * @param repoName
 * @param accessToken
 * @returns github repository and user
 */
const createGitHubRepo = async (repoName: string, accessToken: string) => {
  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      { name: repoName },
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    console.log(chalk.green("[push repo] created remote  repository"));
    return response.data;
  } catch ({ response }) {
    console.log(
      chalk.bold.red(response.data.message),
      " ",
      chalk.red(response.data?.errors[0]?.message)
    );
    process.exit(0);
  }
};

/**
 * initializes git and pushes code
 * @param name
 * @returns
 */
export async function pushRepository(name: string) {
  console.log(chalk.bold.blue(`[push repo] preparing ${name}...`));

  const token = getTokenFromConf();
  const protocol = getProtocol();
  const { name: repository, owner } = await createGitHubRepo(name, token);

  const repoUrl = `https://github.com/${owner.login}/${repository}`;
  let originUrl;
  if (protocol == "http") {
    originUrl = `${repoUrl}.git`;
  } else {
    originUrl = `git@github.com:${owner.login}/${repository}`;
  }

  const git = new Git(repoUrl, originUrl, execOptions);

  const directoryIsAGitRepository =
    readdirSync(cwd).filter((file) => file === ".git").length === 0;
  if (directoryIsAGitRepository) {
    git.init();
  }

  const directoryDoesNotContainFiles = readdirSync(cwd).length == 0;
  if (directoryDoesNotContainFiles) {
    writeFileSync(resolve(cwd, "README.md"), `# ${name}`);
    git.add().commit().origin().push();
    return;
  }

  git.add().commit().origin().push();
}

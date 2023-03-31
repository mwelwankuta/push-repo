import chalk from "chalk";
import type { ExecSyncOptionsWithStringEncoding } from "child_process";
import { execSync } from "child_process";
import { openInBrowser } from "../utils/openBrowser.js";

/**
 * add origin, rename branch & push code
 * @param repoUrl
 * @param originUrl
 * @param execOptions
 */
export class Git {
  repoUrl: string;
  originUrl: string;
  execOptions: ExecSyncOptionsWithStringEncoding;
  constructor(
    repoUrl: string,
    originUrl: string,
    execOptions: ExecSyncOptionsWithStringEncoding
  ) {
    this.repoUrl = repoUrl;
    this.originUrl = originUrl;
    this.execOptions = execOptions;
  }

  init() {
    console.log(chalk.green(`[push repo] initializing repository`));
    execSync("git init", this.execOptions);
    return this;
  }

  add() {
    console.log(chalk.green(`[push repo] adding files`));
    execSync("git add .", this.execOptions);
    return this;
  }

  commit() {
    console.log(chalk.green(`[push repo] committing repository changes`));
    // try to commit files
    try {
      execSync(`git commit -m "first commit"`, this.execOptions);
    } catch (error) {
      // retry commit
      try {
        execSync(`git commit -m "initial commit"`, this.execOptions);
      } catch (error) {
        execSync("git branch -M main", this.execOptions);
      }
    }
    return this;
  }

  origin() {
    console.log(chalk.green(`[push repo] linking to github`));
    execSync("git branch -M main", this.execOptions);

    try {
      execSync(`git remote add origin ${this.originUrl}`, this.execOptions);
    } catch (error) {
      // replace previous remote
      try {
        console.log(chalk.blue("   removing previous origin\n"));
        execSync("git remote remove origin ", this.execOptions);
        console.log(chalk.blue("   adding new origin\n"));
        execSync(`git remote add origin ${this.originUrl}`, this.execOptions);
      } catch (error) {
        console.log(chalk.red("  Failed to add remote: "), error);
      }
    }
    return this;
  }

  push() {
    execSync("git push -u origin main", this.execOptions);
    console.log(chalk.green(`[push repo] Successfully linked your repository`));
    openInBrowser(this.repoUrl);
  }
}

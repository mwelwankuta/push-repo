import chalk from "chalk";
import { execSync } from "child_process";
import { openInBrowser } from "../utils/openBrowser.js";
export class Git {
    constructor(repoUrl, originUrl, execOptions) {
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
        try {
            execSync(`git commit -m "first commit"`, this.execOptions);
        }
        catch (error) {
            try {
                execSync(`git commit -m "initial commit"`, this.execOptions);
            }
            catch (error) {
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
        }
        catch (error) {
            try {
                console.log(chalk.blue("   removing previous origin\n"));
                execSync("git remote remove origin ", this.execOptions);
                console.log(chalk.blue("   adding new origin\n"));
                execSync(`git remote add origin ${this.originUrl}`, this.execOptions);
            }
            catch (error) {
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
//# sourceMappingURL=git.js.map
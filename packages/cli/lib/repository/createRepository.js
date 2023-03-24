import axios from "axios";
import chalk from "chalk";
import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { getTokenFromConf } from "../utils/getToken.js";
import { getProtocol } from "../utils/processArguments.js";
import { Git } from "./git.js";
const cwd = process.cwd();
const execOptions = {
    cwd,
    stdio: "pipe",
    encoding: "utf-8",
};
const createGitHubRepo = async (repoName, accessToken) => {
    var _a, _b;
    try {
        const response = await axios.post("https://api.github.com/user/repos", { name: repoName }, {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        console.log(chalk.green("[push repo] created remote  repository"));
        return response.data;
    }
    catch ({ response }) {
        console.log(chalk.bold.red(response.data.message), " ", chalk.red((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.errors[0]) === null || _b === void 0 ? void 0 : _b.message));
        process.exit(0);
    }
};
export async function pushRepository(name) {
    console.log(chalk.bold.blue(`[push repo] preparing ${name}...`));
    const token = getTokenFromConf();
    const protocol = getProtocol();
    const { name: repository, owner } = await createGitHubRepo(name, token);
    const repoUrl = `https://github.com/${owner.login}/${repository}`;
    let originUrl;
    if (protocol == "http") {
        originUrl = `${repoUrl}.git`;
    }
    else {
        originUrl = `git@github.com:${owner.login}/${repository}`;
    }
    const git = new Git(repoUrl, originUrl, execOptions);
    const directoryContainFiles = readdirSync(cwd).length > 0;
    if (readdirSync(cwd).filter((file) => file === ".git").length === 0) {
        git.init();
    }
    if (!directoryContainFiles) {
        writeFileSync(resolve(cwd, "README.md"), `# ${name}`);
        git.add().commit().origin().push();
        return;
    }
    git.add().commit().origin().push();
}
//# sourceMappingURL=createRepository.js.map
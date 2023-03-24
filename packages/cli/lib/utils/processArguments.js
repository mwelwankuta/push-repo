import chalk from "chalk";
import minimist from "minimist";
const args = minimist(process.argv.slice(2));
export const getProjectName = () => {
    const projectName = args.n || args.name;
    if (!projectName) {
        console.log(chalk.yellow("You need to pass in a project name. use --name <project name>"));
        return null;
    }
    return projectName;
};
export const getProtocol = () => {
    if (args.http)
        return "http";
    return "ssh";
};
//# sourceMappingURL=processArguments.js.map
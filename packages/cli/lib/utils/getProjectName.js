import chalk from "chalk";
import minimist from "minimist";
export const getProjectName = () => {
    const args = minimist(process.argv.slice(2));
    const projectName = args.n || args.name;
    if (!projectName) {
        console.log(chalk.yellow("You need to pass in a project name. use --name <project name>"));
        return null;
    }
    return projectName;
};
//# sourceMappingURL=getProjectName.js.map
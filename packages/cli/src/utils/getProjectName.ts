import chalk from "chalk";
import minimist from "minimist";

interface ProcessArguments extends minimist.ParsedArgs {
  n?: string;
  name?: string;
}
/**
 * returns a value a project from the process arguments for the key --name
 * @returns projectName
 */
export const getProjectName = () => {
  const args = minimist(process.argv.slice(2)) as ProcessArguments;
  const projectName = args.n || args.name;
  if (!projectName) {
    console.log(
      chalk.yellow(
        "You need to pass in a project name. use --name <project name>"
      )
    );
    return null;
  }

  return projectName as string;
};

import chalk from "chalk";
import minimist from "minimist";

interface ProcessArguments extends minimist.ParsedArgs {
  n?: string;
  name?: string;
  ssh?: boolean;
  http?: boolean;
}

const args = minimist(process.argv.slice(2)) as ProcessArguments;

/**
 * returns a value a project from the process arguments for the key --name
 * @returns projectName
 */
export const getProjectName = () => {
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

/**
 * returns the authentication protocol for github
 * @returns authentication protocol type
 */
export const getProtocol = (): "http" | "ssh" => {
  if (args.http) return "http";
  return "ssh";
};

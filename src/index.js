#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

import fetch from 'node-fetch';
import inquirer from 'inquirer';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const accessTokenFile = join(__dirname, 'secrets.txt');

async function open(url) {
  switch (process.platform) {
    case 'darwin':
      execSync(`open ${url}`);
      break;
    case 'win32':
      execSync(`start ${url}`);
      break;
    default:
      execSync(`xdg-open ${url}`);
  }
}

(async () => {
  const getProjectName = async projectName => {
    // name from run arguments
    if (projectName !== undefined || projectName !== null) {
      return await createRepository(projectName);
    }

    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the name of your project:',
      },
    ]);

    if (name) return await createRepository(name);

    console.log(chalk.yellow('  You did not enter a project name. try again'));
    getProjectName();
  };

  const getAccessToken = async (shouldOpenBrowser = true) => {
    console.log('  Opening browser...');

    if (shouldOpenBrowser)
      await open('https://github.com/settings/tokens/new?scopes=repo');

    while (true) {
      const { token } = await inquirer.prompt([
        {
          type: 'input',
          name: 'token',
          message: 'Enter your access token to login:',
        },
      ]);

      if (token.trim().length > 0) {
        // write access token to secrets file
        writeFileSync(accessTokenFile, `ACCESS_TOKEN=${token}`);
        break;
      } else {
        console.log(chalk.yellow('  you did not enter a token, exiting...\n'));
        process.exit(0);
      }
    }
    console.log(
      chalk.green("  you've been logged in, run `start-repo` to get started.")
    );
  };

  async function createRepository(name) {
    console.log('\n  Initializing repository...\n');

    const file = readFileSync(accessTokenFile, {
      encoding: 'utf8',
      flag: 'r',
    });

    const token = file.split('=')[1];

    if (!token) {
      console.log(chalk.yellow('you are not authenticated. exiting...'));
      process.exit(0);
    }

    const res = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const statusText = res.statusText;
    const error = res.status >= 400;

    if (res.status === 401) {
      const { renew } = await inquirer.prompt([
        {
          type: 'list',
          name: 'renew',
          message: `it seems like your access token has expired, do you want to create new token?`,
          choices: ['Yes', 'No'],
        },
      ]);
      if (renew === 'Yes') {
        return getAccessToken();
      } else {
        console.log('  try to increase the access token expiry duration.');
        process.exit();
      }
    }

    if (error && res.status !== 401)
      return console.log(chalk.red(`${statusText}`));

    const data = await res.json();

    const user = data.owner.login;
    const repository = data.name;

    const repoUrl = `https://github.com/${user}/${repository}`;
    const originUrl = `${repoUrl}.git`;

    const cwd = process.cwd();

    const execOptions = { cwd, stdio: 'pipe' };
    const files = readdirSync(cwd).length > 0;

    // add origin, rename branch and push code
    const gitCommands = execOptions => {
      // try to commit files
      try {
        execSync(`git commit -m "first commit"`, execOptions);
      } catch (error) {
        try {
          execSync(`git commit -m "initial commit"`, execOptions);
        } catch (error) {
          execSync('git branch -M main', execOptions);
        }
      }

      execSync('git branch -M main', execOptions);

      try {
        execSync(`git remote add origin ${originUrl}`, execOptions);
      } catch (error) {
        // replace previous remote
        try {
          console.log('  Removing previous origin\n');
          execSync('git remote remove origin ', execOptions);
          console.log('  adding new origin\n');
          execSync(`git remote add origin ${originUrl}`, execOptions);
        } catch (error) {
          console.log(chalk.red('  Failed to add remote: '), error);
        }
      }

      console.log('  Pushing files...\n');
      execSync('git push -u origin main', execOptions);
      console.log(
        chalk.green(
          `  Successfully created your repository '${data.name}'. ${repoUrl}`
        )
      );
    };

    console.log('  Commiting files...\n');
    if (readdirSync(cwd).filter(file => file === '.git').length === 0)
      execSync('git init', execOptions);

    if (files) {
      // existing files
      execSync('git add .', execOptions);
      return gitCommands(execOptions);
    }

    // blank directory
    writeFileSync(resolve(cwd, 'README.md'), `# ${data.name}`);
    execSync('git add README.md', execOptions);
    gitCommands(execOptions);
  }

  const file = readFileSync(accessTokenFile, {
    encoding: 'utf8',
    flag: 'r',
  });

  const token = file.split('=')[1];

  try {
    if (token) {
      const name = process.argv[2];
      return await getProjectName(name);
    }

    const { shouldCreateAccessToken } = await inquirer.prompt([
      {
        type: 'list',
        name: 'shouldCreateAccessToken',
        message: 'You need an access token to create a repository. Create one?',
        choices: ['Yes', 'No'],
      },
    ]);
    console.log('past');

    if (shouldCreateAccessToken === 'Yes') return await getAccessToken();

    console.log('  exiting...');
    process.exit(0);
  } catch (error) {
    console.log(' ', chalk.red(error.message));
  }
})();

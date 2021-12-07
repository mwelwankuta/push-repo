# start-repo

![npm](https://img.shields.io/npm/dw/start-repo?color=red&label=downloads&logo=npm&style=for-the-badge)

Quickly create a local git project connected to github. The first time your run `start-repo` you'll have to follow the steps to connect your github account.

# Installation

using npm

```sh
npm install -g start-repo
```

using yarn

```sh
yarn global add start-repo
```

# Usage

run the following commands while in a project directory

- passing an argument (recommended)

```sh
start-repo my-project
```

- without argument

```sh
start-repo
```
| Argument | What it does |
|----------|--------------|
| -logout  | clears local access token |
| -c       | creates a folder |

then follow the steps that follow to initialize a new project

# Contributing

- Fork it
- Create your feature branch `git checkout -b my-feature-name`
- Test your code with `npm link` and then `npm link start-repo` in the directory you would like to test the code
- Run the test code. to run the test simply enter `start-repo` while in your testing project directory
- Commit your changes `git commit -am 'added a feature'`
- Push the branch `git push origin my-feature-branch`
- Submit a pull request

# Licence

This project is under the [MIT Licence](https://raw.githubusercontent.com/mwelwankuta/start-repo/master/LICENSE)

# Author


<br/>

[![](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/Merlee4t)
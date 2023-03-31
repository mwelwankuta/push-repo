# push-repo

![npm](https://img.shields.io/npm/dt/push-repo?color=red&style=flat-square)

Quickly create a local git project connected to github. The first time your run `push-repo` you'll have to follow the steps to connect your github account.

# Installation

using npm

```bash
npm install -g push-repo
```

or

```bash
npx push-repo

```

# Usage

run the following commands while in a project directory

- passing a name argument

```sh
push-repo --name <my-project>
```

# Options

| Option   | Function                  |
| -------- | ------------------------- |
| `--name` | name of github repository |
| `-n`     | name of github repository |
| `--ssh`  | use ssh for github auth   |
| `--http` | use http for github auth  |

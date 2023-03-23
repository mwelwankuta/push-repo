#!/usr/bin/env node
import chalk from "chalk";
import { authenticateUser } from "./auth/login.js";
import { pushRepository } from "./repository/createRepository.js";
import { getProjectName } from "./utils/getProjectName.js";
import { getTokenFromConf } from "./utils/getToken.js";

const token = getTokenFromConf();

try {
  if (!token) {
    await authenticateUser();
  }

  const projectName = getProjectName()

  if (projectName) {
    pushRepository(projectName);
  }
} catch (error) {

}

#!/usr/bin/env node
import { authenticateUser } from "./auth/login.js";
import { pushRepository } from "./repository/createRepository.js";
import { getProjectName } from "./utils/processArguments.js";
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

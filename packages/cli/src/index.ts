#!/usr/bin/env node
import { authenticateUser } from "./auth/login";
import { pushRepository } from "./repository/create-repository";
import { getProjectName } from "./utils/process-arguments";
import { getTokenFromConf } from "./utils/get-token";

if (!getTokenFromConf()) {
  await authenticateUser();
}

const projectName = getProjectName();
if (projectName) {
  pushRepository(projectName);
}

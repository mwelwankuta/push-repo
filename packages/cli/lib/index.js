#!/usr/bin/env node
import { authenticateUser } from "./auth/login.js";
import { pushRepository } from "./repository/createRepository.js";
import { getProjectName } from "./utils/processArguments.js";
import { getTokenFromConf } from "./utils/getToken.js";
if (!getTokenFromConf()) {
    await authenticateUser();
}
const projectName = getProjectName();
if (projectName) {
    pushRepository(projectName);
}
//# sourceMappingURL=index.js.map
import chalk from "chalk";
import http from "http";
import url from "url";
import { saveTokenToConf } from "../utils/getToken.js";
import { openInBrowser } from "../utils/openBrowser.js";
export async function authenticateUser() {
    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            req.setEncoding("utf8");
            const { access_token } = url.parse(req.url, true).query;
            if (access_token) {
                saveTokenToConf(access_token);
                server.close();
                resolve(access_token);
            }
            else {
                reject({ message: " an error just occurred" });
            }
            res.end();
        });
        console.log(chalk.bold.white("[push repo] Opening browser..."));
        server.listen(1230, () => {
            openInBrowser("https://github.com/login/oauth/authorize?client_id=64dfe7b7577ebc559ecd&scope=repo");
        });
    });
}
//# sourceMappingURL=login.js.map
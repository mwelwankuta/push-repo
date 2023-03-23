import http from "http";
import url from "url";
import { openInBrowser } from "../utils/openBrowser.js";
import { saveTokenToConf } from "../utils/getToken.js";
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
                reject({ messsage: " an error just occured" });
            }
            res.end();
        });
        console.log("  Opening browser...");
        server.listen(1230, () => {
            console.log("server listenining");
            openInBrowser("https://github.com/login/oauth/authorize?client_id=64dfe7b7577ebc559ecd");
        });
    });
}
//# sourceMappingURL=login.js.map
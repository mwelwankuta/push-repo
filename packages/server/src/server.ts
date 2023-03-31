import express, { Application } from "express";
import url from "url";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

interface ProcessEnv {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
}

const { CLIENT_ID, CLIENT_SECRET } = process.env as unknown as ProcessEnv;

const app: Application = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<h1>${req.hostname}</h1>`);
});

app.get("/github/callback", async (req, res) => {
  const response = await axios.get(
    `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${req.query.code}`
  );

  const { access_token = "" } = url.parse(
    `${req.protocol}://${req.hostname}${response.data}` as string,
    true
  ).query as {
    access_token: string;
  };

  res.send(
    `<h1>You're authenticated, paste this access token into your terminal: <br> ${access_token}</h1>`
  );
});

const PORT = 8080 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`[server]: listening on port ${PORT}`);
});

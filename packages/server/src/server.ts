import express, { Application } from "express";
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
  res.send(`<h1>${req.ip}</h1>`);
});

app.get("/github/callback", async (req, res) => {
  const requestToken = req.query.code;

  const url = `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${requestToken}`;
  const response = await axios.get(url);

  await axios.get(`http://localhost:1230?${response.data}`);
  res.send("<h1>You're authenticated, close your browser</h1>");
});

const port = 8080 || process.env.PORT;
app.listen(port, () => {
  console.log(`[server]: listening on port ${port}`);
});

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

/**
 * fetches request and returns json data
 * @param url
 * @returns
 */
app.get("/github/callback", async (req, res) => {
  const requestToken = req.query.code;

  const url = `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${requestToken}`;
  const response = await axios.get(url);
  const data = await response.data;
  const access_token = parseTokenData(data);

  await axios.get(
    `http://localhost:1230?access_token=${access_token}`
  );
  res.send("<h1>You're authenticated, close your browser</h1>");
});

function parseTokenData(data: string) {
  return data.split("=")[1];
}

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`[server]: listening on port ${port}`);
});

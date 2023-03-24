import { execSync } from "child_process";

export async function openInBrowser(url: string) {
  switch (process.platform) {
    case "darwin":
      execSync(`open "${url}"`);
      break;
    case "win32":
      execSync(`start "${url}"`);
      break;
    default:
      execSync(`xdg-open "${url}"`);
  }
}

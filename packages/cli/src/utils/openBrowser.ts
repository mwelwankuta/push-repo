import { execSync } from "child_process";

/**
 * visits passed in url in default browser
 * @param url to visit
 */
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

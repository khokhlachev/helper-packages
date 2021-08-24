import chalk from "chalk";
import { createError } from "@khokhlachev/utils";

const error = createError("Environment");

/**
 * Проверяет, что все переменные `vars`
 * определены в process.env
 */
function checkEnv(vars: string[]) {
  const missing: string[] = [];

  for (const v of vars) {
    if (process.env[v] === undefined) {
      missing.push(v);
    }
  }

  if (missing.length > 0) {
    error(
      `${chalk.red(
        "Following variables are missing from process.env"
      )}:\n${missing.join("\n")}`
    );
  }
}

export default checkEnv;

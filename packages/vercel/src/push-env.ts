/**
 * Загружает содежимое файла .env в окружение vercel.
 * Потому что такой функции нет в официальном cli.
 *
 * Предварительно нужно выполнить `vercel login` и `vercel link`
 */

import readline from "readline";
import fs from "fs";
import path from "path";
import { createError, createLogger } from "@khokhlachev/utils";
import arg from "arg";
import { execSync } from "child_process";

const dot = (str?: string) => (str ? `.${str}` : "");

const MODULE_NAME = "push-env-vercel";

const logger = createLogger(MODULE_NAME);
const error = createError(MODULE_NAME);

function add(key: string, value: string, environment: string) {
  try {
    execSync(`printf "${value}" | vercel env add ${key} ${environment}`, {
      stdio: "pipe",
    });

    logger.success(`Variable ${key} is saved!`);
  } catch (err) {
    if (
      /Another Environment Variable with the same Name and Environment exists/.test(
        err.message
      )
    ) {
      logger(`Variable ${key} exists. Removing...`);
      rm(key, environment);
      add(key, value, environment);
    } else {
      // Something went really wrong
      error(err.message);
    }
  }
}

function rm(k: string, environment: string) {
  execSync(`vercel env rm ${k} ${environment} -y`, {
    stdio: "ignore",
  });
}

export function parseLine(line: string): (string | undefined)[] {
  const [_, k, v] = line.match(/^(\w+)=(.+)/) || [];
  return [k, v];
}

export function parseFile(
  path: string,
  callback: (key: string, value: string) => void
) {
  if (!fs.existsSync(path)) {
    error(`${path} does not exist`);
  }

  const io = readline.createInterface({
    input: fs.createReadStream(path),
  });

  io.on("line", (line) => {
    if (!line || line.startsWith("#")) {
      return;
    }

    const [k, v] = parseLine(line);

    if (!k || !v) {
      return;
    }

    callback(k, v);
  });

  io.on("close", () => {
    logger.success("👌");
  });
}

export function processEnvFile() {
  const args = arg({
    "--env": String,
  });

  const environment = args["--env"] || "";

  try {
    execSync("vercel --version", {
      stdio: "ignore",
    });
  } catch (e) {
    error("Vercel CLI is not installed. See https://vercel.com/docs/cli");
  }

  try {
    const { projectId, orgId } = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "./.vercel/project.json"),
        "utf8"
      )
    );

    if (!projectId || !orgId) {
      throw new Error();
    }
  } catch (e) {
    error("Project is not linked. Run `vercel link` to begin.");
  }

  const envFilePath = path.join(process.cwd(), `./.env${dot(environment)}`);

  parseFile(envFilePath, (key, value) => {
    try {
      add(key, value, environment);
    } catch (e) {
      logger.error("line", e);
    }
  });
}

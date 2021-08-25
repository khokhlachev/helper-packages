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

const args = arg({
  "--env": String,
});

const environment = args["--env"] || "";

const dot = (str?: string) => (str ? `.${str}` : "");

const MODULE_NAME = "push-env-vercel";
const envFile = path.join(process.cwd(), `./.env${dot(environment)}`);

const logger = createLogger(MODULE_NAME);
const error = createError(MODULE_NAME);

if (!fs.existsSync(envFile)) {
  error(`${envFile} does not exist`);
}

try {
  execSync("vercel --version", {
    stdio: "ignore",
  });
} catch (e) {
  error("Vercel CLI is not installed. See https://vercel.com/docs/cli");
}

try {
  const { projectId, orgId } = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "./.vercel/project.json"), "utf8")
  );

  if (!projectId || !orgId) {
    throw new Error();
  }
} catch (e) {
  error("Project is not linked. Run `vercel link` to begin.");
}

function add(key: string, value: string) {
  try {
    execSync(`echo "${value}" | vercel env add ${key} ${environment}`, {
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
      rm(key);
      add(key, value);
    } else {
      // Something went really wrong
      error(err.message);
    }
  }
}

function rm(k: string) {
  execSync(`vercel env rm ${k} ${environment} -y`, {
    stdio: "ignore",
  });
}

const io = readline.createInterface({
  input: fs.createReadStream(envFile),
});

io.on("line", (line) => {
  if (!line || line.startsWith("#")) {
    return;
  }

  const [_, k, v] = line.match(/^(\w+)=(.+)$/) || [];

  if (!k || !v) {
    return;
  }

  try {
    add(k, v);
  } catch (e) {
    logger.error("line", e);
  }
});

io.on("close", () => {
  logger.success("👌");
});

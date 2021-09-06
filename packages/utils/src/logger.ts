import chalk from "chalk";
import { AnyObject } from "./types";

function logger(...args: any[]) {
  console.log.apply(null, args);
}

logger.json = (obj: AnyObject) => {
  logger("\n", JSON.stringify(obj, null, 2), "\n");
};

logger.error = (...args: any[]) => {
  console.error.apply(null, args);
};

logger.warn = (...args: any[]) => {
  console.warn.apply(null, args);
};

logger.success = (...args: any[]) => {
  console.log.apply(null, args);
};

const colorMap = {
  default: chalk.bold,
  error: chalk.bold.red,
  warn: chalk.bold.yellow,
  success: chalk.bold.green,
};

export function createLogger(prefix: string) {
  const proxyLogger = Object.assign(function (...args: any[]) {
    return logger.apply(null, [`${colorMap.default(prefix)}`].concat(args));
  }, logger);

  return new Proxy(proxyLogger, {
    get(target, prop) {
      const origMethod = target[prop];

      return (...args: any[]) => {
        const format = colorMap[prop] || colorMap.default;

        origMethod.apply(this, [`${format(prefix)}`].concat(args));
      };
    },
  });
}

export function createError(prefix: string) {
  const logger = createLogger(prefix);

  return function error(...args: any[]): never {
    logger.error.apply(null, args);

    if (typeof global !== "undefined") {
      process.exit(1);
    } else {
      throw new Error(`${prefix}: Error. See console output.`);
    }
  };
}

import chalk from "chalk";

export const createLogger = (prefix: string) => ({
  log: (msg: string) => console.log(`${chalk.bold(prefix)}: ${msg}`),
  error: (msg: string) => console.error(`${chalk.red.bold(prefix)}: ${msg}`),
});

export const createError = (prefix: string) => {
  const logger = createLogger(prefix);

  return (msg: string) => {
    logger.error(msg);
    process.exit(1);
  };
};

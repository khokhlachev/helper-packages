import { cosmiconfigSync } from "cosmiconfig";

const PACKAGE_NAME = "my-cli";

const explorerSync = cosmiconfigSync(PACKAGE_NAME);
const cosmiconfigResult = explorerSync.search();

const getCosmiconfig = (key = "") => cosmiconfigResult.config?.[key] || {};

const config = {
  name: PACKAGE_NAME,
  ...getCosmiconfig(),
  prismic: {
    repoName: undefined,
    rootDir: "/lib/prismic",
    ...getCosmiconfig("prismic"),
  },
};

export default config;

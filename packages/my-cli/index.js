#!/usr/bin/env node

import "dotenv/config";
import fs from "fs-extra";
import { basename, resolve } from "path";
import arg from "arg";
import expandBraces from "brace-expansion";
import { pascalCase, paramCase, snakeCase } from "change-case";
import pageTemplate from "./templates/page.js";
import componentTemplate from "./templates/component.js";
import getterTemplate from "./templates/getter.js";
import customTypeTemplate from "./templates/custom-type.js";
import { createLogger, createError } from "@khokhlachev/utils";
import chalk from "chalk";
import { globby } from "globby";
import * as customTypesApi from "./custom-types/prismic.js";
import config from "./shared/config.js";

const { outputFileSync, appendFileSync } = fs;

const log = createLogger(config.name);
const error = createError(config.name);
const cwd = process.cwd();

// humanize path
function hp(path) {
  return path.replace(`${cwd}/`, "");
}

function getPageName(args, routeName) {
  return pascalCase(args["--name"] || routeName);
}

function getRouteParamName(routeName) {
  return routeName.replace(/.*\[(.+)\].*/, "$1");
}

const resolvePrismicRoot = (...segments) =>
  resolve(config.prismic.rootDir, ...segments);
const TYPES_PATH = resolvePrismicRoot("types.ts");
const GETTER_ALL_EXPORTS_PATH = resolvePrismicRoot("getters/index.ts");

function createPageCommand(args, routeNames) {
  function createPage(routeName) {
    const pageName = getPageName(args, routeName);
    const paramName = getRouteParamName(routeName);

    const outputPath = resolve("pages", `${routeName}.tsx`);

    // write page
    outputFileSync(
      outputPath,
      pageTemplate(pageName, { getStaticPaths: !!paramName, param: paramName })
    );
    // add ts type
    appendFileSync(TYPES_PATH, `\nexport type ${pageName} = {} & SeoProps\n`);

    log.success(`
    ${chalk.bold(`Created: <${pageName} />`)}
    ${chalk.dim(hp(outputPath))}
    `);
  }

  routeNames.forEach(createPage);
}

function createPageComponentCommand(args, routeNames) {
  function createComponent(routeName) {
    const componentName = getPageName(args, routeName);
    const outputPath = resolve(
      "components",
      paramCase(componentName),
      "index.tsx"
    );
    // write component
    outputFileSync(outputPath, componentTemplate(componentName));

    log.success(`
    ${chalk.bold(`Created: <${componentName} />`)}
    ${chalk.dim(hp(outputPath))}
    `);
  }

  routeNames.forEach(createComponent);
}

function createPageGetterCommand(args, routeNames) {
  function createGetter(routeName) {
    const getterName = getPageName(args, routeName);
    const outputPath = resolvePrismicRoot(
      "getters",
      `${paramCase(getterName)}.ts`
    );
    const routeParamName = getRouteParamName(routeName);

    // write getter
    outputFileSync(
      outputPath,
      getterTemplate({
        pageName: getterName,
        param: routeParamName,
        graphql: args["--graphql"] || true,
      })
    );
    // add getter to all exports
    appendFileSync(
      GETTER_ALL_EXPORTS_PATH,
      `export { default as get${getterName} } from './${paramCase(
        getterName
      )}'\n`
    );

    log.success(`
    ${chalk.bold(`Getter created and modified types: ${getterName}`)}
    ${chalk.dim(hp(outputPath))}
    ${chalk.dim(hp(GETTER_ALL_EXPORTS_PATH))}
    `);
  }

  routeNames.forEach(createGetter);
}
async function createPrismicTypeCommand(args, routeNames) {
  async function createCustomType(routeName) {
    const typeName = snakeCase(routeName);
    const outputPath = resolvePrismicRoot("custom-types", `${typeName}.json`);

    // write custom type
    outputFileSync(
      outputPath,
      customTypeTemplate(typeName, { repeatable: args["--repeatable"] })
    );
    await customTypesApi.insertCustomType(typeName);

    log.success(`
    ${chalk.bold(`Custom type created: ${typeName}`)}
    ${chalk.dim(hp(outputPath))}
    `);
  }

  for (const routeName of routeNames) {
    await createCustomType(routeName);
  }
}

async function updatePrismicTypeCommand(args, routeNames) {
  async function updatePrismicType(routeName) {
    const typeName = routeName;

    try {
      await customTypesApi.updateCustomType(typeName);

      log.success(`
      ${chalk.bold(`Custom type updated: ${typeName}`)}
      `);
    } catch (err) {
      const text = await err.text();
      log.error(
        `
    ${chalk.bold(`Custom type ${typeName} was not updated. Reason:`)}
    `,
        text
      );
    }
  }

  for (const routeName of routeNames) {
    await updatePrismicType(routeName);
  }
}

async function updateAllPrismicTypeCommand() {
  const allPaths = await globby([resolvePrismicRoot("custom-types/*.json")]);
  await updatePrismicTypeCommand(
    {},
    allPaths.map((fullPath) => basename(fullPath).replace(".json", ""))
  );
}

async function dumpPrismicTypeCommand(args, routeNames) {
  async function dumpPrismicType(routeName) {
    const typeName = routeName;
    const data = await customTypesApi.getCustomType(typeName);
    const outputPath = resolvePrismicRoot("custom-types", `${typeName}.json`);

    // write custom type
    outputFileSync(outputPath, JSON.stringify(data, null, 2));

    log.success(`
    ${chalk.bold(`Custom type dumped: ${typeName}`)}
    ${chalk.dim(hp(outputPath))}
    `);
  }

  for (const routeName of routeNames) {
    await dumpPrismicType(routeName);
  }
}

async function dumpAllPrismicTypeCommand() {
  const typesList = await customTypesApi.getAllCustomTypes();
  for (const typeData of typesList) {
    const outputPath = resolvePrismicRoot(
      "custom-types",
      `${typeData.id}.json`
    );
    outputFileSync(outputPath, JSON.stringify(typeData, null, 2));
  }
}

const args = arg({
  "--name": String,
  "--graphql": Boolean,
  "--repeatable": Boolean,
});

const COMMANDS = {
  "create-route": "create-route",
  "create-route:page": "create-route:page",
  "create-route:component": "create-route:component",
  "create-route:getter": "create-route:getter",
  "prismic:create": "prismic:create",
  "prismic:update": "prismic:update",
  "prismic:update-all": "prismic:update-all",
  "prismic:dump": "prismic:dump",
  "prismic:dump-all": "prismic:dump-all",
};
const command = args._[0];

if (!command || !(command in COMMANDS)) {
  error(
    `${chalk.bold("Commands available:")}\n\n${Object.values(COMMANDS).join(
      "\n"
    )}\n`
  );
}

const routeNamesExpanded = args._.slice(1).flatMap((s) => expandBraces(s));

if (routeNamesExpanded.length === 0) {
  error("Specify at least one route name.");
}

if (args["--name"] && routeNamesExpanded.length > 1) {
  error("--name parameter cannot override multiple paths at once.");
}

switch (command) {
  case COMMANDS["create-route"]:
    createPageCommand(args, routeNamesExpanded);
    createPageComponentCommand(args, routeNamesExpanded);
    createPageGetterCommand(args, routeNamesExpanded);
    break;
  case COMMANDS["create-route:page"]:
    createPageCommand(args, routeNamesExpanded);
    break;
  case COMMANDS["create-route:component"]:
    createPageComponentCommand(args, routeNamesExpanded);
    break;
  case COMMANDS["create-route:getter"]:
    createPageGetterCommand(args, routeNamesExpanded);
    break;
  case COMMANDS["prismic:create"]:
    await createPrismicTypeCommand(args, routeNamesExpanded);
    break;
  case COMMANDS["prismic:update"]:
    await updatePrismicTypeCommand(args, routeNamesExpanded);
    break;
  case COMMANDS["prismic:update-all"]:
    await updateAllPrismicTypeCommand(args, routeNamesExpanded);
    break;
  case COMMANDS["prismic:dump"]:
    await dumpPrismicTypeCommand(args, routeNamesExpanded);
    break;
  case COMMANDS["prismic:dump-all"]:
    await dumpAllPrismicTypeCommand();
    break;
  default:
    log.error("unknown command");
}

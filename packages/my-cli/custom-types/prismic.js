import { resolve } from "path";
import fetch from "node-fetch";
import { createError } from "@khokhlachev/utils";
import { readFileSync } from "fs";
import config from "../shared/config.js";

const { repoName } = config.prismic;
const API_TOKEN =
  process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN ||
  new Error("PRISMIC_CUSTOM_TYPES_API_TOKEN is undefined");

const error = createError("prismic-custom-type");

const resolvePrismicRoot = (...segments) =>
  resolve(config.prismic.rootDir, ...segments);

function fetchApi({ url, body, method }) {
  return fetch(url, {
    method: method || "GET",
    headers: {
      repository: repoName,
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });
}

function readCustomTypeFile(typeName) {
  try {
    return readFileSync(
      resolvePrismicRoot(`custom-types/${typeName}.json`),
      "utf-8"
    );
  } catch (err) {
    error(err);
  }
}

export async function getAllCustomTypes() {
  const res = await fetchApi({
    url: `https://customtypes.prismic.io/customtypes`,
  });

  if (res.status === 200) {
    return res.json();
  } else {
    return Promise.reject(res);
  }
}

export async function getCustomType(typeName) {
  const res = await fetchApi({
    url: `https://customtypes.prismic.io/customtypes/${typeName}`,
  });

  if (res.status === 200) {
    return res.json();
  } else {
    return Promise.reject(res);
  }
}

export async function insertCustomType(typeName) {
  const res = await fetchApi({
    url: "https://customtypes.prismic.io/customtypes/insert",
    body: readCustomTypeFile(typeName),
    method: "POST",
  });

  if (res.status === 201) {
    return res;
  } else if (res.status === 409) {
    return updateCustomType(typeName);
  } else {
    return Promise.reject(res);
  }
}

export async function updateCustomType(typeName) {
  const res = await fetchApi({
    url: "https://customtypes.prismic.io/customtypes/update",
    body: readCustomTypeFile(typeName),
    method: "POST",
  });

  if (res.status === 204) {
    return res;
  } else {
    return Promise.reject(res);
  }
}

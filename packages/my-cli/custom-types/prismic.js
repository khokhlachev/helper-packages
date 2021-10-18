import { resolve } from "path";
import fetch from "node-fetch";
import { createError } from "@khokhlachev/utils";
import checkEnv from "@khokhlachev/check-env";
import { readFileSync } from "fs";

const { repoName } = await import(resolve("./prismic.config.js"));

const error = createError("prismic-custom-type");

function fetchApi({ url, body, method }) {
  checkEnv.default(["PRISMIC_CUSTOM_TYPES_API_TOKEN"]);

  return fetch(url, {
    method: method || "GET",
    headers: {
      repository: repoName,
      Authorization: `Bearer ${process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });
}

function readCustomTypeFile(typeName) {
  try {
    return readFileSync(
      resolve(`lib/prismic/custom-types/${typeName}.json`),
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

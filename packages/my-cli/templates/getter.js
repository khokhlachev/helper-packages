import { snakeCase } from "change-case";

const graphqlQuery = ({
  pageName,
  param,
}) => `query ${pageName}($lang: String!${param ? `, $${param}: String!` : ""}) {
  page: ${snakeCase(pageName)}(lang: $lang${
  param ? `, ${param}: $${param}` : ""
}) {
    dummy
  }
}
`;

const graphqlGetter = ({ pageName, param }) => `
import { GetStaticPropsContext } from "next"
import graphqlQuery from "../graphql/query-graphql"
import tag from "graphql-tag"
import { getOptions } from "../utils"
import type { Client, ${pageName} } from "../types"

const query = tag\`${graphqlQuery({ pageName, param })}\`

export default async function get${pageName}(client: Client, context: GetStaticPropsContext) {
  const { page } = (await graphqlQuery(client, query, getOptions(context))) || {}

  return page as ${pageName} || null
}
`;

const prismicGetter = ({ pageName }) => `
import { GetStaticPropsContext } from "next"
import { getOptions } from "../utils"
import type { Client, ${pageName} } from "../types"

export default async function get${pageName}(client: Client, context: GetStaticPropsContext) {
  const { data } = (await client.getSingle("${snakeCase(
    pageName
  )}", getOptions(context))) || {}
  return data as ${pageName} || null
}
`;

const getter = ({ pageName, param, graphql }) =>
  graphql ? graphqlGetter({ pageName, param }) : prismicGetter({ pageName });

export default getter;

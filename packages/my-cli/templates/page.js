import { paramCase } from "change-case";

const pageTemplate = (pageName, { getStaticPaths, param } = {}) => `
import { GetStaticPropsContext, InferGetStaticPropsType${
  getStaticPaths ? ", GetStaticPaths" : ""
} } from "next"
import Page from "@/components/page-wrapper"
import { Client } from "@/lib/prismic"
import { get${pageName}, getSiteSettings } from "@/lib/prismic/getters"
import { NextSeo } from "next-seo"
import ${pageName} from "@/components/${paramCase(pageName)}";

export async function getStaticProps(
  context: GetStaticPropsContext${param ? `<{ ${param}: string }>` : ""}
) {
  const client = Client()

  const page = await get${pageName}(client, context)
  const siteSettings = await getSiteSettings(client, context)

  return {
    notFound: !page,
    props: {
      preview: !!context.preview,
      page: page || {},
      siteSettings: siteSettings || {},
    },
    revalidate: 60,
  }
}

${
  getStaticPaths
    ? `export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}`
    : ""
}

const ${pageName}Container = ({
  page,
  siteSettings,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Page settings={siteSettings}>
      <NextSeo
        title={page.seo_title}
        description={page.seo_description}
        openGraph={{
          images: page.open_graph_image && [
            {
              url: page.open_graph_image.url,
              width: page.open_graph_image?.dimensions?.width,
              height: page.open_graph_image?.dimensions?.height,
              alt: page.open_graph_image?.alt,
            },
          ],
        }}
      />
      <${pageName} {...page} />
    </Page>
  )
}

export default ${pageName}Container
`;

export default pageTemplate;

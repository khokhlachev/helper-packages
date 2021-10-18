import { capitalCase } from "change-case";

const customTypeTemplate = (typeName, { repeatable } = {}) => `
{
  "id": "${typeName}",
  "label": "${capitalCase(typeName)}",
  "repeatable": ${!!repeatable},
  "json": {
    "Main": {},
    "SEO ": {
      "seo_title": {
        "type": "Text",
        "config": {
          "label": "Title"
        }
      },
      "seo_description": {
        "type": "Text",
        "config": {
          "label": "Description"
        }
      },
      "open_graph_image": {
        "type": "Image",
        "config": {
          "constraint": {},
          "thumbnails": [],
          "label": "Open Graph: Image"
        }
      }
    }
  }
}
`;

export default customTypeTemplate;

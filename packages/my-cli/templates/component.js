export default function componentTemplate(componentName) {
  return `
import React from "react"
import type { ${componentName} as T${componentName} } from "@/lib/prismic/types"

type ${componentName}Props = T${componentName}
function ${componentName}({}: ${componentName}Props) {
  return (
    <div>${componentName}</div>
  )
}

export default ${componentName}
`;
}

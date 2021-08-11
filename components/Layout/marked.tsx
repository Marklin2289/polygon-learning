export const VERSION = "0.0.1"

/*
import CodeBlock from "./codeblock"
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import fs from "fs";
import matter from 'gray-matter'

export async function getStaticProps() {
    const content = fs.readFileSync("./pages/Layout/test.md")
    const postMetaDataSection = matter(content)
    const data = matter(content)
    return { props: { markdown: data.content } }
}

export default function Marked({ markdown }: {markdown: any}) {

export default function Marked({ markdown }: {markdown: any}) {
    const plugins = [gfm]
    return (
        <div style={{
            display:'flex', 
            flexDirection:'column', 
            margin:'auto', 
            marginTop:'30px', 
            padding: '10px',
            width: '600px',
            background: 'gainsboro',
            }}>
            <ReactMarkdown 
                children={markdown}
                // @ts-ignore
                plugins={plugins}
                renderers={{ code: CodeBlock }}
            />
        </div>
    )
}
*/

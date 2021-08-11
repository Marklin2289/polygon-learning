import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { a11yDark as theme } from 'react-syntax-highlighter/dist/cjs/styles/prism'

type CodeBlockT = {
    language: string | undefined
    value: any
}
const CodeBlock = ({ language, value }: CodeBlockT) => {
    return (
        <SyntaxHighlighter
            language={language}
            style={theme}
            wrapLines={true}
        >
            {value}
        </SyntaxHighlighter>
    )
}

export default CodeBlock

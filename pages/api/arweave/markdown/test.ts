import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs";
import matter from 'gray-matter'

export default async function(
  _req: NextApiRequest,
  res: NextApiResponse<string>
) {
    try {
        const content = fs.readFileSync("./pages/Layout/test.md")
        const data = matter(content)
        const markdown = data.content
        res.status(200).json(markdown)
    } catch (error) {
        console.error(error)
        res.status(500).json('transfer failed')
    }
}

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import viteSolid from 'vite-plugin-solid'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path));

const plugins = [
    viteSolid({
        ssr: true,
    })
]

export default {
    root,
    plugins
}

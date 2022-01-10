import { Metadata, StringifyMarkdownOptions, VFM } from '@vivliostyle/vfm'
import through2 from 'through2'
import stream from 'stream'
import type File from 'vinyl'
import PluginError from 'plugin-error'

const PLUGIN_NAME = 'gulp-vfm'

export type Options = {
  vfmOptions?: StringifyMarkdownOptions,
  vfmMetadata?: Metadata,
  extname?: string,
}

export type GulpVfmPlugin = (
  options?: Options,
) => stream.Transform

const plugin: GulpVfmPlugin = (options?) => {
  const processor = VFM(options?.vfmOptions, options?.vfmMetadata)

  return through2.obj((chunk, enc, cb) => {
    if (!isVinylFile(chunk)) {
      return cb(new PluginError(PLUGIN_NAME, 'Invalid usages'))
    }

    const source = chunk.contents!!.toString()
    const result = processor.processSync(source).toString()

    chunk.contents = Buffer.from(result)
    chunk.extname = options?.extname ?? '.html'
    return cb(null, chunk)
  })
}

function isVinylFile(chunk: any): chunk is File {
  return 'isNull' in chunk && 'isStream' in chunk && 'contents' in chunk
}

export default plugin
module.exports = plugin

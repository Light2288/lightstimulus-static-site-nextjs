import rss from './rss.mjs'
import completeUSDZExport from './resolve-usdz-export.mjs'

async function postbuild() {
  await completeUSDZExport()
  await rss()
}

postbuild()

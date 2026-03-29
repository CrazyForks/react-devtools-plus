/**
 * Babel transformation for source code location injection.
 *
 * Delegates to react-tracer's transform module and re-exports for
 * backward compatibility.
 */

import type { SourcePathMode } from '../config/types'
import {
  createSourceAttributePlugin as _createSourceAttributePlugin,
  shouldProcessFile as _shouldProcessFile,
  transformSourceCode as _transformSourceCode,
} from 'react-tracer/transform'

export { _createSourceAttributePlugin as createSourceAttributePlugin, _shouldProcessFile as shouldProcessFile }

/**
 * Transform source code with Babel.
 *
 * Wraps react-tracer's `transformSourceCode` with an `enableInjection` guard
 * to maintain backward compatibility with the existing plugin API.
 */
export function transformSourceCode(
  code: string,
  id: string,
  enableInjection: boolean,
  projectRoot: string,
  sourcePathMode: SourcePathMode,
): { code: string, map: any } | null {
  if (!enableInjection)
    return null

  return _transformSourceCode(code, id, projectRoot, sourcePathMode)
}

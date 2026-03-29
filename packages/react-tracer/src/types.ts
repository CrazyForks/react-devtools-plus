/**
 * Source path mode for code location injection
 */
export type SourcePathMode = 'absolute' | 'relative'

/**
 * Source position info: [source, line, column]
 */
export type PositionInfo = [
  source: string,
  line: number,
  column: number,
]

/**
 * Options for the ReactTracer build plugin
 */
export interface ReactTracerOptions {
  /**
   * Enable this plugin or not, or only enable in certain environment.
   *
   * @default 'dev'
   */
  enabled?: boolean | 'dev' | 'prod'

  /**
   * Configure the path format for source code location injection.
   * - 'absolute': Use absolute file paths
   * - 'relative': Use relative paths including project folder name
   *
   * @default 'relative'
   */
  sourcePathMode?: SourcePathMode

  /**
   * Configure which editor to open when clicking on source locations.
   *
   * @default 'code'
   */
  launchEditor?: string
}

export interface UserPluginView {
  title: string
  icon: string
  src: string
}

export interface UserPlugin {
  name: string
  view?: UserPluginView
}

export interface DevToolsPluginContext {
  tree: any
  selectedNodeId: string | null
  theme: any
  // We can add more RPC-like helpers here later if needed
}

export interface LoadedPlugin extends UserPlugin {
  component?: React.ComponentType<DevToolsPluginContext>
}

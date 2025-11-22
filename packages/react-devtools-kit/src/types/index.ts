export interface FiberNode {
  key: null | string
  elementType: any
  type: any
  stateNode: any
  child: FiberNode | null
  sibling: FiberNode | null
  return: FiberNode | null
  tag: number
  pendingProps: any
  memoizedProps: any
  memoizedState: any
  _debugSource?: {
    fileName: string
    lineNumber: number
    columnNumber: number
  }
}

export interface FiberRoot {
  current: FiberNode
  containerInfo?: any
}

export interface ComponentTreeNode {
  id: string
  name: string
  children: ComponentTreeNode[]
  meta?: {
    tag: number
  }
}

export type TreeListener = (tree: ComponentTreeNode | null) => void

export interface ReactDevToolsHook {
  renderers: Map<number, any>
  supportsFiber: boolean
  inject: (renderer: any) => number
  onCommitFiberRoot: (rendererID: number, root: FiberRoot) => void
  onCommitFiberUnmount: (rendererID: number, fiber: FiberNode) => void
  getFiberRoots?: (rendererID: number) => Set<FiberRoot>
  sub?: (event: string, fn: (...args: any[]) => void) => () => void
}

export const REACT_TAGS = {
  FunctionComponent: 0,
  ClassComponent: 1,
  IndeterminateComponent: 2,
  HostRoot: 3,
  HostComponent: 5,
  HostText: 6,
  Fragment: 7,
  Mode: 8,
  ContextConsumer: 9,
  ContextProvider: 10,
  ForwardRef: 11,
  SuspenseComponent: 13,
  MemoComponent: 14,
  SimpleMemoComponent: 15,
} as const

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: ReactDevToolsHook
  }
}

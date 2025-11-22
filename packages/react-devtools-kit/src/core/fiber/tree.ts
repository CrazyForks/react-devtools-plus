import type { ComponentTreeNode, FiberNode, FiberRoot } from '../../types'
import { REACT_TAGS } from '../../types'
import { getDisplayName, getFiberId, shouldIncludeFiber } from './utils'

const fiberRegistry = new Map<string, FiberNode>()

export function getFiberById(id: string): FiberNode | undefined {
  return fiberRegistry.get(id)
}

function collectVisibleChildren(fiber: FiberNode | null, showHostComponents: boolean, nodes: ComponentTreeNode[], visited: WeakSet<FiberNode>): void {
  let current = fiber

  while (current) {
    // Prevent infinite loops by tracking visited nodes
    if (visited.has(current)) {
      current = current.sibling
      continue
    }

    // If this fiber should be included, add it as a node
    if (shouldIncludeFiber(current, showHostComponents)) {
      visited.add(current)
      const treeChild = fiberToTree(current, showHostComponents, visited)
      if (treeChild) {
        nodes.push(treeChild)
      }
      // Don't traverse children here - fiberToTree already does that
    }
    else {
      // If this fiber shouldn't be included, traverse its children instead
      if (current.child) {
        collectVisibleChildren(current.child, showHostComponents, nodes, visited)
      }
    }
    current = current.sibling
  }
}

function fiberToTree(fiber: FiberNode, showHostComponents: boolean, visited: WeakSet<FiberNode>): ComponentTreeNode | null {
  if (!fiber)
    return null

  if (fiber.tag === REACT_TAGS.Mode || fiber.tag === REACT_TAGS.Fragment || fiber.tag === REACT_TAGS.HostRoot) {
    return null
  }

  const displayName = getDisplayName(fiber)
  const node: ComponentTreeNode = {
    id: getFiberId(fiber),
    name: displayName,
    children: [],
    meta: {
      tag: fiber.tag,
    },
  }
  fiberRegistry.set(node.id, fiber)

  // Collect children - pass the array directly to avoid intermediate allocations
  const childVisited = new WeakSet<FiberNode>()
  collectVisibleChildren(fiber.child, showHostComponents, node.children, childVisited)

  return node
}

export function buildTree(root: FiberRoot, showHostComponents: boolean): ComponentTreeNode | null {
  if (!root?.current)
    return null

  const current = root.current
  const visited = new WeakSet<FiberNode>()

  // Skip the host root itself and find the first meaningful component
  let fiber: FiberNode | null = current.child
  let depth = 0

  while (fiber && depth < 20) {
    depth++

    // Skip non-visible container nodes (Mode, Fragment, HostRoot)
    if (fiber.tag === REACT_TAGS.Mode || fiber.tag === REACT_TAGS.Fragment || fiber.tag === REACT_TAGS.HostRoot) {
      fiber = fiber.child || fiber.sibling
      continue
    }

    // Found a meaningful component
    if (shouldIncludeFiber(fiber, showHostComponents)) {
      const tree = fiberToTree(fiber, showHostComponents, visited)
      return tree
    }

    // If not included but has children, try children
    if (fiber.child) {
      fiber = fiber.child
      continue
    }

    fiber = fiber.sibling
  }

  return null
}

export function clearFiberRegistry() {
  fiberRegistry.clear()
}

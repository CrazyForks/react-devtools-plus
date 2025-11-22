# React DevTools 架构说明：RPC 的作用

## 架构概览

React DevTools 分为三个主要部分，运行在**不同的执行上下文**中：

```
┌─────────────────────────────────────────────────┐
│  主页面上下文 (Main Page Context)               │
│  - react-devtools-overlay                      │
│  - react-devtools-kit (hook 安装、树构建)      │
│  可以：访问主页面 DOM、React Fiber              │
└─────────────────────────────────────────────────┘
         ▲                    │
         │                    ▼
    ┌────┴────────────────────┴────┐
    │      RPC 通信层 (postMessage)  │
    └────┬────────────────────┬────┘
         │                    ▼
         │    ┌──────────────────────────────────┐
         │    │  iframe 上下文 (Isolated Context) │
         │    │  - react-devtools-client         │
         │    │  可以：UI 渲染、用户交互          │
         │    └──────────────────────────────────┘
         │
```

## 为什么需要 RPC？

### 1. **执行上下文隔离**

iframe 和主页面是**不同的 JavaScript 执行上下文**：

- 它们有**独立的全局对象**（window）
- 它们**不能直接访问**对方的变量、函数或 DOM
- 它们需要一种**跨上下文通信机制**

### 2. **能力边界不同**

**主页面（Overlay）可以：**

- ✅ 访问主应用的 React Fiber 树
- ✅ 操作主页面的 DOM 元素（如高亮）
- ✅ 监听 React 组件的更新
- ❌ 但不能渲染复杂的 DevTools UI（避免影响主应用性能）

**iframe（Client）可以：**

- ✅ 渲染复杂的 DevTools UI（隔离样式、不影响主应用）
- ✅ 处理用户交互（点击、输入等）
- ❌ 但不能直接访问主页面的 DOM 或 React Fiber

### 3. **职责分离**

```
主页面上下文              RPC 通信              iframe 上下文
────────────────────────────────────────────────────────────
react-devtools-kit  ──────►  数据  ──────►  react-devtools-client
  (数据收集)                  (序列化)            (UI 展示)

react-devtools-client ──────► 命令 ──────►  react-devtools-overlay
  (用户交互)                  (RPC 调用)          (DOM 操作)
```

## RPC 的具体作用

### 1. **Client → Overlay：命令调用**

当用户在 iframe 中操作时，需要主页面执行操作：

```typescript
// Client (iframe) 中
const rpc = getRpcClient()
rpc.highlightNode(node.id) // 调用主页面的高亮方法
rpc.rebuildTree(showHostComponents) // 重新构建树
```

```typescript
// Overlay (主页面) 中
createRpcServer({
  highlightNode(fiberId: string) {
    const fiber = getFiberById(fiberId)
    if (fiber) {
      highlightNode(fiber) // 在主页面上高亮 DOM
    }
  },
  rebuildTree(showHostComponents: boolean) {
    rebuildTree(showHostComponents) // 重新构建 Fiber 树
  },
})
```

### 2. **Overlay → Client：数据推送**

当主页面检测到 React 树变化时，需要通知 iframe：

```typescript
// Overlay (主页面) 中
onTreeUpdated((tree) => {
  const rpcServer = getRpcServer()
  rpcServer.broadcast.updateTree(tree) // 推送树数据到 iframe
})
```

```typescript
// Client (iframe) 中
createRpcClient({
  updateTree(newTree: any) {
    setTree(newTree) // 更新 UI 显示的树
  },
})
```

### 3. **通信机制实现**

RPC 底层使用 `postMessage` API 实现跨上下文通信：

```typescript
// iframe 客户端发送
window.parent.postMessage({
  event: '__REACT_DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY__',
  data: { method: 'highlightNode', args: ['fiber-123'] }
}, '*')

// 主页面服务器接收
window.addEventListener('message', (event) => {
  if (event.source === iframe.contentWindow) {
    // 调用实际的方法
    functions.highlightNode(...args)
  }
})
```

## 实际应用场景

### 场景 1：高亮组件

```
用户 hover 树节点
  ↓
Client 调用 rpc.highlightNode(fiberId)
  ↓
RPC 通过 postMessage 发送到主页面
  ↓
Overlay 执行 highlightNode(fiber)
  ↓
主页面 DOM 显示绿色高亮框
```

### 场景 2：切换显示选项

```
用户点击 "Show host components" 复选框
  ↓
Client 调用 rpc.rebuildTree(true)
  ↓
RPC 发送命令到主页面
  ↓
Overlay 重新构建 Fiber 树（包含 Host 组件）
  ↓
新树通过 onTreeUpdated 推送回 Client
  ↓
Client UI 更新显示
```

### 场景 3：树更新通知

```
React 组件状态变化
  ↓
react-devtools-kit 检测到变化
  ↓
重新构建树
  ↓
通过 onTreeUpdated 触发
  ↓
Overlay 通过 RPC 广播 updateTree(tree)
  ↓
Client 接收并更新 UI
```

## 总结

RPC 在这个架构中起到了**通信桥梁**的作用：

1. **跨上下文通信**：让 iframe 和主页面能够互相调用方法
2. **职责分离**：主页面负责数据收集和 DOM 操作，iframe 负责 UI 展示
3. **解耦设计**：通过 RPC 接口定义，两个模块可以独立开发和测试
4. **类型安全**：通过 TypeScript 定义 RPC 接口，确保调用安全

这种设计让 DevTools 既不影响主应用的性能（UI 在独立的 iframe 中），又能访问主页面的 React 数据和 DOM（通过 RPC 调用）。

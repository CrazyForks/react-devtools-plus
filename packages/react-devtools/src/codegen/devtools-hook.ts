/**
 * React DevTools Hook Code Generation
 *
 * The DevTools hook must be installed before React loads to properly
 * intercept React's registration with the hook.
 */

/**
 * Generate the DevTools global hook initialization code
 *
 * This code creates the __REACT_DEVTOOLS_GLOBAL_HOOK__ object the React
 * uses to communicate with DevTools. Must be injected before React loads.
 */
export function generateDevToolsHookCode(): string {
  return `
if (typeof window !== 'undefined' && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  (function() {
    var renderers = new Map();
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      __IS_OUR_MOCK__: true,
      checkDCE: function() {},
      supportsFiber: true,
      renderers: renderers,
      onScheduleFiberRoot: function() {},
      onCommitFiberRoot: function(rendererID, root, priorityLevel) {
        // This might be overwritten by bippy
      },
      onCommitFiberUnmount: function() {},
      inject: function(renderer) {
        var id = Math.random().toString(36).slice(2);
        renderers.set(id, renderer);
        return id;
      }
    };
  })();
}
`.trim()
}

/**
 * Generate inline script tag content for DevTools hook
 */
export function generateDevToolsHookScriptTag(): {
  tag: 'script'
  attrs: Record<string, string | boolean>
  children: string
  injectTo: 'head-prepend'
} {
  return {
    tag: 'script',
    attrs: {},
    children: generateDevToolsHookCode(),
    injectTo: 'head-prepend',
  }
}

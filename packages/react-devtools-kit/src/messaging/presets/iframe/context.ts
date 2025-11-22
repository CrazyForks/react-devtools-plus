let iframeServerContext: HTMLIFrameElement | null = null

export function setIframeServerContext(iframe: HTMLIFrameElement | null) {
  iframeServerContext = iframe
}

export function getIframeServerContext() {
  return iframeServerContext
}

export const __REACT_DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY = '__REACT_DEVTOOLS_KIT_IFRAME_MESSAGE__'

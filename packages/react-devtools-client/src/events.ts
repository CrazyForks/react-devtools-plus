type EventHandler<T = any> = (event: T) => void

class EventEmitter {
  private events: Map<string, Set<EventHandler>> = new Map()

  on<T = any>(type: string, handler: EventHandler<T>) {
    if (!this.events.has(type)) {
      this.events.set(type, new Set())
    }
    this.events.get(type)!.add(handler)
  }

  off<T = any>(type: string, handler: EventHandler<T>) {
    const handlers = this.events.get(type)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  emit<T = any>(type: string, event: T) {
    const handlers = this.events.get(type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event)
        }
        catch (e) {
          console.error('Error in event handler', e)
        }
      })
    }
  }
}

export const pluginEvents = new EventEmitter()

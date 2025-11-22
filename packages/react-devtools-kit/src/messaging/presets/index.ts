import { MergeableChannelOptions } from '../types/channel'
import { createBroadcastClientChannel } from './broadcast/client.js'
import { createBroadcastServerChannel } from './broadcast/server.js'
import { createIframeClientChannel } from './iframe/client.js'
import { createIframeServerChannel } from './iframe/server.js'

export type Presets = 'iframe' | 'broadcast'

export function getChannel(preset: Presets, host: 'client' | 'server' = 'client'): MergeableChannelOptions {
  const channels = {
    iframe: {
      client: createIframeClientChannel,
      server: createIframeServerChannel,
    },
    broadcast: {
      client: createBroadcastClientChannel,
      server: createBroadcastServerChannel,
    },
  }[preset]
  return channels[host]()
}

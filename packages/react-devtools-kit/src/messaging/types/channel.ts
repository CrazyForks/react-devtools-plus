export interface MergeableChannelOptions {
  post: (data: any) => void
  on: (handler: (data: any) => void) => void
}

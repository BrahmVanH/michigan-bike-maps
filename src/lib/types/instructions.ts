import type { s3Obj } from "."

export interface Config {
  sources: Source[]
}

type Source = {
  id: string,
  title: string,
  downloadSteps: DownloadStep[],
  
}

type DownloadStep = {
  imgKey?: string,
  text: string
}
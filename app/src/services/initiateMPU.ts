import { api } from "@/lib/api"
import axios from "axios"

export interface MPUPart {
  partNumber: number
  url: string
}

interface InitiateMPUParams {
  fileName: string
  totalChunks: number
}
interface InitiateMPUResponse {
  fileKey: string
  uploadId: string
  parts: MPUPart[]
}

export async function initiateMPU({
  fileName,
  totalChunks,
}: InitiateMPUParams) {
  const { data } = await api.post<InitiateMPUResponse>("/initiate-mpu", {
    fileName,
    totalChunks,
  })
  return data
}

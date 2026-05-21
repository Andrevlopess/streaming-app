import { api } from "@/lib/api"

interface AbortMPUParams {
  fileKey: string
  uploadId: string
}

export async function abortMPU({ fileKey, uploadId }: AbortMPUParams) {
  const { data } = await api.post("/abort-mpu", {
    fileKey,
    uploadId,
  })
  return data
}

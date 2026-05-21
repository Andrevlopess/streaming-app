import { api } from "@/lib/api"

interface UploadedPart {
  partNumber: number
  ETag: string
}

interface CompleteMPUParams {
  fileKey: string
  uploadId: string
  parts: UploadedPart[]
}

export async function completeMPU({ fileKey, parts, uploadId }: CompleteMPUParams) {
  const { data } = await api.post(
    "/complete-mpu",
    {
      fileKey,
      parts,
      uploadId,
    }
  )
  return data
}

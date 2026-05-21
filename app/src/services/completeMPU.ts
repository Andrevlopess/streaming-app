import axios from "axios"

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
  const { data } = await axios.post(
    "https://uvvjx7ffh5yw75lbwfpi45mz5e0nlsiw.lambda-url.us-east-1.on.aws/",
    {
      fileKey,
      parts,
      uploadId,
    }
  )
  return data
}

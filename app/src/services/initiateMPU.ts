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
  const { data } = await axios.post<InitiateMPUResponse>(
    "https://76mce5eramy6qvjkdflhxgin7y0dhulr.lambda-url.us-east-1.on.aws/",
    {
      fileName,
      totalChunks,
    }
  )
  return data
}

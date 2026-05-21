import { sleep } from "@/lib/utils"
import axios from "axios"

interface UploadChunkParams {
  signedUrl: string
  chunk: Blob
  maxRetries?: number
}

export async function uploadChunk({
  signedUrl,
  chunk,
  maxRetries = 3,
}: UploadChunkParams) {
  try {
    const { headers } = await axios.put(signedUrl, chunk, {
      headers: {
        "Content-Type": chunk.type,
      },
    })

    const ETag = headers["etag"]?.replace(/"/g, "") as string

    return { ETag }
  } catch (error) {
    if (maxRetries > 0) {
      await sleep(2000)
      return uploadChunk({ signedUrl, chunk, maxRetries: maxRetries - 1 })
    }
    throw error
  }
}

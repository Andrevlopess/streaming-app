import { api } from "@/lib/api"

interface GetPresignedUrlResponse {
  signedUrl: string
  success: string
}

export async function getPresignedUrl(file: File) {
  const { data } = await api.post<GetPresignedUrlResponse>(
    "/upload",
    {
      fileName: file.name,
    }
  )
  return data.signedUrl
}

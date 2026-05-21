import axios from "axios"

interface GetPresignedUrlResponse {
  signedUrl: string
  success: string
}

export async function getPresignedUrl(file: File) {
  const { data } = await axios.post<GetPresignedUrlResponse>(
    "https://6onk62eiwp6ohnzjrn5sluhotu0uggia.lambda-url.us-east-1.on.aws/",
    {
      fileName: file.name,
    }
  )
  return data.signedUrl
}

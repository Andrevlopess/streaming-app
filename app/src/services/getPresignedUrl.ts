import axios from "axios"

interface GetPresignedUrlResponse {
  signedUrl: string
  success: string
}

export async function getPresignedUrl(file: File) {
  const { data } = await axios.post<GetPresignedUrlResponse>(
    "https://4r5muwxabijej6k5qkd3y43no40gagdq.lambda-url.us-east-1.on.aws/",
    {
      fileName: file.name,
    }
  )
  return data.signedUrl
}

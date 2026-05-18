import axios from "axios"

export async function uploadFile(file: File, signedUrl: string, onProgress?: (progress:number) => void) {
  return await axios.put(signedUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
    onUploadProgress: ({total, loaded}) => {
        const percentage = Math.round((loaded * 100) / (total ?? 0))
        onProgress?.(percentage)
    }
  })
}

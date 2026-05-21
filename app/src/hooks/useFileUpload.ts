import { useState } from "react"
import { toast } from "sonner"
import { mbToBytes } from "../lib/utils"
import { abortMPU } from "../services/abortMPU"
import { completeMPU } from "../services/completeMPU"
import { initiateMPU } from "../services/initiateMPU"
import { uploadChunk } from "../services/uploadChunk"

import pLimit from 'p-limit'

export interface Upload {
  file: File
  progress: number
}

const LARGE_FILE_THRESHOLD_MB = 10;
const CHUNK_SIZE_MB = 5;
const MAX_CONCURRENTS_REQUESTS = 8;

export function useFileUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploads, setUploads] = useState<Upload[]>([])

  const throttler = pLimit(MAX_CONCURRENTS_REQUESTS);

  function addFiles(files: File[]) {
    setUploads((prev) =>
      prev.concat(files.map((file) => ({ file, progress: 0 })))
    )
  }

  function removeFile(index: number) {
    setUploads((prev) => prev.filter((_, i) => i !== index))
  }

  function updateProgress(index: number, progress: number) {
    setUploads((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], progress }
      return next
    })
  }

  async function handleMultiPartUpload(file: File, uploadIndex: number) {
    const chunkSize = mbToBytes(CHUNK_SIZE_MB)
    const totalChunks = Math.ceil(file.size / chunkSize)

    const { fileKey, uploadId, parts } = await initiateMPU({
      fileName: file.name,
      totalChunks,
    })

    try {
      let completedChunks = 0

      const uploadedParts = await Promise.all(
        parts.map(async ({ url, partNumber }, index) => {
          const chunkStart = index * chunkSize
          const chunkEnd = Math.min((index + 1) * chunkSize, file.size)
          const chunk = file.slice(chunkStart, chunkEnd)

          const { ETag } = await throttler(() => uploadChunk({ signedUrl: url, chunk }))

          completedChunks++
          updateProgress(
            uploadIndex,
            Math.round((completedChunks / totalChunks) * 100)
          )

          return { partNumber, ETag }
        })
      )

      await completeMPU({ fileKey, uploadId, parts: uploadedParts })
    } catch (error) {
      await abortMPU({ fileKey, uploadId })
      throw error
    }
  }

  async function upload() {
    try {
      setIsLoading(true)

      const [largeFiles, smallFiles] = uploads.reduce<[Upload[], Upload[]]>(
        ([large, small], item) =>
          item.file.size > mbToBytes(LARGE_FILE_THRESHOLD_MB)
            ? [[...large, item], small]
            : [large, [...small, item]],
        [[], []]
      )

      const mpuResults = await Promise.allSettled(
        largeFiles.map((upload) =>
          handleMultiPartUpload(upload.file, uploads.indexOf(upload))
        )
      )

      console.log(mpuResults);
      
      //   const [mpuResults, urlResults] = await Promise.all([
      //     // Large files — run all MPUs in parallel
      //     Promise.allSettled(
      //       uploads.map((upload) =>
      //         handleMultiPartUpload(upload.file, uploads.indexOf(upload))
      //       )
      //     ),
      //     // Small files — fetch all presigned URLs in parallel
      //     Promise.allSettled(
      //       smallFiles.map(async (upload) => ({
      //         url: await getPresignedUrl(upload.file),
      //         upload,
      //       }))
      //     ),
      //   ])

      //   const resolvedUrls = urlResults.flatMap((result) =>
      //     result.status === "fulfilled" ? [result.value] : []
      //   )

      //   const uploadResults = await Promise.allSettled(
      //     resolvedUrls.map(({ url, upload }) => {
      //       const originalIndex = uploads.indexOf(upload)
      //       return uploadFile(upload.file, url, (progress) =>
      //         updateProgress(originalIndex, progress)
      //       )
      //     })
      //   )

      //   uploadResults.forEach((result, i) => {
      //     const { file } = resolvedUrls[i].upload
      //     if (result.status === "rejected") {
      //       console.error(`Failed to upload file ${file.name}:`, result.reason)
      //     } else {
      //       console.log(`File ${file.name} uploaded successfully!`)
      //     }
      //   })

      setUploads([])
      toast.success("Upload completed!")
    } catch (error) {
      console.error("Unexpected error during upload:", error)
      toast.error("Something went wrong during upload.")
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, uploads, addFiles, removeFile, upload }
}

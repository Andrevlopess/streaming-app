import { Loader2, PackageOpen, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Button } from "./components/ui/button"
import { Progress } from "./components/ui/progress"
import { Toaster } from "./components/ui/sonner"
import { cn, mbToBytes } from "./lib/utils"
import { completeMPU } from "./services/completeMPU"
import { initiateMPU } from "./services/initiateMPU"
import { uploadChunk } from "./services/uploadChunk"
interface Upload {
  file: File
  progress: number
}

export function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploads, setUploads] = useState<Upload[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: (acceptedFiles) => {
      setUploads((prevUploads) =>
        prevUploads.concat(acceptedFiles.map((file) => ({ file, progress: 0 })))
      )
    },
  })

  function handleUploadRemove(index: number) {
    const newState = [...uploads]
    newState.splice(index, 1)
    setUploads(newState)
  }

  async function handleMultiPartUpload(file: File) {
    try {
      setIsLoading(true)

      const chunkSize = mbToBytes(5)
      const totalChunks = Math.ceil(file.size / chunkSize)

      const { fileKey, uploadId, parts } = await initiateMPU({
        fileName: file.name,
        totalChunks,
      })

      const uploadedeParts = await Promise.all(
        parts.map(async ({ url, partNumber }, index) => {
          const chunkStart = index * chunkSize
          const chunkEnd = Math.min((index + 1) * chunkSize, file.size)
          const chunk = file.slice(chunkStart, chunkEnd)


          const { ETag } = await uploadChunk({ signedUrl: url, chunk })
         
          return {
            partNumber: partNumber,
            ETag,
          }
        })
      )

      await completeMPU({
        fileKey,
        uploadId,
        parts: uploadedeParts,
      })
      console.log(fileKey, uploadId, parts)
    } catch (error) {
      console.error("Error occurred while initiating multipart upload:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpload() {
    try {
      setIsLoading(true)

      const mpuPromises = uploads.map(({ file }) => handleMultiPartUpload(file))

      const uploadsMPUs = await Promise.allSettled(mpuPromises)

      console.log(uploadsMPUs)

      // const largeFiles = uploads.filter(({ file }) => file.size > mbToBytes(10));
      // const urls = await Promise.all(
      //   uploads.map(async ({ file }) => ({
      //     url: await getPresignedUrl(file),
      //     file,
      //   }))
      // )

      // const uploadsResults = await Promise.allSettled(
      //   urls.map(async ({ url, file }, index) =>
      //     uploadFile(file, url, (progress) => {
      //       setUploads((prevUploads) => {
      //         const newState = [...prevUploads]
      //         newState[index] = { ...newState[index], progress }
      //         return newState
      //       })
      //     })
      //   )
      // )

      // uploadsResults.forEach((result, index) => {
      //   if (result.status === "rejected") {
      //     console.log(
      //       `Failed to upload file ${uploads[index].file.name}:`,
      //       result.reason
      //     )
      //   } else {
      //     console.log(`File ${uploads[index].file.name} uploaded successfully!`)
      //   }
      // })
      // setUploads([])
      toast.success("Upload completed!")
    } catch (error) {
      console.error("Error occurred while uploading files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Toaster />
      <div className="w-full max-w-xl">
        <div
          {...getRootProps()}
          className={cn(
            "flex h-60 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-400",
            isDragActive && "bg-accent/50"
          )}
        >
          <input {...getInputProps()} />
          <PackageOpen className="mb-2 size-10 stroke-1" />
          <span className="font-semibold">Drag & Drop files here</span>
          <small className="text-muted-foreground">Max file size 10MB.</small>
        </div>

        {uploads.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">
              Arquivos selecionados
            </h2>
            {uploads.map(({ file, progress }, index) => (
              <div
                key={file.name}
                className="mt-4 flex flex-col gap-4 rounded-md border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{file.name}</span>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleUploadRemove(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>

                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        )}

        <Button
          className="mt-4 w-full"
          onClick={handleUpload}
          disabled={!uploads.length || isLoading}
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Upload
        </Button>
      </div>
    </div>
  )
}

export default App

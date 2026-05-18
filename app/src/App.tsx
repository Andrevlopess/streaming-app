import { Loader2, PackageOpen, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "./components/ui/button"
import { cn } from "./lib/utils"
import { getPresignedUrl } from "./services/getPresignedUrl"
import { uploadFile } from "./services/uploadFile"
import { Progress } from "./components/ui/progress"
import { toast } from "sonner"
import { Toaster } from "./components/ui/sonner"
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

  async function handleUpload() {
    try {
      setIsLoading(true)

      const urls = await Promise.all(
        uploads.map(async ({ file }) => ({
          url: await getPresignedUrl(file),
          file,
        }))
      )

      const uploadsResults = await Promise.allSettled(
        urls.map(async ({ url, file }, index) =>
          uploadFile(file, url, (progress) => {
            setUploads((prevUploads) => {
              const newState = [...prevUploads]
              newState[index] = { ...newState[index], progress }
              return newState
            })
          })
        )
      )

      uploadsResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.log(
            `Failed to upload file ${uploads[index].file.name}:`,
            result.reason
          )
        } else {
          console.log(`File ${uploads[index].file.name} uploaded successfully!`)
        }
      })
      setUploads([])
      toast.success("Upload completed!")
    } catch (error) {
      console.error("Error occurred while uploading files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  
  return (
    <div className="flex min-h-svh p-6">
      <Toaster/>
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
          <span>Drop files here</span>
          <small className="text-muted-foreground">
            Apenas vídeos até 50mb
          </small>
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

import { Loader2 } from "lucide-react"
import { FileListItem } from "./components/file-list-item"
import { Button } from "./components/ui/button"
import { Toaster } from "./components/ui/sonner"
import { useFileUpload } from "./hooks/useFileUpload"
import { Dropzone } from "./components/dropzone"

export function App() {
  const { isLoading, uploads, addFiles, removeFile, upload } = useFileUpload()

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Toaster />
      <div className="w-full max-w-xl">
        <Dropzone onDrop={addFiles} />

        {uploads.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">
              Arquivos selecionados
            </h2>
            {uploads.map((upload, index) => (
              <FileListItem
                key={upload.file.name}
                upload={upload}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        )}

        <Button
          className="mt-4 w-full"
          onClick={upload}
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

import { cn } from "@/lib/utils"
import { PackageOpen } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface Props {
  onDrop: (files: File[]) => void
}

export function Dropzone({ onDrop }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: onDrop,
    getFilesFromEvent: async (event) => {
      if ("dataTransfer" in event && event.dataTransfer?.files?.length) {
        return Array.from(event.dataTransfer.files)
      }

      if ("target" in event && event.target instanceof HTMLInputElement) {
        return event.target.files ? Array.from(event.target.files) : []
      }

      return []
    },
    useFsAccessApi: false,
  })

  return (
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
  )
}

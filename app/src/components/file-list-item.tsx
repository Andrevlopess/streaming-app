import type { Upload } from "@/hooks/useFileUpload"
import { Trash2Icon } from "lucide-react"
import { Button } from "./ui/button"
import { Field, FieldLabel } from "./ui/field"
import { Progress } from "./ui/progress"
import { bytesToFormatter } from "@/lib/utils"

interface Props {
  upload: Upload
  onRemove: () => void
}

export function FileListItem({ upload, onRemove }: Props) {
  return (
    <div className="mt-4 flex flex-col gap-4 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm">{upload.file.name}</span>
          <small className="text-xs text-muted-foreground">
            {bytesToFormatter(upload.file.size)}
          </small>
        </div>
        <Button variant="destructive" size="icon" onClick={onRemove}>
          <Trash2Icon className="size-4" />
        </Button>
      </div>
      {/* {upload.progress > 0 && ( */}
      <Field className="w-full">
        <FieldLabel htmlFor="progress-upload">
          <span>Upload progress</span>
          <span className="ml-auto">{upload.progress}%</span>
        </FieldLabel>
        <Progress value={upload.progress} className="h-2" />
      </Field>
      {/* )} */}
    </div>
  )
}

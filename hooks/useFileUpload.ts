import { useState, useRef, useCallback } from "react"
import { uploadFileWithFallback, deleteUploadedFile, UploadedDoc, UploadOptions } from "@/lib/upload"

interface UseFileUploadOptions extends UploadOptions {
  onSuccess?: (doc: UploadedDoc) => void
  onError?: (error: string) => void
}

interface UseFileUploadReturn {
  uploading: boolean
  pending: UploadedDoc | null
  preview: UploadedDoc | null
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  confirm: () => UploadedDoc | null
  cancel: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [pending, setPending] = useState<UploadedDoc | null>(null)
  const [preview, setPreview] = useState<UploadedDoc | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setUploading(true)
      const result = await uploadFileWithFallback(file, {
        bucket: options.bucket,
        folder: options.folder,
      })
      setUploading(false)

      if (result.success && result.doc) {
        setPending(result.doc)
        setPreview(result.doc)
        options.onSuccess?.(result.doc)
      } else {
        options.onError?.(result.error || "Falha no upload")
      }

      if (fileInputRef.current) fileInputRef.current.value = ""
    },
    [options]
  )

  const confirm = useCallback(() => {
    const doc = pending
    setPending(null)
    setPreview(null)
    return doc
  }, [pending])

  const cancel = useCallback(() => {
    setPending(null)
    setPreview(null)
  }, [])

  return { uploading, pending, preview, handleSelect, confirm, cancel, fileInputRef }
}

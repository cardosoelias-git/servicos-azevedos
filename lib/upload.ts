export interface UploadedDoc {
  id: string
  name: string
  type: string
  url: string
  uploaded_at: string
}

export interface UploadOptions {
  bucket?: string
  folder?: string
}

export interface UploadResult {
  success: boolean
  doc?: UploadedDoc
  error?: string
}

export interface UploadModuleConfig {
  supabaseUrl?: string
  supabaseAnonKey?: string
  getSupabaseClient?: () => Promise<any>
  defaultBucket?: string
  defaultFolder?: string
}

let globalConfig: UploadModuleConfig = {}

export function configureUpload(config: UploadModuleConfig) {
  globalConfig = { ...globalConfig, ...config }
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

async function getSupabase() {
  if (globalConfig.getSupabaseClient) {
    return await globalConfig.getSupabaseClient()
  }
  const mod = await import("@/lib/supabase")
  return mod.supabase
}

export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const bucket = options.bucket || globalConfig.defaultBucket || "documentos"
  const folder = options.folder || globalConfig.defaultFolder || "uploads"

  try {
    const supabase = await getSupabase()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) {
      return { success: false, error: error.message }
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    const doc: UploadedDoc = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      url: urlData.publicUrl,
      uploaded_at: new Date().toISOString(),
    }

    return { success: true, doc }
  } catch (err: any) {
    return { success: false, error: err.message || "Falha no upload" }
  }
}

export async function uploadFileLocal(file: File): Promise<UploadResult> {
  try {
    const base64 = await toBase64(file)

    const doc: UploadedDoc = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      url: base64,
      uploaded_at: new Date().toISOString(),
    }

    return { success: true, doc }
  } catch (err: any) {
    return { success: false, error: err.message || "Falha no upload local" }
  }
}

export async function uploadFileWithFallback(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const supabase = await getSupabase()
  const bucket = options.bucket || globalConfig.defaultBucket || "documentos"
  const folder = options.folder || globalConfig.defaultFolder || "uploads"

  try {
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) throw new Error(error.message)

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    const doc: UploadedDoc = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      url: urlData.publicUrl,
      uploaded_at: new Date().toISOString(),
    }

    return { success: true, doc }
  } catch {
    return uploadFileLocal(file)
  }
}

export async function deleteUploadedFile(
  url: string,
  options: UploadOptions = {}
): Promise<boolean> {
  try {
    const supabase = await getSupabase()
    const bucket = options.bucket || globalConfig.defaultBucket || "documentos"
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split(`/${bucket}/`)
    if (pathParts.length < 2) return false

    const filePath = pathParts[1]
    const { error } = await supabase.storage.from(bucket).remove([filePath])
    return !error
  } catch {
    return false
  }
}

export function getFileIcon(type: string): "image" | "video" | "pdf" | "file" {
  if (type.startsWith("image/")) return "image"
  if (type.startsWith("video/")) return "video"
  if (type === "application/pdf") return "pdf"
  return "file"
}

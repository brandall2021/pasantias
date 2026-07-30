import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

const UPLOAD_DIR = join(process.cwd(), "uploads")

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params

  const safe = key.replace(/\.\.\//g, "").replace(/\.\.\\/g, "").replace(/\//g, "")
  if (!safe) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  try {
    const buffer = await readFile(join(UPLOAD_DIR, safe))
    const ext = safe.split(".").pop()?.toLowerCase() || ""
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      txt: "text/plain",
    }
    const contentType = mimeTypes[ext] || "application/octet-stream"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safe}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}

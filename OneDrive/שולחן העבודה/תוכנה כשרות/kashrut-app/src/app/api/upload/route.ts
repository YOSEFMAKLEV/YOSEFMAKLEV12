import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const folder = req.nextUrl.searchParams.get("folder") ?? "messages";
    // Whitelist folders to prevent path traversal
    const allowedFolders = ["messages", "raw-materials"];
    const safeFolder = allowedFolders.includes(folder) ? folder : "messages";

    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    await mkdir(uploadDir, { recursive: true });

    const saved: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "bin";
      const fname = `${randomBytes(8).toString("hex")}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, fname), buffer);
      saved.push(`/uploads/${safeFolder}/${fname}`);
    }

    return NextResponse.json({ paths: saved });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

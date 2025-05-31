import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket name (default: 'mugshots')
 * @returns The URL of the uploaded file or null if upload failed
 */
export async function uploadImage(
  file: File,
  bucket = "mugshots",
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      return { url: null, error: "File must be an image" }
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${fileName}`

    // Ensure the bucket exists (this is a client-side check)
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.name === bucket)

    if (!bucketExists) {
      // Fall back to the mugshots bucket which we know exists
      bucket = "mugshots"
    }

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type, // Ensure the correct content type is set
    })

    if (error) {
      return { url: null, error: "Failed to upload image. Please try again." }
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return { url: publicUrlData.publicUrl, error: null }
  } catch (error) {

    return { url: null, error: "An unexpected error occurred. Please try again." }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url The URL of the image to delete
 * @param bucket The storage bucket name (default: 'mugshots')
 * @returns Success status and error message if any
 */
export async function deleteImage(
  url: string,
  bucket = "mugshots",
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const filePath = pathParts[pathParts.length - 1]

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {

      return { success: false, error: "Failed to delete image." }
    }

    return { success: true, error: null }
  } catch (error) {

    return { success: false, error: "An unexpected error occurred." }
  }
}

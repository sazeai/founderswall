import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if the mugshots bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
     
      return NextResponse.json({ error: "Error in storage" }, { status: 500 })
    }

    const existingBuckets = buckets?.map((b) => b.name) || []
    const hasMugshotsBucket = existingBuckets.includes("mugshots")

    if (!hasMugshotsBucket) {
      
      return NextResponse.json(
        {
          error: "Could not Upload the image.",
          message: "Something went wrong",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Image is uploading",
      buckets: existingBuckets,
    })
  } catch (error) {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

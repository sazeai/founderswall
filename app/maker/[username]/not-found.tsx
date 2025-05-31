import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function MakerNotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Maker Not Found</h1>
        <p className="text-gray-300 mb-6">
          We couldn't find this maker in our database. They might be on the run or using an alias.
        </p>
        <div className="flex justify-center">
          <Link href="/" className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Mugshot Wall
          </Link>
        </div>
      </div>
    </div>
  )
}

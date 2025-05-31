"use client"
import Image from "next/image"
import { getMugshots } from "@/lib/mugshot-service"

export default function MugshotAvatars() {
  const mugshots = getMugshots()

  const handleAvatarClick = (id: string) => {
    // Show the full mugshot wall and scroll to the selected mugshot
    const mugshotWallContainer = document.getElementById("mugshot-wall-container")
    if (mugshotWallContainer) {
      mugshotWallContainer.classList.remove("hidden")
      document.body.style.overflow = "hidden"

      // Find the mugshot element and scroll to it
      setTimeout(() => {
        const mugshotElement = document.getElementById(`mugshot-${id}`)
        if (mugshotElement) {
          mugshotElement.scrollIntoView({ behavior: "smooth", block: "center" })

          // Add a highlight effect
          mugshotElement.classList.add("ring-4", "ring-yellow-400")
          setTimeout(() => {
            mugshotElement.classList.remove("ring-4", "ring-yellow-400")
          }, 2000)
        }
      }, 300)
    }
  }

  return (
    <div className="bg-white/10 rounded-md p-4">
      <h3 className="text-white text-xl mb-4 text-center">Featured Criminals</h3>

      <div className="grid grid-cols-4 gap-4">
        {mugshots.slice(0, 8).map((mugshot) => (
          <button key={mugshot.id} className="relative group" onClick={() => handleAvatarClick(mugshot.id)}>
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full overflow-hidden border-2 border-red-500">
              <Image
                src={mugshot.imageUrl || "/placeholder.svg"}
                alt={mugshot.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/70 text-white text-xs p-1 rounded">{mugshot.name}</div>
            </div>
          </button>
        ))}
      </div>

      <button
        className="w-full mt-4 py-2 bg-red-500/20 text-red-400 text-sm rounded"
        onClick={() => {
          const mugshotWallContainer = document.getElementById("mugshot-wall-container")
          if (mugshotWallContainer) {
            mugshotWallContainer.classList.remove("hidden")
            document.body.style.overflow = "hidden"
          }
        }}
      >
        View All Criminals
      </button>
    </div>
  )
}

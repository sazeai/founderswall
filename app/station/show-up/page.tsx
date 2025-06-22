"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Loader2, UploadCloud, Plus, Trash2, FileText } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"
type SupportType = "FEEDBACK" | "SOCIAL_SUPPORT" | "FIRST_TESTERS"
type LaunchStatus = "LAUNCHING" | "LAUNCHED"

export default function ShowUpPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [productName, setProductName] = useState("")
  const [description, setDescription] = useState("")
  const [launchDate, setLaunchDate] = useState<Date | undefined>(new Date())
  const [launchLinks, setLaunchLinks] = useState<{ label: string; url: string }[]>([])
  const [supportTypes, setSupportTypes] = useState<SupportType[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [status, setStatus] = useState<LaunchStatus>("LAUNCHING")
  const fileInputRef = useRef<HTMLInputElement>(null)


  useEffect(() => {
    const checkUserAndProfile = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirectedFrom=/station/show-up")
        return
      }
      setUser(user)

      // Check for mugshot profile
      try {
        const response = await fetch("/api/user/mugshot-check")
        const data = await response.json()

        if (!data.hasMugshot) {
          router.push("/station/get-arrested?notice=profile_required")
          return
        }
      } catch (e) {
        console.error("Failed to check mugshot", e)
        setError("Could not verify your profile. Please try again.")
      }

      setLoading(false)
    }
    checkUserAndProfile()
  }, [supabase, router])

  const handleSupportTypeChange = (type: SupportType) => {
    setSupportTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError("Logo size must be less than 1MB")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddLink = () => {
    setLaunchLinks([...launchLinks, { label: "", url: "" }])
  }
  const handleRemoveLink = (idx: number) => {
    setLaunchLinks(launchLinks.filter((_, i) => i !== idx))
  }
  const handleLinkChange = (idx: number, field: "label" | "url", value: string) => {
    if (field === "url") {
      // Remove spaces, commas, and extra colons
      let sanitized = value.replace(/[,\s]/g, "");
      // Only allow one colon (for https://)
      const colonCount = (sanitized.match(/:/g) || []).length;
      if (colonCount > 1) {
        // Remove extra colons after the first
        const firstColonIdx = sanitized.indexOf(":");
        sanitized = sanitized.slice(0, firstColonIdx + 1) + sanitized.slice(firstColonIdx + 1).replace(/:/g, "");
      }
      // Ensure it starts with https://
      if (!sanitized.startsWith("https://")) {
        sanitized = "https://" + sanitized.replace(/^https?:\/\//, "");
      }
      setLaunchLinks(launchLinks.map((link, i) => i === idx ? { ...link, [field]: sanitized } : link))
    } else {
      setLaunchLinks(launchLinks.map((link, i) => i === idx ? { ...link, [field]: value } : link))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setError(null)
    
    let imageUrl = ""
    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('mugshots')
            .upload(fileName, imageFile)

        if (uploadError) {
            setError(`Failed to upload image: ${uploadError.message}`)
            setSubmitting(false)
            return
        }
        
        const { data: urlData } = supabase.storage.from('mugshots').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
    }


    const launchData = {
      user_id: user.id,
      product_name: productName,
      description,
      launch_date: launchDate?.toISOString(),
      launch_links: launchLinks.filter(l => l.label && l.url),
      support_types: supportTypes,
      image_url: imageUrl,
      status: status,
    }
    const response = await fetch('/api/uplift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launchData)
    })

    if (response.ok) {
        router.push(`/uplift`)
    } else {
        const { error } = await response.json()
        setError(error || "Failed to submit launch.")
    }

    setSubmitting(false)
  }
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-white" /></div>
  }

  return (
    <div className="min-h-screen  text-white">
        <div className="container mx-auto p-2 md:p-8">
            <div className="flex justify-end max-w-2xl mx-auto mb-4">
                <Link href="/station/support-needed">
                    <Button className="bg-green-700 hover:bg-green-800 text-white font-semibold shadow rounded-lg">
                        Manage Support Requests
                    </Button>
                </Link>
            </div>
            <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6 uppercase text-red-500 w-full ">SUBMIT YOUR LAUNCH TO SEEK SUPPORT </h2>
                <p className="text-center text-gray-400 text-sm w-full mb-4">
                    This feature is designed to foster a culture of mutual support, do not submit your launch if you are not seeking support, instead go to <Link href="/station/submit-launch" className="text-red-500">submit-launch</Link> page to submit your normal launch.
                </p>
                </div>
            <div className="max-w-4xl mx-auto bg-gray-800 border-2 border-gray-700 rounded-xl p-8 shadow-lg">
                

                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <Label htmlFor="status-toggle" className="text-gray-300 font-bold">Mark as Launched</Label>
                            <p className="text-xs text-gray-400">Enable this on your launch day to make your launch links visible immediately. Your request will be visible to the community at /uplift page</p>
                        </div>
                        <Switch
                            id="status-toggle"
                            checked={status === 'LAUNCHED'}
                            onCheckedChange={(checked) => setStatus(checked ? 'LAUNCHED' : 'LAUNCHING')}
                        />
                    </div>
                    <div>
                        <Label htmlFor="productName" className="text-gray-300">Product Name</Label>
                        <Input id="productName" value={productName} onChange={e => setProductName(e.target.value)} required className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" placeholder="e.g. Indie SaaS, TinyStartups, etc." />
                    </div>
                    <div>
                        <Label htmlFor="description" className="text-gray-300">Short Description (max 200 chars)</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} maxLength={200} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400" placeholder="What are you building? Who is it for?" />
                    </div>
                    <div>
                        <Label className="text-gray-300">Launch Date</Label>
                        <Calendar mode="single" selected={launchDate} onSelect={setLaunchDate} className="rounded-md border-gray-600 bg-gray-700 text-white"
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                    </div>
                    <div>
                        <Label className="text-gray-300">Launch Platform Links</Label>
                        <div className="space-y-2">
                          {launchLinks.map((link, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input
                                placeholder="Label (e.g. Product Hunt, Website)"
                                value={link.label}
                                onChange={e => handleLinkChange(idx, "label", e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white w-1/3 placeholder-gray-400"
                                required
                              />
                              <Input
                                placeholder="URL (https://yourlaunch.com)"
                                value={link.url}
                                onChange={e => handleLinkChange(idx, "url", e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white w-2/3 placeholder-gray-400"
                                required
                              />
                              <button type="button" onClick={() => handleRemoveLink(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={handleAddLink} className="flex items-center gap-1 text-green-400 hover:text-green-600 mt-2"><Plus className="w-4 h-4" />Add Link</button>
                          <div className="text-xs text-gray-400 mt-1">Add all the platforms where you'll launch (e.g. Product Hunt, Indie Hackers, etc.)</div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-gray-300">Requested Support</Label>
                        <div className="space-y-2">
                           { (['FEEDBACK', 'SOCIAL_SUPPORT', 'FIRST_TESTERS'] as SupportType[]).map(type => (
                                <div key={type} className="flex flex-col space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id={type} onCheckedChange={() => handleSupportTypeChange(type)} className="border-gray-500" />
                                    <Label htmlFor={type} className="capitalize text-gray-300">{type.replace('_', ' ').toLowerCase()}</Label>
                                  </div>
                                  {type === 'FEEDBACK' && (
                                    <span className="text-xs text-gray-400 ml-6">e.g. upvoting, reviewing on platforms, giving constructive feedback</span>
                                  )}
                                  {type === 'SOCIAL_SUPPORT' && (
                                    <span className="text-xs text-gray-400 ml-6">e.g. sharing on social media, telling your network</span>
                                  )}
                                  {type === 'FIRST_TESTERS' && (
                                    <span className="text-xs text-gray-400 ml-6">e.g. trying the product, reporting bugs, giving early feedback</span>
                                  )}
                                </div>
                           )) }
                        </div>
                    </div>
                   
                    <div>
                      <Label className="text-gray-300">Product Logo</Label>
                       <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer bg-gray-900" onClick={() => fileInputRef.current?.click()}>
                           <div className="space-y-1 text-center">
                               {imagePreview ? <img src={imagePreview} alt="preview" className="mx-auto h-20 w-20 object-cover rounded-md border border-gray-700 bg-white" /> : <UploadCloud className="mx-auto h-10 w-10 text-gray-500" />}
                               <div className="flex text-sm text-gray-400">
                                   <p className="pl-1">Click to upload or drag and drop your logo</p>
                               </div>
                               <p className="text-xs text-gray-400">Upload a square logo (PNG/JPG), max 1MB</p>
                           </div>
                           <Input id="file-upload" ref={fileInputRef} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png,image/jpeg,image/jpg" />
                       </div>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Evidence
                    </Button>
                </form>
            </div>
            {/* Info Section: Why this feature? */}
            <div className="mt-8 md:mt-12 bg-black text-white border-2 border-gray-700 rounded-lg p-4 md:p-6 transform rotate-1">
              <div className="text-center">
                <FileText className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
                <h3 className="text-lg md:text-xl font-bold font-stencil mb-2">Why the Launch Alliance?</h3>
                <p className="font-handwritten text-base md:text-lg break-words">
                  This feature is designed to foster a culture of mutual support among early-stage founders. By sharing your upcoming launch, you invite the community to back you on launch day whether that's with feedback, social shares, or first users. In return, you pledge to support others when their time comes. It's a win-win for everyone building in public.
                </p>
                <div className="mt-4 text-xs md:text-sm font-mono break-words text-left max-w-2xl mx-auto">
                  <div className="mb-2">
                    <span className="font-bold text-yellow-300">If you're seeking support:</span> Add your product, set your launch date, and specify the kind of help you need. On launch day, your links will be visible to the alliance for maximum impact.
                  </div>
                  <div className="mb-2">
                    <span className="font-bold text-green-300">If you're pledging support:</span> Opt in to support launches you believe in. On launch day, you'll get access to the launch links and can help by upvoting, sharing, or giving feedback. Your support will be remembered, and the community will have your back when you launch.
                  </div>
                  <div className="mb-2">
                    <span className="font-bold text-blue-300">Mutual benefit:</span> The more you give, the more you get. This alliance is about founders helping founders, building momentum together, and making every launch a little less lonely.
                  </div>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}

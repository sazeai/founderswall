"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Loader2, UploadCloud, Plus, Trash2 } from "lucide-react"

type SupportType = "FEEDBACK" | "SOCIAL_SUPPORT" | "FIRST_TESTERS"
type LaunchStatus = "LAUNCHING" | "LAUNCHED"

export default function EditLaunchPage() {
  const router = useRouter()
  const params = useParams()
  const launchId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [productName, setProductName] = useState("")
  const [description, setDescription] = useState("")
  const [launchDate, setLaunchDate] = useState<Date | undefined>(new Date())
  const [launchLinks, setLaunchLinks] = useState<{ label: string; url: string }[]>([])
  const [supportTypes, setSupportTypes] = useState<SupportType[]>([])
  const [status, setStatus] = useState<LaunchStatus>("LAUNCHING")

  useEffect(() => {
    if (!launchId) return;
    
    const fetchLaunchData = async () => {
        setLoading(true);
        const response = await fetch(`/api/uplift/${launchId}`);
        if (response.ok) {
            const data = await response.json();
            setProductName(data.product_name);
            setDescription(data.description || "");
            setLaunchDate(data.launch_date ? new Date(data.launch_date) : undefined);
            if (Array.isArray(data.launch_links)) {
              setLaunchLinks(data.launch_links)
            } else if (typeof data.launch_links === 'object' && data.launch_links !== null) {
              setLaunchLinks(Object.entries(data.launch_links).map(([label, url]) => ({ label, url })))
            } else if (typeof data.launch_links === 'string' && data.launch_links.trim() !== '') {
              setLaunchLinks([{ label: 'Link', url: data.launch_links }])
            } else {
              setLaunchLinks([])
            }
            setSupportTypes(data.support_types || []);
            setStatus(data.status || "LAUNCHING");
        } else {
            setError("Failed to load launch data. You may not have permission to edit this launch.");
        }
        setLoading(false);
    }
    
    fetchLaunchData();
  }, [launchId])

  const handleSupportTypeChange = (type: SupportType) => {
    setSupportTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
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
    setSubmitting(true)
    setError(null)

    const launchData = {
      product_name: productName,
      description,
      launch_date: launchDate?.toISOString(),
      launch_links: launchLinks.filter(l => l.label && l.url),
      support_types: supportTypes,
      status: status,
      // Note: Image editing is not included in this form for simplicity.
    }
    
    const response = await fetch(`/api/uplift/${launchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launchData)
    })

    if (response.ok) {
        router.push(`/station/support-needed?updated=${launchId}`)
        router.refresh() // To ensure the management page shows updated data
    } else {
        const { error } = await response.json()
        setError(error || "Failed to update launch.")
    }

    setSubmitting(false)
  }
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900"><Loader2 className="animate-spin text-white" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto bg-gray-800 border-2 border-gray-700 rounded-xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6 uppercase text-red-500 stamped-text">Edit Your Launch</h1>
                {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                         <div>
                             <Label htmlFor="status-toggle" className="text-gray-300 font-bold">Mark as Launched</Label>
                             <p className="text-xs text-gray-400">Enable this on your launch day to make your launch links visible.</p>
                         </div>
                         <Switch
                             id="status-toggle"
                             checked={status === 'LAUNCHED'}
                             onCheckedChange={(checked) => setStatus(checked ? 'LAUNCHED' : 'LAUNCHING')}
                         />
                     </div>
                    <div>
                        <Label htmlFor="productName" className="text-gray-300">Product Name</Label>
                        <Input id="productName" value={productName} onChange={e => setProductName(e.target.value)} required className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                        <Label htmlFor="description" className="text-gray-300">Short Description (max 200 chars)</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} maxLength={200} className="bg-gray-700 border-gray-600 text-white" />
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
                                className="bg-gray-700 border-gray-600 text-white w-1/3"
                                required
                              />
                              <Input
                                placeholder="URL (https://...)"
                                value={link.url}
                                onChange={e => handleLinkChange(idx, "url", e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white w-2/3"
                                required
                              />
                              <button type="button" onClick={() => handleRemoveLink(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={handleAddLink} className="flex items-center gap-1 text-green-400 hover:text-green-600 mt-2"><Plus className="w-4 h-4" />Add Link</button>
                        </div>
                    </div>
                    <div>
                        <Label className="text-gray-300">Requested Support</Label>
                        <div className="space-y-2">
                           { (["FEEDBACK", "SOCIAL_SUPPORT", "FIRST_TESTERS"] as SupportType[]).map(type => (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox id={type} checked={supportTypes.includes(type)} onCheckedChange={() => handleSupportTypeChange(type)} className="border-gray-500" />
                                    <Label htmlFor={type} className="capitalize text-gray-300">{type.replace('_', ' ').toLowerCase()}</Label>
                                </div>
                           )) }
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Note: To change the product image, please re-submit the launch.</p>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </div>
        </div>
    </div>
  )
}

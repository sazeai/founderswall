import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

async function getLaunchesByUserId(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('launches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching launches:', error);
        return [];
    }
    return data;
}

export default async function SupportNeededPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        notFound()
    }

    const launches = await getLaunchesByUserId(user.id);

    return (
        <div className="min-h-screen  text-white">
            <div className="container mx-auto p-4 md:p-8">
               
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8 uppercase text-red-500 stamped-text">Manage Your Launches</h1>
                    
                    {launches.length === 0 ? (
                        <div className="text-center bg-gray-800 p-8 rounded-lg border-2 border-gray-700">
                            <p className="mb-4 text-lg text-gray-200">You haven't requested any support yet.<br/>Get your product the boost it deserves!</p>
                            <Link href="/station/show-up">
                                <Button className="bg-red-600 hover:bg-red-700 font-semibold">Request Support</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {launches.map((launch) => (
                                <div key={launch.id} className="bg-gray-800 border-2 border-gray-700 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={launch.image_url || "/images/mugshots/placeholder.png"}
                                            alt={launch.product_name}
                                            width={64}
                                            height={64}
                                            className="rounded-md object-cover border-2 border-gray-600"
                                        />
                                        <div>
                                            <h2 className="font-bold text-xl">{launch.product_name}</h2>
                                            <p className={`text-sm ${launch.status === 'LAUNCHED' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                Status: {launch.status}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/station/support-needed/${launch.id}/edit`}>
                                        <Button variant="outline" className="text-white border-gray-500 hover:bg-gray-700">Edit</Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 
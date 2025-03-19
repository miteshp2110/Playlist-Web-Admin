"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PlusIcon, Loader2Icon, ImageIcon } from "lucide-react"
import { fetchArtists, addArtist } from "@/lib/api"

interface Artist {
  id: number
  name: string
  profile_image: string
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [newArtistName, setNewArtistName] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const loadArtists = async () => {
    setIsLoading(true)
    try {
      const data = await fetchArtists()
      setArtists(data)
    } catch (error) {
      console.error("Error loading artists:", error)
      toast({
        title: "Error",
        description: "Failed to load artists",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadArtists()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newArtistName.trim() || !selectedImage) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", newArtistName)
      formData.append("profile_image", selectedImage)

      await addArtist(formData)
      toast({
        title: "Success",
        description: "Artist added successfully",
      })
      setNewArtistName("")
      setSelectedImage(null)
      setPreviewUrl(null)
      loadArtists()
    } catch (error) {
      console.error("Error adding artist:", error)
      toast({
        title: "Error",
        description: "Failed to add artist",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Artists</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Artist</CardTitle>
              <CardDescription>Add a new artist with profile image</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddArtist} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Artist name"
                    value={newArtistName}
                    onChange={(e) => setNewArtistName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div
                      className="relative h-24 w-24 cursor-pointer rounded-md border border-dashed border-gray-300 flex items-center justify-center"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview"
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Profile Image</p>
                      <p className="text-xs text-muted-foreground">Upload a profile image for the artist</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose Image
                      </Button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !newArtistName.trim() || !selectedImage}
                >
                  {isSubmitting ? (
                    <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlusIcon className="h-4 w-4 mr-2" />
                  )}
                  Add Artist
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Artists List</CardTitle>
              <CardDescription>All available artists</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : artists.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No artists found. Add your first artist.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artists.map((artist) => (
                      <TableRow key={artist.id}>
                        <TableCell>{artist.id}</TableCell>
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={artist.profile_image} alt={artist.name} />
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>{artist.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div style={{height:"200px",width:"100%" ,marginBottom:"50px",backgroundColor:"none"}}></div>
    </DashboardLayout>
  )
}


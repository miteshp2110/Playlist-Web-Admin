"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
  PlusIcon,
  Loader2Icon,
  ImageIcon,
  FileAudioIcon,
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { fetchLanguages, fetchGenres, fetchArtists, addSong, fetchSongs, formatDuration } from "@/lib/api"
import { useMobile } from "@/hooks/use-mobile"

interface Language {
  id: number
  name: string
}

interface Genre {
  id: number
  name: string
}

interface Artist {
  id: number
  name: string
  profile_image: string
}

interface Song {
  id: number
  name: string
  language: number
  genere: number
  artist: number
  song_image_url: string
  song_url: string
  duration: number
}

export default function SongsPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingSongs, setIsFetchingSongs] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isMobile = useMobile()
  const { toast } = useToast()

  // Form state
  const [songName, setSongName] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")
  const [selectedArtist, setSelectedArtist] = useState("")
  const [songImage, setSongImage] = useState<File | null>(null)
  const [songFile, setSongFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [songFileName, setSongFileName] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const loadSongs = async (page = 1) => {
    setIsFetchingSongs(true)
    try {
      // Add a small delay to respect rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300))

      const data = await fetchSongs(page, 10)
      setSongs(data)

      // For now, we'll just assume there might be more pages if we get a full page of results
      // In a real app, you'd want to get the total count from the API
      setTotalPages(data.length === 10 ? page + 1 : page)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading songs:", error)
      toast({
        title: "Error",
        description: "Failed to load songs. API rate limit may have been reached.",
        variant: "destructive",
      })
    } finally {
      setIsFetchingSongs(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [languagesData, genresData, artistsData] = await Promise.all([
          fetchLanguages(),
          fetchGenres(),
          fetchArtists(),
        ])
        setLanguages(languagesData)
        setGenres(genresData)
        setArtists(artistsData)

        // Load songs after other data is loaded
        await loadSongs(1)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSongImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSongFile(file)
      setSongFileName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!songName.trim() || !selectedLanguage || !selectedGenre || !selectedArtist || !songImage || !songFile) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields and upload both image and song file",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", songName)
      formData.append("language", selectedLanguage)
      formData.append("genere", selectedGenre)
      formData.append("artist", selectedArtist)
      formData.append("song_image", songImage)
      formData.append("song", songFile)

      await addSong(formData)
      toast({
        title: "Success",
        description: "Song added successfully",
      })

      // Reset form
      setSongName("")
      setSelectedLanguage("")
      setSelectedGenre("")
      setSelectedArtist("")
      setSongImage(null)
      setSongFile(null)
      setImagePreview(null)
      setSongFileName(null)

      // Reload songs to show the new one
      await loadSongs(1)
    } catch (error) {
      console.error("Error adding song:", error)
      toast({
        title: "Error",
        description: "Failed to add song",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePlayPause = (songId: number, songUrl: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.addEventListener("ended", () => {
        setCurrentlyPlaying(null)
      })
    }

    if (currentlyPlaying === songId) {
      // Pause current song
      audioRef.current.pause()
      setCurrentlyPlaying(null)
    } else {
      // Play new song
      if (currentlyPlaying !== null) {
        audioRef.current.pause()
      }
      audioRef.current.src = songUrl
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error)
        toast({
          title: "Playback Error",
          description: "Could not play the audio file",
          variant: "destructive",
        })
      })
      setCurrentlyPlaying(songId)
    }
  }

  const getLanguageName = (id: number) => {
    const language = languages.find((lang) => lang.id === id)
    return language ? language.name : "Unknown"
  }

  const getGenreName = (id: number) => {
    const genre = genres.find((g) => g.id === id)
    return genre ? genre.name : "Unknown"
  }

  const getArtistName = (id: number) => {
    const artist = artists.find((a) => a.id === id)
    return artist ? artist.name : "Unknown"
  }

  const handlePrevPage = () => {
    if (currentPage > 1 && !isFetchingSongs) {
      loadSongs(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages && !isFetchingSongs) {
      loadSongs(currentPage + 1)
    }
  }

  return (
    <>
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-accent">Songs</h1>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-accent">Add New Song</CardTitle>
            <CardDescription>Upload a new song with details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2Icon className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="song-name">Song Name</Label>
                  <Input
                    id="song-name"
                    placeholder="Enter song name"
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                    disabled={isSubmitting}
                    className="border-primary-light focus:border-accent"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isSubmitting}>
                      <SelectTrigger id="language" className="border-primary-light focus:border-accent">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.id} value={language.id.toString()}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre} disabled={isSubmitting}>
                      <SelectTrigger id="genre" className="border-primary-light focus:border-accent">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre.id} value={genre.id.toString()}>
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist</Label>
                    <Select value={selectedArtist} onValueChange={setSelectedArtist} disabled={isSubmitting}>
                      <SelectTrigger id="artist" className="border-primary-light focus:border-accent">
                        <SelectValue placeholder="Select artist" />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id.toString()}>
                            {artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Song Cover Image</Label>
                    <div
                      className="relative h-32 w-full cursor-pointer rounded-md border border-dashed border-primary-light flex items-center justify-center"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="h-8 w-8 text-accent" />
                          <p className="mt-2 text-sm text-inactive-grey">Click to upload image</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Song Audio File</Label>
                    <div
                      className="relative h-32 w-full cursor-pointer rounded-md border border-dashed border-primary-light flex items-center justify-center"
                      onClick={() => audioInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <FileAudioIcon className="h-8 w-8 text-accent" />
                        <p className="mt-2 text-sm text-inactive-grey">{songFileName || "Click to upload MP3"}</p>
                      </div>
                    </div>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/mp3,audio/mpeg"
                      className="hidden"
                      onChange={handleAudioChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={
                    isSubmitting ||
                    !songName.trim() ||
                    !selectedLanguage ||
                    !selectedGenre ||
                    !selectedArtist ||
                    !songImage ||
                    !songFile
                  }
                >
                  {isSubmitting ? (
                    <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlusIcon className="h-4 w-4 mr-2" />
                  )}
                  Add Song
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-accent">Songs List</CardTitle>
            <CardDescription>All uploaded songs</CardDescription>
          </CardHeader>
          <CardContent>
            {isFetchingSongs ? (
              <div className="flex justify-center py-4">
                <Loader2Icon className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : songs.length === 0 ? (
              <p className="text-center text-inactive-grey py-4">No songs found. Add your first song.</p>
            ) : isMobile ? (
              // Mobile view for songs
              <div className="song-table-mobile">
                {songs.map((song) => (
                  <div key={song.id} className="song-row bg-light-surface">
                    <div className="song-header">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayPause(song.id, song.song_url)}
                          aria-label={currentlyPlaying === song.id ? "Pause" : "Play"}
                          className="text-accent hover:text-accent/80"
                        >
                          {currentlyPlaying === song.id ? (
                            <PauseIcon className="h-5 w-5" />
                          ) : (
                            <PlayIcon className="h-5 w-5" />
                          )}
                        </Button>
                        <img
                          src={song.song_image_url || "/placeholder.svg"}
                          alt={song.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div>
                          <h3 className="font-medium">{song.name}</h3>
                          <p className="text-sm text-inactive-grey">{getArtistName(song.artist)}</p>
                        </div>
                      </div>
                      <div className="text-sm text-inactive-grey">{formatDuration(song.duration)}</div>
                    </div>
                    <div className="song-details">
                      <div className="song-detail-item">
                        <span className="song-detail-label">Language</span>
                        <span>{getLanguageName(song.language)}</span>
                      </div>
                      <div className="song-detail-item">
                        <span className="song-detail-label">Genre</span>
                        <span>{getGenreName(song.genere)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view for songs
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {songs.map((song) => (
                      <TableRow key={song.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayPause(song.id, song.song_url)}
                            aria-label={currentlyPlaying === song.id ? "Pause" : "Play"}
                            className="text-accent hover:text-accent/80"
                          >
                            {currentlyPlaying === song.id ? (
                              <PauseIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <img
                            src={song.song_image_url || "/placeholder.svg"}
                            alt={song.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{song.name}</TableCell>
                        <TableCell>{getArtistName(song.artist)}</TableCell>
                        <TableCell>{getLanguageName(song.language)}</TableCell>
                        <TableCell>{getGenreName(song.genere)}</TableCell>
                        <TableCell>{formatDuration(song.duration)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isFetchingSongs}
              className="border-primary-light text-accent hover:bg-primary-light"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-inactive-grey">Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isFetchingSongs}
              className="border-primary-light text-accent hover:bg-primary-light"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    <div style={{height:"200px",width:"100%" ,marginBottom:"50px",backgroundColor:"none"}}></div>
    </DashboardLayout>
    </>
  )
}


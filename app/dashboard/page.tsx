"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { GlobeIcon, TagIcon, UsersIcon, FileAudioIcon } from "lucide-react"
import { fetchLanguages, fetchGenres, fetchArtists, fetchSongs } from "@/lib/api"

export default function Dashboard() {
  const [stats, setStats] = useState({
    languages: 0,
    genres: 0,
    artists: 0,
    songs: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [languages, genres, artists, songs] = await Promise.all([
          fetchLanguages(),
          fetchGenres(),
          fetchArtists(),
          fetchSongs(1, 10),
        ])

        setStats({
          languages: languages.length,
          genres: genres.length,
          artists: artists.length,
          songs: songs.length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Languages",
      value: stats.languages,
      icon: <GlobeIcon className="h-8 w-8 text-accent" />,
      color: "bg-primary-light",
    },
    {
      title: "Genres",
      value: stats.genres,
      icon: <TagIcon className="h-8 w-8 text-accent" />,
      color: "bg-primary-light",
    },
    {
      title: "Artists",
      value: stats.artists,
      icon: <UsersIcon className="h-8 w-8 text-accent" />,
      color: "bg-primary-light",
    },
    {
      title: "Songs",
      value: stats.songs,
      icon: <FileAudioIcon className="h-8 w-8 text-accent" />,
      color: "bg-primary-light",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-accent">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <Card key={index} className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`rounded-full p-2 ${card.color}`}>{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "Loading..." : card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-accent">Welcome to Playlist Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-inactive-grey">
                Use the sidebar to navigate between different sections of the admin dashboard. You can manage languages,
                genres, artists, and songs from their respective pages.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-accent">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-inactive-grey">Add new content to your music platform:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Add new languages for your songs</li>
                <li>Create genres to categorize music</li>
                <li>Add artists with their profile images</li>
                <li>Upload songs with cover art and audio files</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <div style={{height:"200px",width:"100%" ,marginBottom:"50px",backgroundColor:"none"}}></div>
    </DashboardLayout>
  )
}


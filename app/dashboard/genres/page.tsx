"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusIcon, Loader2Icon } from "lucide-react"
import { fetchGenres, addGenre } from "@/lib/api"

interface Genre {
  id: number
  name: string
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [newGenre, setNewGenre] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const loadGenres = async () => {
    setIsLoading(true)
    try {
      const data = await fetchGenres()
      setGenres(data)
    } catch (error) {
      console.error("Error loading genres:", error)
      toast({
        title: "Error",
        description: "Failed to load genres",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGenres()
  }, [])

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGenre.trim()) return

    setIsSubmitting(true)
    try {
      await addGenre(newGenre)
      toast({
        title: "Success",
        description: "Genre added successfully",
      })
      setNewGenre("")
      loadGenres()
    } catch (error) {
      console.error("Error adding genre:", error)
      toast({
        title: "Error",
        description: "Failed to add genre",
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
          <h1 className="text-3xl font-bold">Genres</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Genre</CardTitle>
              <CardDescription>Add a new genre for your songs</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGenre} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Genre name"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting || !newGenre.trim()}>
                  {isSubmitting ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlusIcon className="h-4 w-4 mr-2" />
                  )}
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genres List</CardTitle>
              <CardDescription>All available genres for songs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : genres.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No genres found. Add your first genre.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {genres.map((genre) => (
                      <TableRow key={genre.id}>
                        <TableCell>{genre.id}</TableCell>
                        <TableCell>{genre.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}


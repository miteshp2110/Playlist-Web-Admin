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
import { fetchLanguages, addLanguage } from "@/lib/api"

interface Language {
  id: number
  name: string
}

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [newLanguage, setNewLanguage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const loadLanguages = async () => {
    setIsLoading(true)
    try {
      const data = await fetchLanguages()
      setLanguages(data)
    } catch (error) {
      console.error("Error loading languages:", error)
      toast({
        title: "Error",
        description: "Failed to load languages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLanguages()
  }, [])

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLanguage.trim()) return

    setIsSubmitting(true)
    try {
      await addLanguage(newLanguage)
      toast({
        title: "Success",
        description: "Language added successfully",
      })
      setNewLanguage("")
      loadLanguages()
    } catch (error) {
      console.error("Error adding language:", error)
      toast({
        title: "Error",
        description: "Failed to add language",
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
          <h1 className="text-3xl font-bold">Languages</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Language</CardTitle>
              <CardDescription>Add a new language for your songs</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLanguage} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Language name"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting || !newLanguage.trim()}>
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
              <CardTitle>Languages List</CardTitle>
              <CardDescription>All available languages for songs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : languages.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No languages found. Add your first language.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {languages.map((language) => (
                      <TableRow key={language.id}>
                        <TableCell>{language.id}</TableCell>
                        <TableCell>{language.name}</TableCell>
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


"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { Send, MessageSquare } from "lucide-react"

interface Chat {
  id: string
  creador: { id: string; name: string; image: string | null }
  participante: { id: string; name: string; image: string | null }
  mensajes: { contenido: string; createdAt: Date }[]
}

interface Mensaje {
  id: string
  contenido: string
  createdAt: string
  emisorId: string
  emisor: { id: string; name: string; image: string | null }
}

export default function ChatPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [contenido, setContenido] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/chat")
      .then(r => r.json())
      .then(data => {
        setChats(data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetch(`/api/chat/${selectedChat}`)
        .then(r => r.json())
        .then(setMensajes)
    }
  }, [selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes])

  async function sendMessage() {
    if (!contenido.trim() || !selectedChat) return

    const chat = chats.find(c => c.id === selectedChat)
    const receptorId = chat?.creador.id === session?.user.id
      ? chat?.participante.id
      : chat?.creador.id

    const res = await fetch(`/api/chat/${selectedChat}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido, receptorId }),
    })

    if (res.ok) {
      const msg = await res.json()
      setMensajes(prev => [...prev, msg])
      setContenido("")
    }
  }

  function getOtherParticipant(chat: Chat) {
    return chat.creador.id === session?.user.id ? chat.participante : chat.creador
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Chat</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Conversaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : chats.length === 0 ? (
              <p className="text-sm text-gray-500">Sin conversaciones</p>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => {
                  const other = getOtherParticipant(chat)
                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                        selectedChat === chat.id
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">{other.name}</span>
                      {chat.mensajes[0] && (
                        <p className="text-gray-500 truncate text-xs mt-1">
                          {chat.mensajes[0].contenido}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            {!selectedChat ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MessageSquare size={48} className="mb-4" />
                <p>Seleccioná una conversación</p>
              </div>
            ) : (
              <div className="flex flex-col h-[60vh]">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {mensajes.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.emisorId === session?.user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.emisorId === session?.user.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.contenido}</p>
                        <p className={`text-xs mt-1 ${
                          msg.emisorId === session?.user.id ? "text-blue-200" : "text-gray-400"
                        }`}>
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Escribí un mensaje..."
                    className="flex-1"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <Button onClick={sendMessage} className="self-end">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

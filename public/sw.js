self.addEventListener("push", (event) => {
  let data
  try {
    data = event.data?.json()
  } catch {
    data = { titulo: event.data?.text() || "Notificación" }
  }

  const titulo = data.titulo || "Nueva notificación"
  const opciones = {
    body: data.mensaje || "",
    data: { link: data.link || "/notificaciones" },
  }

  event.waitUntil(self.registration.showNotification(titulo, opciones))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const link = event.notification.data?.link || "/notificaciones"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === link && "focus" in client) return client.focus()
      }
      return clients.openWindow(link)
    })
  )
})

# 📡 Documentación de Eventos Socket.IO

## 🏗️ Arquitectura Modular

Los eventos de Socket.IO están organizados en módulos separados para facilitar el mantenimiento y la escalabilidad:

```
src/sockets/
├── index.ts              # Registro central de handlers
├── chat.socket.ts        # Eventos de chat
└── notification.socket.ts # Eventos de notificaciones
```

---

## 🔐 Autenticación

Todos los eventos requieren autenticación mediante JWT en el handshake:

```javascript
const socket = io("http://localhost:3000", {
  auth: {
    token: "your-jwt-token",
  },
});
```

---

## 💬 Eventos de Chat

### **Cliente → Servidor**

#### `join_chat`

Unirse a una sala de chat específica.

```javascript
socket.emit("join_chat", chatId);
```

- **Parámetros:** `chatId: string`

#### `leave_chat`

Salir de una sala de chat.

```javascript
socket.emit("leave_chat", chatId);
```

- **Parámetros:** `chatId: string`

#### `typing`

Indicar que el usuario está escribiendo.

```javascript
socket.emit("typing", { chatId: "chat-id" });
```

- **Parámetros:** `{ chatId: string }`

#### `stop_typing`

Indicar que el usuario dejó de escribir.

```javascript
socket.emit("stop_typing", { chatId: "chat-id" });
```

- **Parámetros:** `{ chatId: string }`

#### `mark_as_read`

Marcar mensajes como leídos.

```javascript
socket.emit("mark_as_read", {
  chatId: "chat-id",
  messageIds: ["msg1", "msg2"],
});
```

- **Parámetros:** `{ chatId: string, messageIds: string[] }`

---

### **Servidor → Cliente**

#### `nuevo_mensaje`

Se recibe cuando hay un nuevo mensaje en el chat.

```javascript
socket.on("nuevo_mensaje", (mensaje) => {
  console.log("Nuevo mensaje:", mensaje);
});
```

- **Datos:**
  ```typescript
  {
    id: string;
    chatId: string;
    remitenteId: string;
    texto?: string;
    urlAdjunto?: string;
    creadoEn: Date;
    remitente: {
      id: string;
      email: string;
      rol: string;
    }
  }
  ```

#### `user_joined`

Se recibe cuando un usuario se une al chat.

```javascript
socket.on("user_joined", (data) => {
  console.log("Usuario unido:", data);
});
```

- **Datos:** `{ userId: string, chatId: string, timestamp: Date }`

#### `user_left`

Se recibe cuando un usuario sale del chat.

```javascript
socket.on("user_left", (data) => {
  console.log("Usuario salió:", data);
});
```

- **Datos:** `{ userId: string, chatId: string, timestamp: Date }`

#### `user_typing`

Se recibe cuando otro usuario está escribiendo.

```javascript
socket.on("user_typing", (data) => {
  console.log("Usuario escribiendo:", data);
});
```

- **Datos:** `{ userId: string, chatId: string }`

#### `user_stop_typing`

Se recibe cuando otro usuario dejó de escribir.

```javascript
socket.on("user_stop_typing", (data) => {
  console.log("Usuario dejó de escribir:", data);
});
```

- **Datos:** `{ userId: string, chatId: string }`

#### `messages_read`

Se recibe cuando otro usuario leyó mensajes.

```javascript
socket.on("messages_read", (data) => {
  console.log("Mensajes leídos:", data);
});
```

- **Datos:** `{ userId: string, chatId: string, messageIds: string[], timestamp: Date }`

---

## 🔔 Eventos de Notificaciones

### **Cliente → Servidor**

#### `mark_all_notifications_read`

Marcar todas las notificaciones como leídas.

```javascript
socket.emit("mark_all_notifications_read");
```

---

### **Servidor → Cliente**

Las notificaciones se envían automáticamente a la sala personal del usuario `user_${userId}`.

---

## 🚀 Ejemplo Completo de Implementación

### Cliente (JavaScript/TypeScript)

```javascript
import io from "socket.io-client";

// Conectar con autenticación
const socket = io("http://localhost:3000", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

// Manejo de conexión
socket.on("connect", () => {
  console.log("Conectado a Socket.IO");

  // Unirse a un chat
  socket.emit("join_chat", "chat-id-123");
});

// Escuchar nuevos mensajes
socket.on("nuevo_mensaje", (mensaje) => {
  console.log("Nuevo mensaje recibido:", mensaje);
  // Actualizar UI
});

// Escuchar indicador de escritura
socket.on("user_typing", ({ userId }) => {
  console.log(`Usuario ${userId} está escribiendo...`);
  // Mostrar indicador en UI
});

// Enviar indicador de escritura
const handleTyping = () => {
  socket.emit("typing", { chatId: "chat-id-123" });

  // Detener después de 3 segundos
  setTimeout(() => {
    socket.emit("stop_typing", { chatId: "chat-id-123" });
  }, 3000);
};

// Manejo de errores
socket.on("connect_error", (error) => {
  console.error("Error de conexión:", error.message);
});

// Desconexión
socket.on("disconnect", () => {
  console.log("Desconectado de Socket.IO");
});
```

---

## 📝 Agregar Nuevos Módulos

Para agregar nuevos eventos modulares:

1. **Crear nuevo archivo en `src/sockets/`:**

   ```typescript
   // src/sockets/video.socket.ts
   import { Socket } from "socket.io";
   import logger from "../utils/logger";

   export const videoSocketHandlers = (socket: Socket) => {
     socket.on("start_call", (data) => {
       // Lógica del evento
     });

     // Más eventos...
   };
   ```

2. **Registrar en `src/sockets/index.ts`:**

   ```typescript
   import { videoSocketHandlers } from "./video.socket";

   export const registerSocketHandlers = (socket: Socket) => {
     chatSocketHandlers(socket);
     notificationSocketHandlers(socket);
     videoSocketHandlers(socket); // Nuevo módulo
   };
   ```

---

## 🔒 Seguridad

- ✅ Todos los sockets requieren autenticación JWT
- ✅ Los usuarios solo pueden unirse a chats donde tienen permisos
- ✅ Los datos del usuario están en `socket.data.user`
- ⚠️ Siempre validar permisos antes de emitir eventos a salas

---

## 🐛 Debugging

Para debug, activa logs detallados:

```javascript
// Cliente
const socket = io("http://localhost:3000", {
  auth: { token: "token" },
  debug: true,
});

// Ver todos los eventos
socket.onAny((event, ...args) => {
  console.log("Evento:", event, args);
});
```

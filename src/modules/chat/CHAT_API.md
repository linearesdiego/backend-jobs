# API de Chat con Socket.IO

## Configuración del Cliente

### Instalación
```bash
npm install socket.io-client
```

### Conexión desde el Frontend (React/Vue/Angular)

```javascript
import { io } from 'socket.io-client';

// Conectar al servidor (usar el token JWT del usuario autenticado)
const token = localStorage.getItem('token'); // O de donde guardes el token

const socket = io('http://localhost:3000', {
  auth: {
    token: token
  }
});

// Escuchar eventos de conexión
socket.on('connect', () => {
  console.log('Conectado al servidor Socket.IO');
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error.message);
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});
```

## Eventos del Socket

### 1. Unirse a un Chat
```javascript
// Cuando entras a una conversación
socket.emit('join_chat', chatId);
```

### 2. Salir de un Chat
```javascript
// Cuando sales de una conversación
socket.emit('leave_chat', chatId);
```

### 3. Indicar que estás escribiendo
```javascript
socket.emit('typing', { chatId });

// Escuchar cuando otro usuario está escribiendo
socket.on('user_typing', (data) => {
  console.log(`Usuario ${data.userId} está escribiendo en chat ${data.chatId}`);
});
```

### 4. Indicar que dejaste de escribir
```javascript
socket.emit('stop_typing', { chatId });

// Escuchar cuando otro usuario deja de escribir
socket.on('user_stop_typing', (data) => {
  console.log(`Usuario ${data.userId} dejó de escribir`);
});
```

### 5. Recibir nuevos mensajes
```javascript
// Escuchar mensajes en tiempo real
socket.on('nuevo_mensaje', (mensaje) => {
  console.log('Nuevo mensaje:', mensaje);
  // Actualizar la UI con el nuevo mensaje
});
```

## Endpoints HTTP del Chat

### 1. Obtener todos los chats del usuario
```
GET /api/v1/chat
Headers: Authorization: Bearer <token>
```

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": "chat-uuid",
      "postulacionId": "postulacion-uuid",
      "postulacion": {
        "id": "postulacion-uuid",
        "titulo": "Título de la postulación"
      },
      "mensajes": [
        {
          "id": "mensaje-uuid",
          "texto": "Último mensaje",
          "creadoEn": "2025-12-15T...",
          "remitente": {
            "id": "usuario-uuid",
            "email": "usuario@email.com",
            "rol": "PROVEEDOR"
          }
        }
      ]
    }
  ]
}
```

### 2. Obtener o crear chat para una postulación
```
GET /api/v1/chat/postulacion/:postulacionId
Headers: Authorization: Bearer <token>
```

### 3. Obtener mensajes de un chat
```
GET /api/v1/chat/:chatId/mensajes
Headers: Authorization: Bearer <token>
```

### 4. Enviar mensaje (alternativa HTTP)
```
POST /api/v1/chat/:chatId/mensajes
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "texto": "Mensaje de texto",
  "urlAdjunto": "https://...", // opcional
  "tipoAdjunto": "image/png"   // opcional
}
```

## Ejemplo Completo - Componente de Chat (React)

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function Chat({ chatId, token }) {
  const [socket, setSocket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [usuarioEscribiendo, setUsuarioEscribiendo] = useState(false);

  useEffect(() => {
    // Conectar al socket
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Conectado');
      newSocket.emit('join_chat', chatId);
    });

    // Escuchar nuevos mensajes
    newSocket.on('nuevo_mensaje', (nuevoMensaje) => {
      setMensajes(prev => [...prev, nuevoMensaje]);
    });

    // Escuchar cuando alguien está escribiendo
    newSocket.on('user_typing', () => {
      setUsuarioEscribiendo(true);
    });

    newSocket.on('user_stop_typing', () => {
      setUsuarioEscribiendo(false);
    });

    setSocket(newSocket);

    // Cargar mensajes iniciales
    fetch(`http://localhost:3000/api/v1/chat/${chatId}/mensajes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setMensajes(data.data));

    return () => {
      newSocket.emit('leave_chat', chatId);
      newSocket.close();
    };
  }, [chatId, token]);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/chat/${chatId}/mensajes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texto: mensaje })
      });

      const data = await response.json();
      setMensaje('');
      socket.emit('stop_typing', { chatId });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const handleInputChange = (e) => {
    setMensaje(e.target.value);
    if (e.target.value) {
      socket.emit('typing', { chatId });
    } else {
      socket.emit('stop_typing', { chatId });
    }
  };

  return (
    <div>
      <div className="mensajes">
        {mensajes.map(msg => (
          <div key={msg.id}>
            <strong>{msg.remitente.email}:</strong> {msg.texto}
          </div>
        ))}
        {usuarioEscribiendo && <div>El otro usuario está escribiendo...</div>}
      </div>

      <div>
        <input
          value={mensaje}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={enviarMensaje}>Enviar</button>
      </div>
    </div>
  );
}

export default Chat;
```

## Variables de Entorno Necesarias

Asegúrate de tener en tu `.env`:

```env
PORT=3000
JWT_SECRET=tu_secreto_jwt
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DATABASE_URL=tu_conexion_mysql
```

## Flujo de Uso

1. **Usuario se autentica** → Obtiene JWT token
2. **Usuario abre lista de chats** → GET `/api/v1/chat`
3. **Usuario selecciona o crea un chat** → GET `/api/v1/chat/postulacion/:postulacionId`
4. **Cliente se conecta al Socket.IO** con el token
5. **Cliente se une a la sala del chat** → `socket.emit('join_chat', chatId)`
6. **Usuario envía mensaje** → POST `/api/v1/chat/:chatId/mensajes`
7. **Todos en el chat reciben el mensaje** → `socket.on('nuevo_mensaje')`
8. **Usuario sale del chat** → `socket.emit('leave_chat', chatId)`

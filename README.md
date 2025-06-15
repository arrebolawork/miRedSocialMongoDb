# miRedSocialMongoDb

# 📘 API REST - Red Social con Node.js, Express y MongoDB

Esta API permite gestionar usuarios y publicaciones de una red social. Implementa autenticación con JWT, control de acceso con middleware y operaciones CRUD sobre usuarios y posts.

---

## 🔐 Autenticación

> Todos los endpoints que requieren autenticación deben recibir el token JWT en el header:

```
Authorization: Bearer <token>
```

---

## 👤 Rutas de Usuario

| Método | Ruta           | Descripción                             | Auth requerida |
| ------ | -------------- | --------------------------------------- | -------------- |
| POST   | `/login`       | Inicia sesión                           | ❌             |
| POST   | `/register`    | Crea un nuevo usuario                   | ❌             |
| GET    | `/getAllUsers` | Devuelve todos los usuarios             | ✅             |
| GET    | `/user/me`     | Devuelve los datos del usuario logueado | ✅             |
| GET    | `/user/:_id`   | Devuelve un usuario por su ID           | ✅             |
| PUT    | `/user/:_id`   | Actualiza los datos de un usuario       | ✅             |
| DELETE | `/user/:_id`   | Elimina un usuario                      | ✅             |
| DELETE | `/logout`      | Cierra sesión del usuario               | ✅             |

---

## 📝 Rutas de Post

| Método | Ruta              | Descripción              | Auth requerida |
| ------ | ----------------- | ------------------------ | -------------- |
| GET    | `/allPosts`       | Lista todos los posts    | ❌             |
| GET    | `/id/:_id`        | Busca un post por su ID  | ❌             |
| GET    | `/titulo/:titulo` | Busca posts por título   | ❌             |
| POST   | `/create`         | Crea un nuevo post       | ✅             |
| PUT    | `/id/:_id`        | Actualiza un post        | ✅             |
| POST   | `/like/:_id`      | Da like a un post        | ✅             |
| POST   | `/unlike/:_id`    | Quita el like de un post | ✅             |

---

## 🧪 Modelo de Usuario (`User`)

```js
{
  fullName: String,     // Requerido
  email: String,        // Requerido
  passToHash: String,   // Requerido
  role: String,
  date: Date,
  tokens: [String]
}
```

---

## 🣾 Modelo de Post (`Post`)

```js
{
  titulo: String,        // Requerido
  contenido: String,     // Requerido
  autor: ObjectId,       // Referencia a User
  date: Date,
  like: [ObjectId]       // Array de IDs de usuarios que dieron Like
}
```

---

## ⚠️ Notas

- Asegúrate de proteger las rutas adecuadas con el middleware `authentication`.
- Los `tokens` se almacenan en el array `user.tokens[]` para permitir múltiples sesiones.
- Los errores están gestionados con respuestas HTTP semánticas: `400`, `401`, `404`, `409`, `500`.

---

# FrontUDMarketPlace

Marketplace web desarrollado para la comunidad de la Universidad Distrital Francisco José de Caldas, permitiendo la publicación, consulta y gestión de productos entre estudiantes, así como la interacción mediante calificaciones y PQR asociadas a los productos.

## Integrantes

* Tomás Arévalo Montes
* Pablo Garzón Gómez
* Juan Sebastián Vásquez Ortiz

## Descripción del Proyecto

FrontUDMarketPlace es una aplicación web orientada a la compra y venta de productos dentro de la comunidad universitaria. El sistema permite a los usuarios registrarse, iniciar sesión, publicar productos, consultar productos disponibles, calificar productos adquiridos y generar Peticiones, Quejas o Reclamos (PQR).

El proyecto utiliza un entorno frontend desarrollado con HTML, CSS y JavaScript, junto con JSON Server como backend simulado para el almacenamiento de información.

## Funcionalidades Implementadas

### Gestión de Usuarios

* Registro de usuarios.
* Inicio de sesión.
* Edición de perfil.
* Visualización de información personal.

### Gestión de Productos

* Publicación de productos.
* Consulta de productos disponibles.
* Filtrado por categorías.
* Visualización de sede asociada.
* Modificación y eliminación de productos (Administrador).

### Calificaciones de Productos

* Calificación mediante sistema de estrellas.
* Comentarios asociados a cada producto.
* Cálculo automático del promedio de calificación.
* Visualización de opiniones de los usuarios.
* Conteo de calificaciones por producto.

### Sistema PQR

* Creación de Peticiones.
* Creación de Quejas.
* Creación de Reclamos.
* Asociación de cada PQR a un producto específico.
* Estado de seguimiento de la solicitud.
* Campo para respuesta administrativa.

### Gestión de Roles

* Usuario.
* Administrador.

### Administración

* Eliminación de productos.
* Edición de precios.
* Visualización de herramientas administrativas.

---

## Tecnologías Utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript ES6

### Backend Simulado

* JSON Server

### Herramientas

* Node.js
* npm
* Vite
* Git
* GitHub

---

## Estructura del Proyecto

```text
FrontUDMarketPlace/
│
├── public/
│
├── src/
│   ├── css/
│   │   ├── index.css
│   │   ├── perfil.css
│   │   ├── pqr.css
│   │   ├── calificaciones.css
│   │   └── ...
│   │
│   ├── js/
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── perfil.js
│   │   ├── pqr.js
│   │   ├── calificaciones.js
│   │   └── ...
│   │
│   └── assets/
│
├── db.json
├── package.json
├── index.html
├── perfil.html
├── pqr.html
├── calificaciones.html
└── README.md
```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

### 2. Ingresar al proyecto

```bash
cd FrontUDMarketPlace
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Iniciar JSON Server

```bash
npx json-server db.json
```

Servidor disponible en:

```text
http://localhost:3000
```

### 5. Iniciar el frontend

```bash
npm run dev
```

Aplicación disponible en:

```text
http://localhost:5173
```

---

## Endpoints Principales

### Usuarios

```text
GET    /usuarios
POST   /usuarios
PUT    /usuarios/:id
DELETE /usuarios/:id
```

### Productos

```text
GET    /productos
POST   /productos
PUT    /productos/:id
DELETE /productos/:id
```

### Calificaciones

```text
GET    /calificaciones
POST   /calificaciones
```

### PQR

```text
GET    /pqrs
POST   /pqrs
PUT    /pqrs/:id
```

---

## Flujo de Calificaciones

1. El usuario selecciona un producto.
2. El sistema almacena el identificador del producto.
3. El usuario asigna una puntuación entre 1 y 5 estrellas.
4. Se registra un comentario opcional.
5. La información se almacena en `calificaciones`.
6. El promedio del producto se actualiza automáticamente.

---

## Flujo de PQR

1. El usuario selecciona un producto.
2. Accede al formulario de PQR.
3. Selecciona:

   * Petición
   * Queja
   * Reclamo
4. Ingresa asunto y descripción.
5. El sistema registra la solicitud asociada al producto.

---

## Modelo de Datos

### Calificación

```json
{
  "id": "1",
  "usuarioId": "1",
  "productoId": "4",
  "puntuacion": 5,
  "comentario": "Excelente producto",
  "fecha": "2026-06-03T05:08:45.987Z"
}
```

### PQR

```json
{
  "id": "1",
  "usuarioId": "1",
  "productoId": "4",
  "tipo": "Queja",
  "asunto": "Producto defectuoso",
  "mensaje": "La silla llegó rota",
  "estado": "Pendiente",
  "respuestaAdmin": ""
}
```

---

## Posibles Mejoras Futuras

* Integración con backend real.
* Base de datos relacional.
* Autenticación JWT completa.
* Recuperación de contraseña.
* Sistema de compras.
* Chat entre comprador y vendedor.
* Historial de transacciones.
* Gestión avanzada de PQR.
* Dashboard administrativo.

---

## Licencia

Proyecto desarrollado con fines académicos para la Universidad Distrital Francisco José de Caldas.

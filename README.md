# UD Market Place

## Descripción

UD Market Place es una plataforma web desarrollada para la comunidad de la Universidad Distrital Francisco José de Caldas que permite la compra y venta de productos entre estudiantes, docentes y demás miembros de la institución.

El sistema busca facilitar el intercambio de artículos dentro de la universidad mediante una interfaz sencilla, segura y accesible.


## Tecnologías utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Vite

### Backend de pruebas

* JSON Server

### Control de versiones

* Git
* GitHub

---

## Funcionalidades implementadas

### Gestión de usuarios

* Registro de usuarios.
* Inicio de sesión.
* Verificación de credenciales.
* Edición de perfil.
* Actualización de información personal.

### Gestión de productos

* Publicación de productos.
* Consulta de productos disponibles.
* Asociación de productos a categorías.
* Asociación de productos a sedes universitarias.

### Perfil de usuario

* Visualización de información personal.
* Edición de datos del perfil.
* Actualización de datos en JSON Server.
* Visualización de calificación promedio.

### Sistema de calificaciones

* Calificación de vendedores.
* Comentarios sobre la experiencia de compra.
* Cálculo automático del promedio de calificaciones.
* Visualización de reputación del vendedor.

### Sistema PQR

* Registro de peticiones.
* Registro de quejas.
* Registro de reclamos.
* Almacenamiento de solicitudes en JSON Server.
* Gestión de estados de atención.

---

## Estructura del proyecto

```text
FrontUDMarketPlace
│
├── public/
│
├── src/
│   ├── css/
│   │   ├── login.css
│   │   ├── perfil.css
│   │   ├── pqr.css
│   │   ├── calificaciones.css
│   │   └── ...
│   │
│   ├── js/
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
├── perfil.html
├── pqr.html
├── calificaciones.html
└── ...
```

---

## Base de datos simulada

El proyecto utiliza JSON Server para simular una API REST.

Colecciones principales:

* usuarios
* productos
* categorias
* sedes
* pqrs
* calificaciones

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

### 2. Ingresar al proyecto

```bash
cd FrontUDMarketPlace
```

### 3. Instalar dependencias

```bash
npm install
```

---

## Ejecución del Backend

Iniciar JSON Server:

```bash
npx json-server db.json --port 3000
```

API disponible en:

```text
http://localhost:3000
```

Endpoints principales:

```text
http://localhost:3000/usuarios
http://localhost:3000/productos
http://localhost:3000/categorias
http://localhost:3000/sedes
http://localhost:3000/pqrs
http://localhost:3000/calificaciones
```

---

## Ejecución del Frontend

Iniciar Vite:

```bash
npm run dev
```

Aplicación disponible en:

```text
http://localhost:5173
```

---

## Casos de uso destacados

### Registrar una PQR

1. Acceder a la vista de PQR.
2. Seleccionar el tipo:

   * Petición
   * Queja
   * Reclamo
3. Completar asunto y descripción.
4. Enviar la solicitud.
5. La información se almacena en JSON Server.

### Calificar un vendedor

1. Acceder a la vista de calificaciones.
2. Seleccionar una puntuación de 1 a 5 estrellas.
3. Escribir un comentario.
4. Guardar la calificación.
5. El promedio se refleja automáticamente en el perfil del vendedor.

### Editar perfil

1. Ingresar al perfil.
2. Seleccionar "Editar perfil".
3. Modificar los campos deseados.
4. Guardar cambios.
5. La información se actualiza en la base de datos.

---

## Estado del proyecto

Versión académica funcional.

Módulos implementados:

* Registro
* Login
* Gestión de productos
* Perfil de usuario
* Sistema PQR
* Sistema de calificaciones
* Integración con JSON Server

---

## Licencia

Proyecto desarrollado con fines académicos para la Universidad Distrital Francisco José de Caldas.

# Implementación de Módulos PQR y Calificaciones de Vendedores

## Descripción General

Se incorporaron dos nuevas funcionalidades al proyecto **UD Marketplace**:

1. **Módulo de Peticiones, Quejas y Reclamos (PQR)**.
2. **Módulo de Calificación de Vendedores**.

Además, se integró la visualización dinámica de la calificación promedio del vendedor dentro de la pantalla de perfil utilizando datos almacenados en JSON Server.

---

# Archivos Nuevos

## 1. Interfaz de PQR

### Archivo creado

```text
pqr.html
```

### Funcionalidad

Permite a los usuarios registrar:

* Peticiones
* Quejas
* Reclamos

Campos implementados:

* Tipo de solicitud
* Asunto
* Descripción

---

### Archivo creado

```text
src/js/pqr.js
```

### Funcionalidad

Gestiona:

* Validación de campos.
* Captura de datos del formulario.
* Consumo de la API REST de JSON Server.
* Registro de nuevas PQR mediante método POST.

Endpoint utilizado:

```text
http://localhost:3000/pqr
```

---

### Archivo creado

```text
src/css/pqr.css
```

### Funcionalidad

Define el diseño visual del módulo PQR:

* Formulario
* Campos de entrada
* Botones
* Distribución general de la página

---

# 2. Interfaz de Calificación de Vendedores

### Archivo creado

```text
calificaciones.html
```

### Funcionalidad

Permite que un comprador:

* Seleccione una calificación de 1 a 5 estrellas.
* Escriba un comentario.
* Registre una valoración sobre un vendedor.

---

### Archivo creado

```text
src/js/calificaciones.js
```

### Funcionalidad

Implementa:

* Selección visual de estrellas.
* Captura de comentarios.
* Validación de la puntuación.
* Registro de calificaciones mediante POST.

Endpoint utilizado:

```text
http://localhost:3000/calificaciones
```

Datos almacenados:

```json
{
  "vendedorId": 1,
  "compradorId": 2,
  "puntuacion": 5,
  "comentario": "Excelente vendedor",
  "fecha": "2026-06-01T20:30:00.000Z"
}
```

---

### Archivo creado

```text
src/css/calificaciones.css
```

### Funcionalidad

Controla la apariencia visual de:

* Sistema de estrellas.
* Comentarios.
* Botón de envío.
* Contenedor principal.

---

# Archivos Modificados

## 1. Perfil de Usuario

### Archivo modificado

```text
perfil.html
```

### Cambios realizados

Se integró la visualización de:

* Calificación promedio.
* Barra gráfica de puntuación.
* Información dinámica del vendedor.

Elementos utilizados:

```html
<span id="calificacionValor"></span>

<div class="cal-barra" id="calBarra"></div>
```

---

### Archivo modificado

```text
src/js/perfil.js
```

### Cambios realizados

#### Integración con JSON Server

Se eliminó el arreglo local de usuarios y se reemplazó por consumo real de API.

Antes:

```javascript
const usuarios = [...]
```

Ahora:

```javascript
fetch("http://localhost:3000/usuarios/1")
```

---

#### Carga dinámica del perfil

Obtiene información desde:

```text
http://localhost:3000/usuarios
```

y actualiza:

* Nombre
* Apellidos
* Correo
* Fecha de nacimiento
* Avatar

---

#### Cálculo automático de calificaciones

Se agregó la función:

```javascript
cargarCalificacion(vendedorId)
```

La cual:

1. Consulta:

```text
http://localhost:3000/calificaciones?vendedorId=1
```

2. Obtiene todas las valoraciones.

3. Calcula el promedio:

```javascript
promedio =
sumaPuntuaciones / cantidadCalificaciones
```

4. Actualiza:

```javascript
calificacionValor
```

y

```javascript
calBarra
```

de forma automática.

---

## 2. Base de Datos JSON Server

### Archivo modificado

```text
db.json
```

### Nuevas colecciones agregadas

#### PQR

```json
"pqr": []
```

Permite almacenar las solicitudes realizadas por los usuarios.

---

#### Calificaciones

```json
"calificaciones": []
```

Permite almacenar:

* vendedorId
* compradorId
* puntuacion
* comentario
* fecha

---

# Endpoints Nuevos

## PQR

```http
GET  /pqr
POST /pqr
```

---

## Calificaciones

```http
GET  /calificaciones
POST /calificaciones
```

---

# Resumen de Archivos Afectados

## Nuevos

```text
pqr.html
calificaciones.html

src/js/pqr.js
src/js/calificaciones.js

src/css/pqr.css
src/css/calificaciones.css
```

## Modificados

```text
perfil.html
src/js/perfil.js
db.json
```

---

# Resultado Final

Con esta implementación el sistema permite:

* Registrar Peticiones, Quejas y Reclamos.
* Registrar calificaciones de vendedores.
* Almacenar información en JSON Server.
* Calcular automáticamente el promedio de valoración.
* Mostrar la reputación del vendedor en su perfil.
* Mantener persistencia de datos durante el desarrollo del proyecto.

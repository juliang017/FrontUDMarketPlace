const campos = [
    "primerNombre",
    "segundoNombre",
    "primerApellido",
    "segundoApellido",
    "fechaNacimiento",
    "correo"
];

const API_USUARIOS = "http://localhost:3000/usuarios";
const API_CALIFICACIONES = "http://localhost:3000/calificaciones";

const usuarioActualId = "1";

let usuarioActual = null;

async function cargarPerfil() {

    try {

        // Obtener usuario
        const respuestaUsuario =
            await fetch(`${API_USUARIOS}/${usuarioActualId}`);

        if (!respuestaUsuario.ok) {
            throw new Error("No se pudo cargar el usuario");
        }

        usuarioActual =
            await respuestaUsuario.json();

        // Obtener calificaciones
        const respuestaCalificaciones =
            await fetch(API_CALIFICACIONES);

        if (!respuestaCalificaciones.ok) {
            throw new Error("No se pudieron cargar las calificaciones");
        }

        const calificaciones =
            await respuestaCalificaciones.json();

        // Calcular promedio del vendedor
        const calificacionesUsuario =
            calificaciones.filter(
                c => c.vendedorId === usuarioActualId
            );

        const promedio =
            calificacionesUsuario.length > 0
                ? calificacionesUsuario.reduce(
                    (suma, c) => suma + Number(c.puntuacion),
                    0
                ) / calificacionesUsuario.length
                : 0;

        // Información personal
        document.getElementById("v-primerNombre").textContent =
            usuarioActual.primerNombre || "";

        document.getElementById("v-segundoNombre").textContent =
            usuarioActual.segundoNombre || "";

        document.getElementById("v-primerApellido").textContent =
            usuarioActual.primerApellido || "";

        document.getElementById("v-segundoApellido").textContent =
            usuarioActual.segundoApellido || "";

        document.getElementById("v-fechaNacimiento").textContent =
            usuarioActual.fechaNacimiento || "";

        document.getElementById("v-correo").textContent =
            usuarioActual.correoInstitucional || usuarioActual.correo || "";

        // Inputs de edición
        document.getElementById("i-primerNombre").value =
            usuarioActual.primerNombre || "";

        document.getElementById("i-segundoNombre").value =
            usuarioActual.segundoNombre || "";

        document.getElementById("i-primerApellido").value =
            usuarioActual.primerApellido || "";

        document.getElementById("i-segundoApellido").value =
            usuarioActual.segundoApellido || "";

        document.getElementById("i-fechaNacimiento").value =
            usuarioActual.fechaNacimiento || "";

        document.getElementById("i-correo").value =
            usuarioActual.correoInstitucional || usuarioActual.correo || "";

        // Panel lateral
        document.getElementById("nombreCompleto").textContent =
            `${usuarioActual.primerNombre || ""} ${usuarioActual.primerApellido || ""}`;

        document.getElementById("correoVisible").textContent =
            usuarioActual.correoInstitucional || usuarioActual.correo || "";

        document.getElementById("avatarIniciales").textContent =
            (usuarioActual.primerNombre?.[0] || "") +
            (usuarioActual.primerApellido?.[0] || "");

        // Calificación
        document.getElementById("calificacionValor").textContent =
            promedio.toFixed(1);

        document.getElementById("calBarra").style.width =
            `${(promedio / 5) * 100}%`;

    } catch (error) {

        console.error("Error cargando perfil:", error);

        alert("No fue posible cargar la información del perfil.");
    }
}

cargarPerfil();

function activarEdicion() {

    campos.forEach(c => {

        document.getElementById(`v-${c}`).style.display = "none";
        document.getElementById(`i-${c}`).style.display = "block";
    });

    document.getElementById("btnEditar").style.display = "none";
    document.getElementById("btnGuardar").style.display = "block";
    document.getElementById("btnCancelar").style.display = "block";
}

function cancelarEdicion() {

    campos.forEach(c => {

        document.getElementById(`v-${c}`).style.display = "block";
        document.getElementById(`i-${c}`).style.display = "none";
    });

    document.getElementById("btnEditar").style.display = "block";
    document.getElementById("btnGuardar").style.display = "none";
    document.getElementById("btnCancelar").style.display = "none";
}

async function guardarPerfil() {

    try {

        const datosActualizados = {

            ...usuarioActual,

            primerNombre:
                document.getElementById("i-primerNombre").value,

            segundoNombre:
                document.getElementById("i-segundoNombre").value,

            primerApellido:
                document.getElementById("i-primerApellido").value,

            segundoApellido:
                document.getElementById("i-segundoApellido").value,

            fechaNacimiento:
                document.getElementById("i-fechaNacimiento").value,

            correoInstitucional:
                document.getElementById("i-correo").value
        };

        const respuesta = await fetch(
            `${API_USUARIOS}/${usuarioActualId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosActualizados)
            }
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo actualizar el perfil");
        }

        usuarioActual = datosActualizados;

        // Actualizar vista
        document.getElementById("v-primerNombre").textContent =
            datosActualizados.primerNombre;

        document.getElementById("v-segundoNombre").textContent =
            datosActualizados.segundoNombre;

        document.getElementById("v-primerApellido").textContent =
            datosActualizados.primerApellido;

        document.getElementById("v-segundoApellido").textContent =
            datosActualizados.segundoApellido;

        document.getElementById("v-fechaNacimiento").textContent =
            datosActualizados.fechaNacimiento;

        document.getElementById("v-correo").textContent =
            datosActualizados.correoInstitucional;

        document.getElementById("nombreCompleto").textContent =
            `${datosActualizados.primerNombre} ${datosActualizados.primerApellido}`;

        document.getElementById("correoVisible").textContent =
            datosActualizados.correoInstitucional;

        document.getElementById("avatarIniciales").textContent =
            (datosActualizados.primerNombre[0] || "") +
            (datosActualizados.primerApellido[0] || "");

        cancelarEdicion();

        alert("Perfil actualizado correctamente");

    } catch (error) {

        console.error(error);

        alert("No fue posible actualizar el perfil");
    }
}
const campos = [
    "primerNombre",
    "segundoNombre",
    "primerApellido",
    "segundoApellido",
    "fechaNacimiento",
    "correo"
];

let usuarioActual = null;

async function cargarPerfil() {

    try {

        // Usuario que se mostrará en el perfil
        const usuarioId = 1;

        const response =
            await fetch(
                `http://localhost:3000/usuarios/${usuarioId}`
            );

        if (!response.ok) {
            throw new Error("No se pudo cargar el usuario");
        }

        const usuario =
            await response.json();

        usuarioActual = usuario;

        const correo =
            usuario.correo ||
            usuario.correoInstitucional ||
            "";

        // Campos visibles
        document.getElementById(
            "v-primerNombre"
        ).textContent =
            usuario.primerNombre || "";

        document.getElementById(
            "v-segundoNombre"
        ).textContent =
            usuario.segundoNombre || "";

        document.getElementById(
            "v-primerApellido"
        ).textContent =
            usuario.primerApellido || "";

        document.getElementById(
            "v-segundoApellido"
        ).textContent =
            usuario.segundoApellido || "";

        document.getElementById(
            "v-fechaNacimiento"
        ).textContent =
            usuario.fechaNacimiento || "";

        document.getElementById(
            "v-correo"
        ).textContent =
            correo;

        // Inputs edición
        document.getElementById(
            "i-primerNombre"
        ).value =
            usuario.primerNombre || "";

        document.getElementById(
            "i-segundoNombre"
        ).value =
            usuario.segundoNombre || "";

        document.getElementById(
            "i-primerApellido"
        ).value =
            usuario.primerApellido || "";

        document.getElementById(
            "i-segundoApellido"
        ).value =
            usuario.segundoApellido || "";

        document.getElementById(
            "i-fechaNacimiento"
        ).value =
            usuario.fechaNacimiento || "";

        document.getElementById(
            "i-correo"
        ).value =
            correo;

        // Panel izquierdo
        document.getElementById(
            "nombreCompleto"
        ).textContent =
            `${usuario.primerNombre || ""} ${usuario.primerApellido || ""}`;

        document.getElementById(
            "correoVisible"
        ).textContent =
            correo;

        document.getElementById(
            "avatarIniciales"
        ).textContent =
            (usuario.primerNombre?.charAt(0) || "") +
            (usuario.primerApellido?.charAt(0) || "");

        // Cargar promedio de calificaciones
        cargarCalificacion(usuario.id);

    } catch (error) {

        console.error(
            "Error cargando perfil:",
            error
        );
    }
}

function activarEdicion() {

    campos.forEach(campo => {

        document.getElementById(
            `v-${campo}`
        ).style.display = "none";

        document.getElementById(
            `i-${campo}`
        ).style.display = "block";
    });

    document.getElementById(
        "btnEditar"
    ).style.display = "none";

    document.getElementById(
        "btnGuardar"
    ).style.display = "block";

    document.getElementById(
        "btnCancelar"
    ).style.display = "block";
}

function cancelarEdicion() {

    campos.forEach(campo => {

        document.getElementById(
            `v-${campo}`
        ).style.display = "block";

        document.getElementById(
            `i-${campo}`
        ).style.display = "none";
    });

    document.getElementById(
        "btnEditar"
    ).style.display = "block";

    document.getElementById(
        "btnGuardar"
    ).style.display = "none";

    document.getElementById(
        "btnCancelar"
    ).style.display = "none";
}

async function guardarPerfil() {

    try {

        if (!usuarioActual) {
            return;
        }

        const usuarioActualizado = {

            ...usuarioActual,

            primerNombre:
                document.getElementById(
                    "i-primerNombre"
                ).value,

            segundoNombre:
                document.getElementById(
                    "i-segundoNombre"
                ).value,

            primerApellido:
                document.getElementById(
                    "i-primerApellido"
                ).value,

            segundoApellido:
                document.getElementById(
                    "i-segundoApellido"
                ).value,

            fechaNacimiento:
                document.getElementById(
                    "i-fechaNacimiento"
                ).value,

            correo:
                document.getElementById(
                    "i-correo"
                ).value
        };

        await fetch(
            `http://localhost:3000/usuarios/${usuarioActual.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify(
                    usuarioActualizado
                )
            }
        );

        usuarioActual =
            usuarioActualizado;

        campos.forEach(campo => {

            const valor =
                document.getElementById(
                    `i-${campo}`
                ).value;

            document.getElementById(
                `v-${campo}`
            ).textContent =
                valor;
        });

        const primerNombre =
            usuarioActualizado.primerNombre;

        const primerApellido =
            usuarioActualizado.primerApellido;

        const correo =
            usuarioActualizado.correo;

        document.getElementById(
            "avatarIniciales"
        ).textContent =
            (primerNombre[0] || "") +
            (primerApellido[0] || "");

        document.getElementById(
            "nombreCompleto"
        ).textContent =
            `${primerNombre} ${primerApellido}`;

        document.getElementById(
            "correoVisible"
        ).textContent =
            correo;

        cancelarEdicion();

        alert(
            "Perfil actualizado correctamente"
        );

    } catch (error) {

        console.error(
            "Error actualizando perfil:",
            error
        );

        alert(
            "No se pudo actualizar el perfil"
        );
    }
}

async function cargarCalificacion(vendedorId) {

    try {

        const response =
            await fetch(
                `http://localhost:3000/calificaciones?vendedorId=${vendedorId}`
            );

        const datos =
            await response.json();

        if (datos.length === 0) {

            document.getElementById(
                "calificacionValor"
            ).textContent = "0.0";

            document.getElementById(
                "calBarra"
            ).style.width = "0%";

            return;
        }

        const promedio =
            datos.reduce(
                (
                    acumulado,
                    calificacion
                ) =>
                    acumulado +
                    calificacion.puntuacion,
                0
            ) / datos.length;

        document.getElementById(
            "calificacionValor"
        ).textContent =
            promedio.toFixed(1);

        document.getElementById(
            "calBarra"
        ).style.width =
            `${promedio * 20}%`;

    } catch (error) {

        console.error(
            "Error cargando calificaciones:",
            error
        );
    }
}

// Inicialización
window.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarPerfil();

    }
);
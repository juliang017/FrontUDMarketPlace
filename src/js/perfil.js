// =============================================
// ENRUTADORES DE RED (TOLERANCIA A FALLOS)
// =============================================
const LOCAL_API_USUARIOS = "http://localhost:3000/usuarios";
const LOCAL_API_CALIFICACIONES = "http://localhost:3000/calificaciones";
const REAL_API_JAVA = "http://localhost:8080/api";

async function apiFetchIntegrado(urlReal, urlLocal, opciones = {}) {
    try {
        const response = await fetch(urlReal, opciones);
        if (!response.ok) throw new Error("Fallo API Real");
        return await response.json();
    } catch(e) {
        console.warn(`Fallback a local: ${urlLocal}`);
        const resLocal = await fetch(urlLocal, opciones);
        return await resLocal.json();
    }
}

// =============================================
// ESTADO Y CONFIGURACIÓN
// =============================================

// SOLUCIÓN: Agregado "telefono" a los campos dinámicos
const campos = [
    "primerNombre",
    "segundoNombre",
    "primerApellido",
    "segundoApellido",
    "fechaNacimiento",
    "telefono", 
    "correo"
];

const usuarioActualId = localStorage.getItem("usuarioId");
let usuarioActual = null;

// Configuración de Seguridad (Descomentar token cuando Java lo exija)
const jwt = localStorage.getItem("jwt");
const headersConfig = {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${jwt}` 
};

// =============================================
// CARGAR PERFIL
// =============================================
async function cargarPerfil() {
    const estadoCarga = document.getElementById("estadoCarga");
    
    // UX: Estado inicial Cargando
    if(estadoCarga) {
        estadoCarga.textContent = "Cargando...";
        estadoCarga.style.display = "inline-block";
        estadoCarga.style.backgroundColor = "#fbbf24"; // Amarillo
        estadoCarga.style.color = "#fff";
        estadoCarga.style.padding = "3px 8px";
        estadoCarga.style.borderRadius = "12px";
        estadoCarga.style.fontSize = "12px";
    }

    try {
        // 1. Obtener usuario (Intenta en Java /auth/me, si falla usa db.json)
        usuarioActual = await apiFetchIntegrado(
            `${REAL_API_JAVA}/auth/me`, 
            `${LOCAL_API_USUARIOS}/${usuarioActualId}`,
            { headers: headersConfig }
        );

        // Homologación de atributo de correo
        const correoHomologado = usuarioActual.correoInstitucional || usuarioActual.correo || "";

        // 2. Obtener calificaciones
        let calificacionesUsuario = [];
        try {
            const todasCalificaciones = await apiFetchIntegrado(
                `${REAL_API_JAVA}/valoraciones`, 
                LOCAL_API_CALIFICACIONES,
                { headers: headersConfig }
            );
            calificacionesUsuario = todasCalificaciones.filter(c => String(c.vendedorId) === String(usuarioActualId));
        } catch(e) {
            console.warn("No se pudieron cargar las calificaciones");
        }

        const promedio = calificacionesUsuario.length > 0
            ? calificacionesUsuario.reduce((suma, c) => suma + Number(c.puntuacion || c.valor), 0) / calificacionesUsuario.length
            : 0;

        // 3. Llenar Información Personal (Vista)
        document.getElementById("v-primerNombre").textContent = usuarioActual.primerNombre || "";
        document.getElementById("v-segundoNombre").textContent = usuarioActual.segundoNombre || "";
        document.getElementById("v-primerApellido").textContent = usuarioActual.primerApellido || "";
        document.getElementById("v-segundoApellido").textContent = usuarioActual.segundoApellido || "";
        document.getElementById("v-fechaNacimiento").textContent = usuarioActual.fechaNacimiento || "";
        document.getElementById("v-telefono").textContent = usuarioActual.telefono || ""; // SOLUCIÓN: Render de Teléfono
        document.getElementById("v-correo").textContent = correoHomologado;

        // 4. Llenar Inputs de Edición
        document.getElementById("i-primerNombre").value = usuarioActual.primerNombre || "";
        document.getElementById("i-segundoNombre").value = usuarioActual.segundoNombre || "";
        document.getElementById("i-primerApellido").value = usuarioActual.primerApellido || "";
        document.getElementById("i-segundoApellido").value = usuarioActual.segundoApellido || "";
        document.getElementById("i-fechaNacimiento").value = usuarioActual.fechaNacimiento || "";
        document.getElementById("i-telefono").value = usuarioActual.telefono || ""; // SOLUCIÓN: Input de Teléfono
        document.getElementById("i-correo").value = correoHomologado;

        // 5. Llenar Panel Lateral
        document.getElementById("nombreCompleto").textContent = `${usuarioActual.primerNombre || ""} ${usuarioActual.primerApellido || ""}`;
        document.getElementById("correoVisible").textContent = correoHomologado;
        document.getElementById("avatarIniciales").textContent = 
            (usuarioActual.primerNombre?.[0] || "") + (usuarioActual.primerApellido?.[0] || "");

        // 6. Calificación Visual
        document.getElementById("calificacionValor").textContent = promedio.toFixed(1);
        document.getElementById("calBarra").style.width = `${(promedio / 5) * 100}%`;

        // UX: Carga Exitosa
        if(estadoCarga) {
            estadoCarga.textContent = "Datos cargados ✓";
            estadoCarga.style.backgroundColor = "#10b981"; // Verde éxito
            
            // Oculta el letrero suavemente después de 3 segundos
            setTimeout(() => {
                estadoCarga.style.transition = "opacity 0.5s";
                estadoCarga.style.opacity = "0";
                setTimeout(() => estadoCarga.style.display = "none", 500);
            }, 3000);
        }

    } catch (error) {
        console.error("Error cargando perfil:", error);
        if(estadoCarga) {
            estadoCarga.textContent = "Error de conexión";
            estadoCarga.style.backgroundColor = "#ef4444"; // Rojo error
        }
        alert("No fue posible cargar la información del perfil.");
    }
}

cargarPerfil();

// =============================================
// CONTROLADORES DE EDICIÓN
// =============================================
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

// =============================================
// GUARDAR PERFIL ENRUTADO
// =============================================
async function guardarPerfil() {
    try {
        const datosActualizados = {
            ...usuarioActual,
            primerNombre: document.getElementById("i-primerNombre").value.trim(),
            segundoNombre: document.getElementById("i-segundoNombre").value.trim(),
            primerApellido: document.getElementById("i-primerApellido").value.trim(),
            segundoApellido: document.getElementById("i-segundoApellido").value.trim(),
            fechaNacimiento: document.getElementById("i-fechaNacimiento").value,
            telefono: document.getElementById("i-telefono").value.trim(), // SOLUCIÓN: Captura y envía el Teléfono
            correoInstitucional: document.getElementById("i-correo").value.trim(),
            correo: document.getElementById("i-correo").value.trim()
        };

        let response;
        try {
            // Intento 1: Actualizar en Java
            response = await fetch(`${REAL_API_JAVA}/admin/users/${usuarioActualId}`, {
                method: "PUT",
                headers: headersConfig,
                body: JSON.stringify(datosActualizados)
            });
            if(!response.ok) throw new Error("Fallo Java");
        } catch(e) {
            // Intento 2: Actualizar en Local db.json
            console.warn("Servidor Java no disponible. Actualizando perfil localmente.");
            response = await fetch(`${LOCAL_API_USUARIOS}/${usuarioActualId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosActualizados)
            });
        }

        if (!response.ok) throw new Error("No se pudo actualizar el perfil en ninguna base de datos");

        usuarioActual = datosActualizados;
        const correoHomologado = datosActualizados.correoInstitucional || datosActualizados.correo || "";

        // Actualizar vista post-guardado
        document.getElementById("v-primerNombre").textContent = datosActualizados.primerNombre;
        document.getElementById("v-segundoNombre").textContent = datosActualizados.segundoNombre;
        document.getElementById("v-primerApellido").textContent = datosActualizados.primerApellido;
        document.getElementById("v-segundoApellido").textContent = datosActualizados.segundoApellido;
        document.getElementById("v-fechaNacimiento").textContent = datosActualizados.fechaNacimiento;
        document.getElementById("v-telefono").textContent = datosActualizados.telefono; // Renderizar nuevo teléfono
        document.getElementById("v-correo").textContent = correoHomologado;

        document.getElementById("nombreCompleto").textContent = `${datosActualizados.primerNombre} ${datosActualizados.primerApellido}`;
        document.getElementById("correoVisible").textContent = correoHomologado;
        document.getElementById("avatarIniciales").textContent = 
            (datosActualizados.primerNombre?.[0] || "") + (datosActualizados.primerApellido?.[0] || "");

        cancelarEdicion();
        alert("Perfil actualizado correctamente");

    } catch (error) {
        console.error(error);
        alert("No fue posible actualizar el perfil");
    }
}
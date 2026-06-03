// =============================================
// CONFIGURACIÓN DE ENDPOINTS
// =============================================
const MODO_PRUEBA = true; // Cambiar a false cuando Java esté encendido
const API_GRUPO_1 = "http://localhost:8080/api";

// Variables globales para la vista
let correoGlobal = "";
let idUsuarioLocal = null;

// Botones de retroceso
document.getElementById("btnVolver1").addEventListener("click", () => window.location.href = "login.html");
document.getElementById("btnVolver2").addEventListener("click", () => window.location.href = "login.html");

// =============================================
// PASO 1: VALIDAR CORREO Y ENVIAR CÓDIGO
// =============================================
document.getElementById("formPaso1").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorPaso1 = document.getElementById("errorPaso1");
    const correoInput = document.getElementById("correoRecuperacion").value.trim();
    const btnSubmit = document.querySelector("#formPaso1 button[type='submit']");
    
    errorPaso1.textContent = "";

    if (!correoInput) {
        errorPaso1.textContent = "El correo es obligatorio.";
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Verificando...";

    if (MODO_PRUEBA) {
        // Validación con json-server (db.json)
        try {
            const res = await fetch("http://localhost:3000/usuarios");
            const usuarios = await res.json();
            
            // Reutiliza la misma lógica de búsqueda inteligente del login.js
            const user = usuarios.find(u => u.correo === correoInput || u.correoInstitucional === correoInput);
            
            if (!user) {
                errorPaso1.textContent = "Este correo no está registrado.";
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Enviar Código";
                return;
            }
            
            idUsuarioLocal = user.id;
            correoGlobal = correoInput;
            
            // Simulación exitosa
            alert("[PRUEBA LOCAL]: El código de verificación es 123456");
            mostrarPaso2();

        } catch (error) {
            errorPaso1.textContent = "Error al conectar con la base de datos local.";
        }
    } else {
        // Petición real al backend de Java
        try {
            const res = await fetch(`${API_GRUPO_1}/auth/recuperar-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correoUsuario: correoInput })
            });
            
            if (res.ok) {
                correoGlobal = correoInput;
                mostrarPaso2();
            } else {
                errorPaso1.textContent = "Ocurrió un error en el servidor.";
            }
        } catch (error) {
            errorPaso1.textContent = "No hay conexión con el backend de Java.";
        }
    }

    btnSubmit.disabled = false;
    btnSubmit.textContent = "Enviar Código";
});

// =============================================
// PASO 2: VERIFICAR CÓDIGO Y ACTUALIZAR CLAVE
// =============================================
document.getElementById("formPaso2").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorPaso2 = document.getElementById("errorPaso2");
    const token = document.getElementById("codigoRecuperacion").value.trim();
    const nuevaClave = document.getElementById("nuevaContrasena").value;
    const confirmarClave = document.getElementById("confirmarContrasena").value;
    const btnSubmit = document.querySelector("#formPaso2 button[type='submit']");

    errorPaso2.textContent = "";

    if (nuevaClave !== confirmarClave) {
        errorPaso2.textContent = "Las contraseñas no coinciden.";
        return;
    }
    if (nuevaClave.length < 8) {
        errorPaso2.textContent = "La contraseña debe tener al menos 8 caracteres.";
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Actualizando...";

    if (MODO_PRUEBA) {
        if (token !== "123456") {
            errorPaso2.textContent = "Código de verificación incorrecto.";
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Actualizar Contraseña";
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/usuarios/${idUsuarioLocal}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contrasena: nuevaClave })
            });
            
            if (res.ok) {
                alert("¡Contraseña actualizada exitosamente!");
                window.location.href = "login.html"; // Redirige al login para entrar
            }
        } catch (error) {
            errorPaso2.textContent = "Error al actualizar los datos localmente.";
        }
    } else {
        // Petición real al backend de Java
        try {
            const res = await fetch(`${API_GRUPO_1}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, nuevaPassword: nuevaClave })
            });
            
            if (res.ok) {
                alert("¡Contraseña restablecida correctamente!");
                window.location.href = "login.html";
            } else {
                errorPaso2.textContent = "El código de seguridad es inválido o ha expirado.";
            }
        } catch (error) {
            errorPaso2.textContent = "Error de conexión con el backend de Java.";
        }
    }

    btnSubmit.disabled = false;
    btnSubmit.textContent = "Actualizar Contraseña";
});

// =============================================
// FUNCIONES DE INTERFAZ
// =============================================
function mostrarPaso2() {
    document.getElementById("paso1").style.display = "none";
    document.getElementById("paso2").style.display = "block";
}
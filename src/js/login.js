// =============================================
// ENRUTADOR TOLERANTE A FALLOS
// =============================================
const LOCAL_API = "http://localhost:3000/usuarios";
const API_LOGIN_JAVA = "http://localhost:8080/api/auth/login";

const formulario = document.getElementById("formLogin");

document.getElementById("volver").addEventListener("click", () => {
  window.location.href = "index.html";
});

formulario.addEventListener("submit", async function (event) {
  event.preventDefault();

  const correoInput = document.getElementById("correo");
  const contrasenaInput = document.getElementById("contrasena");
  const error = document.querySelector(".error");
  const botonSubmit = formulario.querySelector('button[type="submit"]');

  error.textContent = "";
  const correoIngresado = correoInput.value.trim();

  // --- Validación del correo ---
  const regex = /^[a-zA-Z0-9._%+-]+@udistrital\.edu\.co$/;
  const esAdminUnico = correoIngresado === "admin@udmarketplace.com" || correoIngresado === "admin@udistrital.edu.co";

  if (!regex.test(correoIngresado) && !esAdminUnico) {
    error.textContent = "Debe ingresar un correo @udistrital.edu.co";
    return;
  }

  // --- Validación de la contraseña ---
  if (contrasenaInput.value.length < 8) {
    error.textContent = "La contraseña debe tener al menos 8 caracteres";
    return;
  }

  botonSubmit.disabled = true;
  botonSubmit.textContent = "Verificando...";

  try {
    // 1. INTENTO CON EL BACKEND REAL (JAVA)
    try {
        const payload = {
            correoUsuario: correoIngresado,
            contrasena: contrasenaInput.value
        };

        const responseReal = await fetch(API_LOGIN_JAVA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (responseReal.ok) {
            const data = await responseReal.json();
            // Guardamos el token JWT (si lo requiere el back) y los datos básicos
            localStorage.setItem("jwt", data.token); 
            localStorage.setItem("correoUsuario", correoIngresado);
            localStorage.setItem("userRole", data.rol || "USUARIO");
            
            window.location.href = "verificacion.html";
            return;
        }
        throw new Error("Credenciales inválidas en Java");
    } catch (e) {
        console.warn("⚠️ Servidor Java no responde. Probando validación local...");
    }

    // 2. FALLBACK A JSON-SERVER (Si Java falla o rechaza credenciales)
    const response = await fetch(LOCAL_API);
    if (!response.ok) throw new Error("Error al conectar con el servidor local");

    const todosLosUsuarios = await response.json();

    const usuarioEncontrado = todosLosUsuarios.find(u => 
      u.correo === correoIngresado || 
      u.correoInstitucional === correoIngresado
    );

    if (!usuarioEncontrado || usuarioEncontrado.contrasena !== contrasenaInput.value) {
      error.textContent = "Correo o contraseña incorrectos";
      return;
    }

    // Login local exitoso
    localStorage.setItem("correoUsuario", usuarioEncontrado.correo || usuarioEncontrado.correoInstitucional);
    localStorage.setItem("usuarioId", usuarioEncontrado.id);
    localStorage.setItem("userRole", usuarioEncontrado.rol || "USUARIO");

    window.location.href = "verificacion.html";

  } catch (err) {
    error.textContent = "No se pudo conectar con el sistema. Intenta de nuevo.";
    console.error(err);
  } finally {
    botonSubmit.disabled = false;
    botonSubmit.textContent = "Ingresar"; 
  }
});
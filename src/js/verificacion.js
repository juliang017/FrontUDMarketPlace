// =============================================
// MOSTRAR CORREO
// =============================================

const correo = localStorage.getItem("correoUsuario");
// Recuperamos el rol del db.json (si estamos usando el backend local)
const rolTemporal = localStorage.getItem("rolTemporal");

document.getElementById("mensajeCorreo").textContent =
  `Hemos enviado un código a ${correo}`;

// =============================================
// INPUTS OTP — navegación automática + borrado
// =============================================

const inputs = document.querySelectorAll(".otp");

inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g, "");
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  // Retrocede al input anterior al borrar
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.value === "" && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

// =============================================
// VERIFICACIÓN Y GENERACIÓN DE JWT
// =============================================

// Cambia a 'false' cuando te conectes al Java real
const MODO_PRUEBA = true; 
const CODIGO_PRUEBA = "123456";

document.getElementById("btnVerificar").addEventListener("click", async () => {
  let codigo = "";
  inputs.forEach((input) => (codigo += input.value));

  if (codigo.length !== 6) {
    mostrarError("Ingrese el código completo");
    return;
  }

  // --- FLUJO LOCAL (json-server db.json) ---
  if (MODO_PRUEBA) {
    if (codigo !== CODIGO_PRUEBA) {
      mostrarError("Código incorrecto. Usa 123456 en modo prueba");
      return;
    }

    // Tomamos el rol del db.json y lo aplicamos
    const rolSimulado = rolTemporal || "USUARIO";

    generarYGuardarJWT(correo, rolSimulado);
    redirigirPorRol(rolSimulado);
    return;
  }

  // --- FLUJO REAL CON BACKEND (JAVA) ---
  try {
    const response = await fetch("http://localhost:8080/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo2FA: codigo }),
    });

    if (!response.ok) {
      mostrarError("Código incorrecto o expirado");
      return;
    }

    const data = await response.json();

    if (data.token) {
      // El backend nos da el token real firmado
      localStorage.setItem("jwt", data.token);
      
      // Extraemos el rol del Token que manda el backend
      const payload = parseJWT(data.token);
      let rolBackend = payload.rolUsua || payload.role || payload.rol || "USUARIO";
      
      // SOLUCIÓN AL PROBLEMA DEL BACKEND:
      // Si el backend manda "COMPRADOR" o "VENDEDOR", el Frontend lo ignora y lo unifica como "USUARIO"
      // Así la persona podrá comprar y vender con la misma cuenta. 
      // Si es "ADMINISTRADOR", se respeta y se va a su panel seguro.
      if (rolBackend !== "ADMINISTRADOR") {
          rolBackend = "USUARIO";
      }

      // Guardamos el rol global para el index.js
      localStorage.setItem("userRole", rolBackend);
      redirigirPorRol(rolBackend);
      return;
    }

  } catch (err) {
    mostrarError("No se pudo conectar con el servidor real");
    console.error(err);
  }
});

// =============================================
// REENVIAR CÓDIGO
// =============================================

document.getElementById("btnReenviar").addEventListener("click", async () => {
  if (MODO_PRUEBA) {
    alert("Modo prueba: el código es 123456");
    return;
  }

  try {
    await fetch("http://localhost:8080/api/auth/resend-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo }),
    });
    alert(`Código reenviado a ${correo}`);
  } catch (err) {
    mostrarError("No se pudo reenviar el código");
  }
});

// =============================================
// FUNCIONES AUXILIARES
// =============================================

function generarYGuardarJWT(correo, rol) {
  const header  = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: localStorage.getItem("usuarioId") || "1",
    correo,
    rol,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora
  }));
  const jwt = `${header}.${payload}.firma_simulada`;
  
  localStorage.setItem("jwt", jwt);
  localStorage.setItem("userRole", rol); // Guardamos para index.js
}

function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function redirigirPorRol(rol) {
  // Como unificamos roles, solo hay dos caminos posibles:
  if (rol === "ADMINISTRADOR") {
    window.location.href = "admin.html"; // Entorno seguro y aislado
  } else {
    window.location.href = "index.html"; // Compradores y Vendedores entran al Marketplace
  }
}

function mostrarError(mensaje) {
  const errorEl = document.querySelector(".error");
  if (errorEl) {
    errorEl.textContent = mensaje;
  } else {
    alert(mensaje);
  }
}
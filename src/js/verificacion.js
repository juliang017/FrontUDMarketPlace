// =============================================
// MOSTRAR CORREO
// =============================================

const correo = localStorage.getItem("correoUsuario");

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

const MODO_PRUEBA = true;
const CODIGO_PRUEBA = "123456";

document.getElementById("btnVerificar").addEventListener("click", async () => {
  let codigo = "";
  inputs.forEach((input) => (codigo += input.value));

  if (codigo.length !== 6) {
    mostrarError("Ingrese el código completo");
    return;
  }

  if (MODO_PRUEBA) {
    if (codigo !== CODIGO_PRUEBA) {
      mostrarError("Código incorrecto. Usa 123456 en modo prueba");
      return;
    }

    // Simula respuesta del backend con rol
    const rolSimulado = "ADMIN"; // Cambia a "ADMIN" para probar ese flujo

    generarYGuardarJWT(correo, rolSimulado);
    redirigirPorRol(rolSimulado);
    return;
  }

  // --- Flujo real con backend ---
  try {
    const response = await fetch("http://localhost:3000/verificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo }),
    });

    if (!response.ok) {
      mostrarError("Código incorrecto o expirado");
      return;
    }

    const data = await response.json();

    // Si el backend ya devuelve el JWT directamente:
    if (data.token) {
      localStorage.setItem("jwt", data.token);
      redirigirPorRol(parseJWT(data.token)?.rol);
      return;
    }

    // Si el backend devuelve solo el rol y generamos el JWT localmente:
    generarYGuardarJWT(correo, data.rol);
    redirigirPorRol(data.rol);

  } catch (err) {
    mostrarError("No se pudo conectar con el servidor");
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
    await fetch("http://localhost:3000/reenviar-codigo", {
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
}

function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function redirigirPorRol(rol) {
  if (rol === "ADMIN") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "index.html";
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
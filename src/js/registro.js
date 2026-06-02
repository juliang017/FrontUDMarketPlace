// =============================================
// VALIDACIÓN EN TIEMPO REAL — CORREO
// =============================================

const correo = document.getElementById("correo");
const regexCorreo = /^[a-zA-Z0-9._%+-]+@udistrital\.edu\.co$/;

correo.addEventListener("input", () => {
  if (correo.value === "") {
    correo.style.borderColor = "#cbd5e1";
  } else if (regexCorreo.test(correo.value)) {
    correo.style.borderColor = "#22c55e";
  } else {
    correo.style.borderColor = "#ef4444";
  }
});

// =============================================
// VALIDACIÓN EN TIEMPO REAL — CONTRASEÑAS
// =============================================

const contrasena        = document.getElementById("contrasena");
const confirmarContrasena = document.getElementById("confirmarContrasena");

contrasena.addEventListener("input", () => {
  if (contrasena.value === "") {
    contrasena.style.borderColor = "#cbd5e1";
  } else if (contrasena.value.length >= 8) {
    contrasena.style.borderColor = "#22c55e";
  } else {
    contrasena.style.borderColor = "#ef4444";
  }
  // Revalida confirmación si ya tiene algo escrito
  if (confirmarContrasena.value !== "") {
    validarConfirmacion();
  }
});

confirmarContrasena.addEventListener("input", validarConfirmacion);

function validarConfirmacion() {
  if (confirmarContrasena.value === "") {
    confirmarContrasena.style.borderColor = "#cbd5e1";
  } else if (confirmarContrasena.value === contrasena.value) {
    confirmarContrasena.style.borderColor = "#22c55e";
  } else {
    confirmarContrasena.style.borderColor = "#ef4444";
  }
}

// =============================================
// SUBMIT — VALIDACIÓN + ENVÍO A JSON-SERVER
// =============================================

const formulario = document.getElementById("formRegistro");

formulario.addEventListener("submit", async function (event) {
  event.preventDefault();
  limpiarErrores();

  const primerNombre      = document.getElementById("primerNombre");
  const primerApellido    = document.getElementById("primerApellido");
  const fechaNacimiento   = document.getElementById("fechaNacimiento");
  const telefono          = document.getElementById("telefono");
  const botonSubmit       = formulario.querySelector('button[type="submit"]');

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
  let valido = true;

  if (primerNombre.value.trim() === "" || !regexNombre.test(primerNombre.value)) {
    mostrarError(primerNombre, "Ingrese un nombre válido");
    valido = false;
  }

  if (primerApellido.value.trim() === "" || !regexNombre.test(primerApellido.value)) {
    mostrarError(primerApellido, "Ingrese un apellido válido");
    valido = false;
  }

  if (fechaNacimiento.value === "") {
    mostrarError(fechaNacimiento, "Seleccione una fecha");
    valido = false;
  }

  if (correo.value.trim() === "") {
    mostrarError(correo, "Ingrese el correo institucional");
    valido = false;
  } else if (!regexCorreo.test(correo.value.trim())) {
    mostrarError(correo, "Debe terminar en @udistrital.edu.co");
    valido = false;
  }

  if (!/^\d{10}$/.test(telefono.value.trim())) {
    mostrarError(telefono, "Ingrese un teléfono válido de 10 dígitos");
    valido = false;
  }

  if (contrasena.value.length < 8) {
    mostrarError(contrasena, "La contraseña debe tener al menos 8 caracteres");
    valido = false;
  }

  if (confirmarContrasena.value !== contrasena.value) {
    mostrarError(confirmarContrasena, "Las contraseñas no coinciden");
    valido = false;
  }

  if (!valido) return;

  // --- Verificar si el correo ya está registrado ---
  try {
    botonSubmit.disabled = true;
    botonSubmit.textContent = "Registrando...";

    const checkResponse = await fetch(
      `http://localhost:3000/usuarios?correo=${encodeURIComponent(correo.value.trim())}`
    );
    const existentes = await checkResponse.json();

    if (existentes.length > 0) {
      mostrarError(correo, "Este correo ya está registrado");
      return;
    }

    // --- Registrar usuario en json-server ---
    const nuevoUsuario = {
      primerNombre:    primerNombre.value.trim(),
      primerApellido:  primerApellido.value.trim(),
      fechaNacimiento: fechaNacimiento.value,
      telefono:        telefono.value.trim(),
      correo:          correo.value.trim(),
      contrasena:      contrasena.value,   // en producción: hash desde el backend
      rol:             "USUARIO",
    };

    const registroResponse = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    });

    if (!registroResponse.ok) throw new Error("Error al registrar usuario");

    const usuarioCreado = await registroResponse.json();

    // Guarda datos mínimos para la verificación
    localStorage.setItem("correoUsuario", usuarioCreado.correo);
    localStorage.setItem("usuarioId", usuarioCreado.id);

    window.location.href = "verificacion.html";

  } catch (err) {
    alert("No se pudo conectar con el servidor. Verifica que json-server esté activo.");
    console.error(err);
  } finally {
    botonSubmit.disabled = false;
    botonSubmit.textContent = "Crear Cuenta"; // ajusta al texto original de tu botón
  }
});

// =============================================
// FUNCIONES AUXILIARES
// =============================================

function mostrarError(input, mensaje) {
  input.parentElement.querySelector(".error").textContent = mensaje;
}

function limpiarErrores() {
  document.querySelectorAll(".error").forEach((error) => {
    error.textContent = "";
  });
}

document.getElementById("volver").addEventListener("click", () => {
  window.location.href = "index.html";
});
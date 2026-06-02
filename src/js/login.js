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

  // --- Validación del correo ---
  const regex = /^[a-zA-Z0-9._%+-]+@udistrital\.edu\.co$/;
  if (!regex.test(correoInput.value.trim())) {
    error.textContent = "Debe ingresar un correo @udistrital.edu.co";
    return;
  }

  // --- Validación de la contraseña ---
  if (contrasenaInput.value.length < 8) {
    error.textContent = "La contraseña debe tener al menos 8 caracteres";
    return;
  }

  // --- Envío al backend (json-server) ---
  botonSubmit.disabled = true;
  botonSubmit.textContent = "Verificando...";

  try {
    // Busca el usuario filtrando por correo en json-server
    const response = await fetch(
      `http://localhost:3000/usuarios?correo=${encodeURIComponent(correoInput.value.trim())}`
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const usuarios = await response.json();

    if (usuarios.length === 0) {
      error.textContent = "Correo o contraseña incorrectos";
      return;
    }

    const usuario = usuarios[0];

    // Comparación de contraseña (texto plano para json-server mock)
    if (usuario.contrasena !== contrasenaInput.value) {
      error.textContent = "Correo o contraseña incorrectos";
      return;
    }

    // Login exitoso
    localStorage.setItem("correoUsuario", usuario.correo);
    localStorage.setItem("usuarioId", usuario.id);

    window.location.href = "verificacion.html";

  } catch (err) {
    error.textContent = "No se pudo conectar con el servidor. Intenta de nuevo.";
    console.error(err);
  } finally {
    botonSubmit.disabled = false;
    botonSubmit.textContent = "Ingresar"; // ajusta al texto original de tu botón
  }
});
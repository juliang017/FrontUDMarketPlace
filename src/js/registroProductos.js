// =============================================
// UTILIDAD JWT
// =============================================

function parseJWT(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

const jwt       = localStorage.getItem("jwt");
const payload   = parseJWT(jwt);
const usuarioId = payload?.sub || localStorage.getItem("usuarioId");

if (!usuarioId) window.location.href = "login.html";

// =============================================
// REFERENCIAS AL DOM
// =============================================

const formulario          = document.getElementById("formRegistroProductos");
const nombreProducto      = document.getElementById("nombreProducto");
const descripcionProducto = document.getElementById("descripcion");
const sedeSelect          = document.getElementById("sede");
const precio              = document.getElementById("precio");
const imagen              = document.getElementById("imagen");
const categoriaSelect     = document.getElementById("categoria");

document.getElementById("btnRegresar").addEventListener("click", () => {
  window.location.href = "venderProductos.html";
});

// =============================================
// CARGA DE SELECTS DESDE JSON-SERVER
// =============================================

async function cargarSelects() {
  try {
    const [resCats, resSedes] = await Promise.all([
      fetch("http://localhost:3000/categorias"),
      fetch("http://localhost:3000/sedes"),
    ]);

    if (!resCats.ok || !resSedes.ok) throw new Error("Error al cargar datos");

    const categorias = await resCats.json();
    const sedes      = await resSedes.json();

    categoriaSelect.innerHTML = `<option value="">Selecciona una categoría</option>`;
    categorias.forEach(cat => {
      categoriaSelect.innerHTML +=
        `<option value="${cat.id}">${cat.nombre}</option>`;
    });

    sedeSelect.innerHTML = `<option value="">Selecciona una sede</option>`;
    sedes.forEach(sede => {
      sedeSelect.innerHTML +=
        `<option value="${sede.id}">${sede.nombre} — ${sede.descripcion}</option>`;
    });

  } catch (err) {
    console.error("Error cargando selects:", err);
  }
}

cargarSelects();

// =============================================
// VALIDACIONES EN TIEMPO REAL
// =============================================

precio.addEventListener("input", () => {
  precio.value = precio.value.replace(/[^0-9]/g, "");
});

imagen.addEventListener("change", () => validarImagen(imagen));

[nombreProducto, descripcionProducto, precio].forEach(campo => {
  campo.addEventListener("blur", () => validarCampo(campo));
});

[categoriaSelect, sedeSelect].forEach(select => {
  select.addEventListener("change", () => validarCampo(select));
});

// =============================================
// SUBMIT — POST A JSON-SERVER
// =============================================

document.getElementById("btnRegistrar").addEventListener("click", async (event) => {
  event.preventDefault();

  let valido = true;
  if (!validarCampo(nombreProducto))      valido = false;
  if (!validarCampo(descripcionProducto)) valido = false;
  if (!validarCampo(precio))              valido = false;
  if (!validarCampo(sedeSelect))          valido = false;
  if (!validarCampo(categoriaSelect))     valido = false;
  if (!validarImagen(imagen))             valido = false;

  if (!valido) return;

  const btnRegistrar = document.getElementById("btnRegistrar");
  btnRegistrar.disabled = true;
  btnRegistrar.textContent = "Registrando...";

  try {
    // json-server no sirve imágenes binarias — se usa la URL de picsum como placeholder
    // En producción reemplaza esto por la URL devuelta por tu backend de almacenamiento
    const imagenUrl = imagen.files[0]
      ? URL.createObjectURL(imagen.files[0])
      : "https://picsum.photos/400/300";

    const nuevoProducto = {
      nombreProducto:      nombreProducto.value.trim(),
      descripcionProducto: descripcionProducto.value.trim(),
      precio:              parseInt(precio.value, 10),
      categoriaId:         categoriaSelect.value,
      sedeId:              sedeSelect.value,
      imagen:              imagenUrl,
      usuarioId:           usuarioId,
    };

    const response = await fetch("http://localhost:3000/productos", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(nuevoProducto),
    });

    if (!response.ok) throw new Error("Error al registrar el producto");

    alert("¡Producto publicado correctamente!");
    window.location.href = "venderProductos.html";

  } catch (err) {
    alert("No se pudo conectar con el servidor. Verifica que json-server esté activo.");
    console.error(err);
  } finally {
    btnRegistrar.disabled = false;
    btnRegistrar.textContent = "Completar Registro →";
  }
});

// =============================================
// FUNCIONES AUXILIARES
// =============================================

function validarCampo(input) {
  const valor = input.value.trim();
  if (valor === "") {
    mostrarError(input, "Este campo es obligatorio");
    return false;
  }
  limpiarError(input);
  return true;
}

function validarImagen(input) {
  if (!input.files || input.files.length === 0) {
    mostrarError(input, "Debe seleccionar una imagen");
    return false;
  }
  if (!input.files[0].type.startsWith("image/")) {
    mostrarError(input, "El archivo debe ser una imagen");
    input.value = "";
    return false;
  }
  limpiarError(input);
  return true;
}

function mostrarError(input, mensaje) {
  input.parentElement.querySelector(".error").textContent = mensaje;
}

function limpiarError(input) {
  const err = input.parentElement.querySelector(".error");
  if (err) err.textContent = "";
}
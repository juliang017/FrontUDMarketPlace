// =============================================
// ENRUTADOR TOLERANTE A FALLOS
// =============================================
const LOCAL_API = "http://localhost:3000";
const REAL_API_JAVA = "http://localhost:8080/api";
const REAL_API_PYTHON = "http://localhost:8000/sedes";

async function apiFetchIntegrado(urlReal, urlLocal, opciones = {}) {
    try {
        const response = await fetch(urlReal, opciones);
        if (!response.ok) throw new Error("Fallo API Real");
        return await response.json(); // En Java devuelve JSON
    } catch(e) {
        console.warn(`Fallback a local: ${urlLocal}`);
        const resLocal = await fetch(urlLocal, opciones);
        return await resLocal.json();
    }
}

async function apiFetchIntegradoNoJSON(urlReal, urlLocal, opciones = {}) {
    // Igual a la anterior pero sin el .json() (Útil para métodos DELETE que devuelven Status 204)
    try {
        const response = await fetch(urlReal, opciones);
        if (!response.ok) throw new Error("Fallo API Real");
        return response; 
    } catch(e) {
        console.warn(`Fallback a local: ${urlLocal}`);
        return await fetch(urlLocal, opciones);
    }
}

let terminoBusqueda   = "";
let todosLosProductos = [];
let todasLasSedes     = [];

// =============================================
// UTILIDAD JWT
// =============================================

function parseJWT(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

function tokenEsValido(token) {
  if (!token) return false;
  const payload = parseJWT(token);
  if (!payload) return false;
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    localStorage.removeItem("jwt");
    return false;
  }
  return true;
}

// =============================================
// PROTECCIÓN DE RUTA
// =============================================

const jwt = localStorage.getItem("jwt");
if (!tokenEsValido(jwt)) window.location.href = "login.html";

const usuarioId = parseJWT(jwt)?.sub || localStorage.getItem("usuarioId");

const headersAuth = {
    "Content-Type": "application/json",
    // "Authorization": `Bearer ${jwt}` // Descomenta cuando Java active la seguridad
};

// =============================================
// NAVEGACIÓN
// =============================================

document.getElementById("btnComprarProductos").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("btnPerfil").addEventListener("click", () => {
  window.location.href = "perfil.html";
});
document.getElementById("btnAgregarProducto").addEventListener("click", () => {
  window.location.href = "registroProducto.html";
});
document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// =============================================
// BÚSQUEDA POR NOMBRE
// =============================================

const inputBusqueda = document.querySelector(".busqueda input");

inputBusqueda.addEventListener("input", () => {
  terminoBusqueda = inputBusqueda.value.trim().toLowerCase();
  aplicarFiltros();
});

// =============================================
// FILTRADO CENTRAL
// =============================================

function aplicarFiltros() {
  const resultado = terminoBusqueda === ""
    ? todosLosProductos
    : todosLosProductos.filter(p =>
        p.nombreProducto.toLowerCase().includes(terminoBusqueda)
      );
  renderizarProductos(resultado);
}

// =============================================
// CARGA DE PRODUCTOS DEL USUARIO (ENRUTADA)
// =============================================

const contenedor = document.getElementById("contenedorMisProductos");

async function cargarMisProductos() {
  try {
    // 1. EL CÓMO: Usamos la función enrutadora para pegarle a Java y a Python primero
    const [resProd, resSedes] = await Promise.all([
      apiFetchIntegrado(`${REAL_API_JAVA}/productos`, `${LOCAL_API}/productos`, { headers: headersAuth }),
      apiFetchIntegrado(REAL_API_PYTHON, `${LOCAL_API}/sedes`, { headers: headersAuth }),
    ]);

    // 2. EL QUÉ: Filtramos a nivel de Front los productos de ESTE usuario
    todosLosProductos = resProd.filter(p => String(p.usuarioId) === String(usuarioId));
    todasLasSedes     = resSedes;

    aplicarFiltros();

  } catch (err) {
    contenedor.innerHTML =
      "<p class='error-carga'>Fallo general de servidores (Real y Local apagados).</p>";
    console.error(err);
  }
}

// =============================================
// RENDER
// =============================================

function renderizarProductos(productos) {
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = terminoBusqueda !== ""
      ? `<div class="estado-vacio"><p>No se encontraron productos con ese nombre.</p></div>`
      : `<div class="estado-vacio">
           <p>Aún no tienes productos publicados.</p>
           <button onclick="window.location.href='registroProducto.html'">
             + Publicar mi primer producto
           </button>
         </div>`;
    return;
  }

  productos.forEach(producto => {
    // Solución para compatibilidad de sede.nombre (Local) vs sede.name (Python)
    const sede = todasLasSedes.find(s => String(s.id) === String(producto.sedeId));
    const nombreSede = sede ? (sede.name || sede.nombre) : "Sede no especificada";

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = producto.id;
    card.innerHTML = `
      <img
        src="${producto.imagen}"
        alt="${producto.nombreProducto}"
        onerror="this.src='img/placeholder.jpg'">
      <div class="info">
        <h3>${producto.nombreProducto}</h3>
        <p>${producto.descripcionProducto}</p>
        <h4>$${producto.precio.toLocaleString("es-CO")}</h4>
        <span class="sede">📍 ${nombreSede}</span>
        <div class="acciones">
          <button class="btn-editar" data-id="${producto.id}">Editar</button>
          <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
        </div>
      </div>
    `;

    card.querySelector(".btn-editar").addEventListener("click", () => {
      editarProducto(producto.id);
    });
    card.querySelector(".btn-eliminar").addEventListener("click", () => {
      eliminarProducto(producto.id, card);
    });

    contenedor.appendChild(card);
  });
}

// =============================================
// ACCIONES (ENRUTADAS)
// =============================================

function editarProducto(id) {
  localStorage.setItem("productoEditarId", id);
  window.location.href = "registroProducto.html";
}

async function eliminarProducto(id, cardElement) {
  if (!confirm("¿Seguro que quieres eliminar este producto permanentemente?")) return;

  try {
    // EL CÓMO: Intentamos hacer DELETE en Java (api/seller/productos/id)
    const response = await apiFetchIntegradoNoJSON(
        `${REAL_API_JAVA}/seller/productos/${id}`, 
        `${LOCAL_API}/productos/${id}`, 
        { method: "DELETE", headers: headersAuth }
    );

    if (!response.ok) throw new Error("Error al eliminar");

    cardElement.style.transition = "opacity 0.3s, transform 0.3s";
    cardElement.style.opacity = "0";
    cardElement.style.transform = "scale(0.95)";
    setTimeout(() => {
      cardElement.remove();
      todosLosProductos = todosLosProductos.filter(p => String(p.id) !== String(id));
      if (todosLosProductos.length === 0) renderizarProductos([]); // Re-render para mostrar el estado vacío
    }, 300);

  } catch (err) {
    alert("No se pudo eliminar el producto. Intenta de nuevo.");
    console.error(err);
  }
}

// =============================================
// ARRANQUE
// =============================================

cargarMisProductos();
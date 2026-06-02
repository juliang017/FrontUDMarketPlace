// =============================================
// UTILIDAD JWT
// =============================================

function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
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
// BOTONES SEGÚN ESTADO DE SESIÓN
// =============================================

const acciones = document.getElementById("accionesUsuario");
const jwt = localStorage.getItem("jwt");
const usuarioLogueado = tokenEsValido(jwt);

if (usuarioLogueado) {
  acciones.innerHTML = `
    <button type="button" id="btnVender">Vender Producto</button>
    <button type="button" id="btnPerfil">Mi Perfil</button>
    <button type="button" id="btnCerrarSesion">Cerrar Sesión</button>
  `;
  document.getElementById("btnVender").addEventListener("click", () => {
    window.location.href = "venderProductos.html";
  });
  document.getElementById("btnPerfil").addEventListener("click", () => {
    window.location.href = "perfil.html";
  });
  document.getElementById("btnCerrarSesion").addEventListener("click", cerrarSesion);
} else {
  acciones.innerHTML = `
    <button type="button" id="btnLogin">Iniciar Sesión</button>
    <button type="button" id="btnRegistro">Crear Cuenta</button>
  `;
  document.getElementById("btnLogin").addEventListener("click", () => {
    window.location.href = "login.html";
  });
  document.getElementById("btnRegistro").addEventListener("click", () => {
    window.location.href = "registro.html";
  });
}

// =============================================
// DATOS Y ESTADO DEL FILTRO
// =============================================

let todosLosProductos = [];
let todasLasSedes     = [];
let categoriaActiva   = "todas";

// =============================================
// CARGA INICIAL — productos, sedes y categorías
// =============================================

const contenedor = document.getElementById("contenedorProductos");

async function inicializar() {
  try {
    const [resProd, resSedes, resCats] = await Promise.all([
      fetch("http://localhost:3000/productos"),
      fetch("http://localhost:3000/sedes"),
      fetch("http://localhost:3000/categorias"),
    ]);

    if (!resProd.ok || !resSedes.ok || !resCats.ok) {
      throw new Error("Error al obtener datos");
    }

    todosLosProductos = await resProd.json();
    todasLasSedes     = await resSedes.json();
    const categorias  = await resCats.json();

    construirFiltros(categorias);
    renderizarProductos(todosLosProductos);

  } catch (err) {
    contenedor.innerHTML =
      "<p>No se pudieron cargar los productos. Verifica que json-server esté activo.</p>";
    console.error(err);
  }
}

// =============================================
// FILTROS POR CATEGORÍA
// =============================================

function construirFiltros(categorias) {
  const filtrosContainer = document.getElementById("filtrosCategorias");
  if (!filtrosContainer) return;

  // Botón "Todas"
  filtrosContainer.innerHTML = `
    <button class="btn-filtro activo" data-id="todas">Todas</button>
    ${categorias.map(cat => `
      <button class="btn-filtro" data-id="${cat.id}">${cat.nombre}</button>
    `).join("")}
  `;

  filtrosContainer.querySelectorAll(".btn-filtro").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Actualiza botón activo
      filtrosContainer
        .querySelectorAll(".btn-filtro")
        .forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");

      categoriaActiva = btn.dataset.id;

      const filtrados =
        categoriaActiva === "todas"
          ? todosLosProductos
          : todosLosProductos.filter((p) => p.categoriaId === categoriaActiva);

      renderizarProductos(filtrados);
    });
  });
}

// =============================================
// RENDER DE PRODUCTOS
// =============================================

function renderizarProductos(productos) {
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
    return;
  }

  productos.forEach((producto) => {
    const sede = todasLasSedes.find((s) => s.id === producto.sedeId);
    const nombreSede = sede ? sede.nombre : "Sede no especificada";

    contenedor.innerHTML += `
      <div class="card">
        <img
          src="${producto.imagen}"
          alt="${producto.nombreProducto}"
          onerror="this.src='img/placeholder.jpg'"
        >
        <div class="info">
          <h3>${producto.nombreProducto}</h3>
          <p>${producto.descripcionProducto}</p>
          <h4>$${producto.precio.toLocaleString("es-CO")}</h4>
          <span>📍 ${nombreSede}</span>
        </div>
      </div>
    `;
  });
}

// =============================================
// CERRAR SESIÓN
// =============================================

function cerrarSesion() {
  localStorage.removeItem("jwt");
  localStorage.clear();
  window.location.href = "index.html";
}

// =============================================
// ARRANQUE
// =============================================

inicializar();
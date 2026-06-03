// =============================================
// ESTADO GLOBAL
// =============================================

let terminoBusqueda   = "";
let todosLosProductos = [];
let todasLasSedes     = [];
let categoriaActiva   = "todas";

// =============================================
// CONFIGURACIÓN DE APIS
// =============================================

const LOCAL_API      = "http://localhost:3000";
const REAL_API_GRUPO_1 = "http://localhost:8080/api";
const REAL_API_GRUPO_2 = "http://localhost:8000";

async function fetchConRespaldo(urlReal, urlLocal, opciones = {}) {
  try {
    const response = await fetch(urlReal, opciones);
    if (!response.ok) throw new Error("Backend real arrojó error HTTP");
    return await response.json();
  } catch {
    console.warn(`⚠️ Backend real caído. Usando local: ${urlLocal}`);
    try {
      const responseLocal = await fetch(urlLocal, opciones);
      if (!responseLocal.ok) throw new Error("json-server también falló");
      return await responseLocal.json();
    } catch (errorLocal) {
      console.error(`❌ Falló local: ${urlLocal}`, errorLocal);
      return []; // evita romper el Promise.all
    }
  }
}

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
// BOTONES SEGÚN SESIÓN Y ROL
// =============================================

const acciones      = document.getElementById("accionesUsuario");
const jwt           = localStorage.getItem("jwt");
const usuarioLogueado = tokenEsValido(jwt);
const rolUsuario    = localStorage.getItem("userRole");

const headersAdmin  = { "Content-Type": "application/json" };

if (usuarioLogueado) {
  const btnPanelAdmin = rolUsuario === "ADMINISTRADOR"
    ? `<a href="admin.html" id="btnAdminIndex"
        style="background:#1e3a8a;color:white;padding:5px 15px;border-radius:5px;
               text-decoration:none;font-weight:bold;margin-right:10px;">
        Panel Admin
       </a>`
    : "";

  const btnVender = rolUsuario !== "ADMINISTRADOR"
    ? `<button type="button" id="btnVender" style="margin-right:10px;">Vender Producto</button>`
    : "";

  acciones.innerHTML = `
    ${btnPanelAdmin}
    <button type="button" id="btnPQRS"
      style="background:#10b981;color:white;border:none;padding:5px 15px;
             border-radius:5px;font-weight:bold;cursor:pointer;margin-right:10px;">
      Soporte / PQRS
    </button>
    ${btnVender}
    <button type="button" id="btnPerfil">Mi Perfil</button>
    <button type="button" id="btnCerrarSesion">Cerrar Sesión</button>
  `;

  document.getElementById("btnVender")
    ?.addEventListener("click", () => { window.location.href = "venderProductos.html"; });

  document.getElementById("btnPQRS")
    ?.addEventListener("click", () => { window.location.href = "pqr.html"; });

  document.getElementById("btnPerfil")
    .addEventListener("click", () => { window.location.href = "perfil.html"; });

  document.getElementById("btnCerrarSesion")
    .addEventListener("click", cerrarSesion);

} else {
  acciones.innerHTML = `
    <button type="button" id="btnLogin">Iniciar Sesión</button>
    <button type="button" id="btnRegistro">Crear Cuenta</button>
  `;
  document.getElementById("btnLogin")
    .addEventListener("click", () => { window.location.href = "login.html"; });
  document.getElementById("btnRegistro")
    .addEventListener("click", () => { window.location.href = "registro.html"; });
}

// =============================================
// CARGA INICIAL
// =============================================

const contenedor = document.getElementById("contenedorProductos");

async function inicializar() {
  try {
    const [productos, sedes, categorias] = await Promise.all([
      fetchConRespaldo(`${REAL_API_GRUPO_1}/productos`,  `${LOCAL_API}/productos`),
      fetchConRespaldo(`${REAL_API_GRUPO_2}/sedes`,      `${LOCAL_API}/sedes`),
      fetchConRespaldo(`${REAL_API_GRUPO_1}/categorias`, `${LOCAL_API}/categorias`),
    ]);

    todosLosProductos = productos;
    todasLasSedes     = sedes;

    construirFiltros(categorias);
    aplicarFiltros();

  } catch (err) {
    contenedor.innerHTML = "<p>Error crítico de red. Verifica los servidores.</p>";
    console.error(err);
  }
}

// =============================================
// BÚSQUEDA POR NOMBRE
// =============================================

document.querySelector(".busqueda input")
  ?.addEventListener("input", (e) => {
    terminoBusqueda = e.target.value.trim().toLowerCase();
    aplicarFiltros();
  });

// =============================================
// FILTRADO CENTRAL
// =============================================

function aplicarFiltros() {
  let resultado = categoriaActiva === "todas"
    ? todosLosProductos
    : todosLosProductos.filter(p =>
        String(p.categoriaId) === String(categoriaActiva)
      );

  if (terminoBusqueda !== "") {
    resultado = resultado.filter(p =>
      p.nombreProducto.toLowerCase().includes(terminoBusqueda)
    );
  }

  renderizarProductos(resultado);
}

// =============================================
// FILTROS POR CATEGORÍA
// =============================================

function construirFiltros(categorias) {
  const filtrosContainer = document.getElementById("filtrosCategorias");
  if (!filtrosContainer) return;

  filtrosContainer.innerHTML = `
    <button class="btn-filtro activo" data-id="todas">Todas</button>
    ${categorias.map(cat =>
      `<button class="btn-filtro" data-id="${cat.id}">${cat.nombre}</button>`
    ).join("")}
  `;

  filtrosContainer.querySelectorAll(".btn-filtro").forEach(btn => {
    btn.addEventListener("click", () => {
      filtrosContainer.querySelectorAll(".btn-filtro")
        .forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      categoriaActiva = btn.dataset.id;
      aplicarFiltros();
    });
  });
}

// =============================================
// RENDER DE PRODUCTOS
// =============================================

function renderizarProductos(productos) {
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = `
      <p>${terminoBusqueda
        ? "No se encontraron productos con ese nombre."
        : "No hay productos en esta categoría."
      }</p>`;
    return;
  }

  productos.forEach(producto => {
    const sede = todasLasSedes.find(s =>
      String(s.id) === String(producto.sedeId)
    );
    const nombreSede = sede ? (sede.nombre || sede.name) : "Sede no especificada";

    const controlesAdmin = rolUsuario === "ADMINISTRADOR" ? `
      <div style="margin-top:10px;display:flex;gap:5px;width:100%;">
        <button onclick="editarPrecioDesdeIndex('${producto.id}')"
          style="background:#f59e0b;color:white;border:none;padding:8px;
                 border-radius:4px;cursor:pointer;flex:1;">
          Editar
        </button>
        <button onclick="eliminarProductoDesdeIndex('${producto.id}')"
          style="background:#ef4444;color:white;border:none;padding:8px;
                 border-radius:4px;cursor:pointer;flex:1;">
          Borrar
        </button>
      </div>
    ` : "";

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = producto.id;
    card.style.cursor = "pointer";

    card.onclick = (event) => {
      if (event.target.tagName === "BUTTON") return;
      window.location.href = `detalleProducto.html?id=${producto.id}`;
    };

    card.innerHTML = `
      <img
        src="${producto.imagen}"
        alt="${producto.nombreProducto}"
        onerror="this.src='img/placeholder.jpg'">
      <div class="info">
        <h3>${producto.nombreProducto}</h3>
        <p>${producto.descripcionProducto}</p>
        <h4>$${producto.precio.toLocaleString("es-CO")}</h4>
        <span>📍 ${nombreSede}</span>
        ${controlesAdmin}
      </div>
    `;

    contenedor.appendChild(card); // ← fix principal
  });
}

// =============================================
// FUNCIONES DE ADMINISTRADOR
// =============================================

window.eliminarProductoDesdeIndex = async function(id) {
  if (!confirm("Modo Admin: ¿Eliminar este producto permanentemente?")) return;
  try {
    const res = await fetch(`${LOCAL_API}/productos/${id}`, {
      method: "DELETE",
      headers: headersAdmin,
    });
    if (!res.ok) throw new Error("Error al eliminar");

    const card = contenedor.querySelector(`.card[data-id="${id}"]`);
    if (card) {
      card.style.transition = "opacity .3s, transform .3s";
      card.style.opacity = "0";
      card.style.transform = "scale(0.95)";
      setTimeout(() => {
        card.remove();
        todosLosProductos = todosLosProductos.filter(p =>
          String(p.id) !== String(id)
        );
      }, 300);
    }
  } catch {
    alert("No se pudo eliminar el producto.");
  }
};

window.editarPrecioDesdeIndex = async function(id) {
  const nuevoPrecio = prompt("Ingrese el nuevo precio en pesos colombianos (solo números):");
  if (!nuevoPrecio) return;
  if (!/^\d+$/.test(nuevoPrecio.trim())) {
    alert("Error: debe escribir solo el valor numérico.");
    return;
  }
  try {
    const res = await fetch(`${LOCAL_API}/productos/${id}`, {
      method: "PATCH",
      headers: headersAdmin,
      body: JSON.stringify({ precio: parseInt(nuevoPrecio.trim(), 10) }),
    });
    if (!res.ok) throw new Error("Error al actualizar");

    const idx = todosLosProductos.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
      todosLosProductos[idx].precio = parseInt(nuevoPrecio.trim(), 10);
      aplicarFiltros();
    }
  } catch {
    alert("No se pudo actualizar el precio.");
  }
};

// =============================================
// CERRAR SESIÓN
// =============================================

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "index.html";
}

// =============================================
// ARRANQUE
// =============================================

inicializar();
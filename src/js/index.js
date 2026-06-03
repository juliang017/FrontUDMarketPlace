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
// BOTONES SEGÚN ESTADO DE SESIÓN Y ROL
// =============================================

const acciones = document.getElementById("accionesUsuario");
const jwt = localStorage.getItem("jwt");
const usuarioLogueado = tokenEsValido(jwt);
const rolUsuario = localStorage.getItem("userRole");

if (usuarioLogueado) {
  const btnPanelAdmin = rolUsuario === "ADMINISTRADOR"
    ? `<a href="admin.html" id="btnAdminIndex" style="background:#1e3a8a;color:white;padding:5px 15px;border-radius:5px;text-decoration:none;font-weight:bold;margin-right:10px;">Panel Admin</a>`
    : "";

  const btnVender = rolUsuario !== "ADMINISTRADOR"
    ? `<button type="button" id="btnVender">Vender Producto</button>`
    : "";

  acciones.innerHTML = `
    ${btnPanelAdmin}
    ${btnVender}
    <button type="button" id="btnPerfil">Mi Perfil</button>
    <button type="button" id="btnCerrarSesion">Cerrar Sesión</button>
  `;

  if (document.getElementById("btnVender")) {
    document.getElementById("btnVender").addEventListener("click", () => {
      window.location.href = "venderProductos.html";
    });
  }
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
// ESTADO
// =============================================

let todosLosProductos = [];
let todasLasSedes     = [];
let categoriaActiva   = "todas";
let terminoBusqueda   = "";

// =============================================
// CARGA INICIAL
// =============================================

const contenedor = document.getElementById("contenedorProductos");

async function inicializar() {
  try {
    const [resProd, resSedes, resCats] = await Promise.all([
      fetch("http://localhost:3000/productos"),
      fetch("http://localhost:3000/sedes"),
      fetch("http://localhost:3000/categorias"),
    ]);

    if (!resProd.ok || !resSedes.ok || !resCats.ok)
      throw new Error("Error al obtener datos");

    todosLosProductos = await resProd.json();
    todasLasSedes     = await resSedes.json();
    const categorias  = await resCats.json();

    construirFiltros(categorias);
    aplicarFiltros();

  } catch (err) {
    contenedor.innerHTML =
      "<p>No se pudieron cargar los productos. Verifica que json-server esté activo.</p>";
    console.error(err);
  }
}

// =============================================
// BÚSQUEDA POR NOMBRE
// =============================================

const inputBusqueda = document.querySelector(".busqueda input");

inputBusqueda.addEventListener("input", () => {
  terminoBusqueda = inputBusqueda.value.trim().toLowerCase();
  aplicarFiltros();
});

// =============================================
// FUNCIÓN CENTRAL DE FILTRADO
// Combina categoría activa + término de búsqueda
// =============================================

function aplicarFiltros() {
  let resultado = categoriaActiva === "todas"
    ? todosLosProductos
    : todosLosProductos.filter(p => p.categoriaId === categoriaActiva);

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
    contenedor.innerHTML = "<p>No hay productos que coincidan con la búsqueda.</p>";
    return;
  }

  productos.forEach(producto => {
    const sede = todasLasSedes.find(s => s.id === producto.sedeId);
    const nombreSede = sede ? sede.nombre : "Sede no especificada";

    const controlesAdmin = rolUsuario === "ADMINISTRADOR" ? `
      <div style="margin-top:10px;display:flex;gap:5px;width:100%;">
        <button onclick="editarPrecioDesdeIndex('${producto.id}')"
          style="background:#f59e0b;color:white;border:none;padding:8px;border-radius:4px;cursor:pointer;flex:1;">
          Editar
        </button>
        <button onclick="eliminarProductoDesdeIndex('${producto.id}')"
          style="background:#ef4444;color:white;border:none;padding:8px;border-radius:4px;cursor:pointer;flex:1;">
          Borrar
        </button>
      </div>
    ` : "";

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
        <span>📍 ${nombreSede}</span>
        ${controlesAdmin}
      </div>
    `;
    contenedor.appendChild(card);
  });
}

// =============================================
// FUNCIONES DE ADMINISTRADOR
// =============================================

window.eliminarProductoDesdeIndex = async function(id) {
  if (!confirm("Modo Admin: ¿Eliminar este producto permanentemente?")) return;
  try {
    const res = await fetch(`http://localhost:3000/productos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    // Remueve la card del DOM sin recargar la página
    const card = contenedor.querySelector(`.card[data-id="${id}"]`);
    if (card) {
      card.style.transition = "opacity .3s, transform .3s";
      card.style.opacity = "0";
      card.style.transform = "scale(0.95)";
      setTimeout(() => {
        card.remove();
        // Actualiza el array en memoria
        todosLosProductos = todosLosProductos.filter(p => p.id !== id);
      }, 300);
    }
  } catch (err) {
    alert("No se pudo eliminar el producto.");
    console.error(err);
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
    const res = await fetch(`http://localhost:3000/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ precio: parseInt(nuevoPrecio.trim(), 10) }),
    });
    if (!res.ok) throw new Error("Error al actualizar");
    // Actualiza el array en memoria y re-renderiza sin recargar
    const idx = todosLosProductos.findIndex(p => p.id === id);
    if (idx !== -1) {
      todosLosProductos[idx].precio = parseInt(nuevoPrecio.trim(), 10);
      aplicarFiltros();
    }
  } catch (err) {
    alert("No se pudo actualizar el precio.");
    console.error(err);
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
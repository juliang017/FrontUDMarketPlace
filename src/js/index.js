const MODO_PRUEBA = true;

if(MODO_PRUEBA){

    localStorage.setItem(
        "usuarioLogueado",
        "true"
    );

    localStorage.setItem(
        "correoUsuario",
        "kevin.neisa@udistrital.edu.co"
    );

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
const rolUsuario = localStorage.getItem('userRole'); // Recuperamos el rol

if (usuarioLogueado) {
  // Si es admin, agregamos el botón del Panel; si no, cadena vacía
  const btnPanelAdmin = rolUsuario === 'ADMINISTRADOR' 
    ? `<a href="admin.html" id="btnAdminIndex" style="background: #1e3a8a; color: white; padding: 5px 15px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-right: 10px;">Panel Admin</a>` 
    : '';
    
  // Si es administrador, NO mostramos el botón de vender
  const btnVender = rolUsuario !== 'ADMINISTRADOR'
    ? `<button type="button" id="btnVender">Vender Producto</button>`
    : '';

  acciones.innerHTML = `
    ${btnPanelAdmin}
    ${btnVender}
    <button type="button" id="btnPerfil">Mi Perfil</button>
    <button type="button" id="btnCerrarSesion">Cerrar Sesión</button>
  `;
  
  // Solo le agregamos el evento al botón de vender si este existe (si no es admin)
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

const productos = [

    {
        nombre:"Hamburguesa Artesanal",

        descripcion:
        "Hamburguesa con queso y papas.",

        precio:12000,

        ubicacion:
        "Facultad Tecnológica",

        imagen:
        "img/hamburguesa.jpg"
    },

    {
        nombre:"Cuaderno",

        descripcion:
        "Cuaderno universitario.",

        precio:5000,

        ubicacion:
        "Sede Ingeniería",

        imagen:
        "img/cuaderno.jpg"
    }

];

const contenedor =
document.getElementById(
    "contenedorProductos"
);

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

  filtrosContainer.innerHTML = `
    <button class="btn-filtro activo" data-id="todas">Todas</button>
    ${categorias.map(cat => `
      <button class="btn-filtro" data-id="${cat.id}">${cat.nombre}</button>
    `).join("")}
  `;

  filtrosContainer.querySelectorAll(".btn-filtro").forEach((btn) => {
    btn.addEventListener("click", () => {
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
// RENDER DE PRODUCTOS (CON BOTONES DE ADMIN)
// =============================================

function renderizarProductos(productos) {
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
    return;
  }

  // Recorremos los productos
  productos.forEach((producto) => {
    const sede = todasLasSedes.find((s) => s.id === producto.sedeId);
    const nombreSede = sede ? sede.nombre : "Sede no especificada";

    // Si el usuario es administrador, preparamos sus botones; si no, queda vacío
    const controlesAdmin = rolUsuario === 'ADMINISTRADOR' ? `
        <div style="margin-top: 10px; display: flex; gap: 5px; width: 100%;">
            <button onclick="editarPrecioDesdeIndex('${producto.id}')" style="background:#f59e0b; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; flex:1;">Editar</button>
            <button onclick="eliminarProductoDesdeIndex('${producto.id}')" style="background:#ef4444; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; flex:1;">Borrar</button>
        </div>
    ` : '';

    contenedor.innerHTML += `
      <div class="card" data-id="${producto.id}">
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
          ${controlesAdmin} </div>
      </div>
    `;
  });
}

function cerrarSesion(){

// =============================================
// FUNCIONES GLOBALES DEL ADMINISTRADOR PARA EL INDEX
// =============================================

window.eliminarProductoDesdeIndex = async function(id) {
    if (confirm("Modo Admin: ¿Eliminar este producto permanentemente de la tienda?")) {
        await fetch(`http://localhost:3000/productos/${id}`, { method: 'DELETE' });
        location.reload(); 
    }
}

window.editarPrecioDesdeIndex = async function(id) {
    // Validado estrictamente para que solo entren valores numéricos
    let nuevoPrecio = prompt("Ingrese los valores en pesos colombianos, directamente un valor no especificar nada más:");
    
    if (nuevoPrecio && /^\d+$/.test(nuevoPrecio.trim())) {
        await fetch(`http://localhost:3000/productos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ precio: parseInt(nuevoPrecio.trim()) })
        });
        location.reload(); 
    } else if(nuevoPrecio) {
        alert("Error: Entrada inválida. Debe escribir directamente el valor numérico.");
    }
}

// =============================================
// CERRAR SESIÓN
// =============================================

    localStorage.removeItem("correoUsuario");

    window.location.href = "index.html";
}
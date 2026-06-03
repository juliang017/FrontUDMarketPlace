// =============================================
// OBTENER ID DEL PRODUCTO DESDE LA URL
// =============================================

const parametros = new URLSearchParams(window.location.search);
const idProducto = parametros.get("id");

// =============================================
// CARGAR PRODUCTO
// =============================================

async function cargarProducto() {

    try {

        if (!idProducto) {
            throw new Error("No se recibió el ID del producto");
        }

        const respuestaProducto = await fetch(
            `http://localhost:3000/productos/${idProducto}`
        );

        if (!respuestaProducto.ok) {
            throw new Error("Producto no encontrado");
        }

        const producto = await respuestaProducto.json();

        console.log("Producto cargado:", producto);

        await mostrarProducto(producto);

    } catch (error) {

        console.error(error);

        document.querySelector(".detalle-info").innerHTML = `
            <h2>Error</h2>
            <p>No fue posible cargar la información del producto.</p>
        `;
    }
}

// =============================================
// MOSTRAR INFORMACIÓN DEL PRODUCTO
// =============================================

async function mostrarProducto(producto) {

    // Imagen
    const imagen = document.getElementById("imagenProducto");

    if (imagen) {
        imagen.src = producto.imagen;
        imagen.alt = producto.nombreProducto;
    }

    // Nombre
    const nombre = document.getElementById("nombreProducto");

    if (nombre) {
        nombre.textContent = producto.nombreProducto;
    }

    // Descripción
    const descripcion = document.getElementById("descripcionProducto");

    if (descripcion) {
        descripcion.textContent = producto.descripcionProducto;
    }

    // Precio
    const precio = document.getElementById("precioProducto");

    if (precio) {
        precio.textContent =
            `$${Number(producto.precio).toLocaleString("es-CO")}`;
    }

    // =============================================
    // CARGAR CATEGORÍA
    // =============================================

    try {

        const respuestaCategorias = await fetch(
            "http://localhost:3000/categorias"
        );

        const categorias = await respuestaCategorias.json();

        const categoriaEncontrada = categorias.find(
            c => c.id === producto.categoriaId
        );

        const categoriaElemento =
            document.getElementById("categoriaProducto");

        if (categoriaElemento) {

            categoriaElemento.textContent =
                categoriaEncontrada
                    ? categoriaEncontrada.nombre
                    : "Sin categoría";
        }

    } catch (error) {

        console.error("Error cargando categoría:", error);
    }

    // =============================================
    // CARGAR SEDE
    // =============================================

    try {

        const respuestaSedes = await fetch(
            "http://localhost:3000/sedes"
        );

        const sedes = await respuestaSedes.json();

        const sedeEncontrada = sedes.find(
            s => s.id === producto.sedeId
        );

        const ubicacion =
            document.getElementById("ubicacionProducto");

        if (ubicacion) {

            ubicacion.textContent =
                sedeEncontrada
                    ? sedeEncontrada.nombre
                    : "Sede no especificada";
        }

    } catch (error) {

        console.error("Error cargando sede:", error);
    }
}

// =============================================
// BOTÓN VOLVER
// =============================================

const btnVolver = document.getElementById("btnVolver");

if (btnVolver) {

    btnVolver.addEventListener("click", () => {

        window.location.href = "index.html";

    });
}

// =============================================
// BOTÓN COMPRAR
// =============================================

const btnComprar = document.getElementById("btnComprar");

if (btnComprar) {

    btnComprar.addEventListener("click", () => {

        alert("Funcionalidad de compra en desarrollo");

    });
}

// =============================================
// INICIO
// =============================================

cargarProducto();
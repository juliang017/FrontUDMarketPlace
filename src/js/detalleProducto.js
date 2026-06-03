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
        precio.textContent = `$${Number(producto.precio).toLocaleString("es-CO")}`;
    }

    // =============================================
    // CARGAR CATEGORÍA
    // =============================================

    try {
        const respuestaCategorias = await fetch("http://localhost:3000/categorias");
        const categorias = await respuestaCategorias.json();
        const categoriaEncontrada = categorias.find(c => c.id === producto.categoriaId);
        const categoriaElemento = document.getElementById("categoriaProducto");

        if (categoriaElemento) {
            categoriaElemento.textContent = categoriaEncontrada ? categoriaEncontrada.nombre : "Sin categoría";
        }
    } catch (error) {
        console.error("Error cargando categoría:", error);
    }

    // =============================================
    // CARGAR SEDE
    // =============================================

    try {
        const respuestaSedes = await fetch("http://localhost:3000/sedes");
        const sedes = await respuestaSedes.json();
        const sedeEncontrada = sedes.find(s => s.id === producto.sedeId);
        const ubicacion = document.getElementById("ubicacionProducto");

        if (ubicacion) {
            ubicacion.textContent = sedeEncontrada ? sedeEncontrada.nombre : "Sede no especificada";
        }
    } catch (error) {
        console.error("Error cargando sede:", error);
    }

    cargarMapa(producto.sedeId);
}

// =============================================
// BOTÓN VOLVER
// =============================================

const btnVolver = document.getElementById("btnVolver");

if (btnVolver) {
    btnVolver.addEventListener("click", () => {
        // Redirige a venderProductos.html
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
// MAPA
// =============================================

// Datos de sedes desde json-server
async function inicializarMapa() { 
    try {
        const response = await fetch("http://localhost:8003/api/v1/geolocation/all_address");
        const sedes = await response.json();

        if (sedes && sedes.length > 0) {
            // Centra el iframe en la primera sede al cargar
            document.getElementById("mapaFrame").src =
                `https://www.google.com/maps?q=$${sedes[0].latitude},${sedes[0].longitude}&z=15&output=embed`;

            // Al seleccionar una sede en el select, el mapa vuela a ella
            const selectSede = document.getElementById("sede");
            if (selectSede) {
                selectSede.addEventListener("change", (e) => {
                    const sedeId = e.target.value;
                    const sede = sedes.find(s => s.id === sedeId);
                    if (!sede) return;

                    document.getElementById("mapaFrame").src =
                        `https://www.google.com/maps?q=$${sede.latitude},${sede.longitude}&z=16&output=embed`;
                });
            }
        }
    } catch (error) {
        console.error("Error inicializando el mapa:", error);
    }
}

inicializarMapa();

// =============================================
// MAPA
// =============================================

// Datos de sedes desde json-server
async function inicializarMapa() { 
    try {
        const response = await fetch("http://localhost:8003/api/v1/geolocation/all_address");
        const sedes = await response.json();

        if (sedes && sedes.length > 0) {
            // Centra el iframe en la primera sede al cargar (corregido el $ en sedes[0].latitude)
            document.getElementById("mapaFrame").src =
                `https://www.google.com/maps?q=$${sedes[0].latitude},${sedes[0].longitude}&z=15&output=embed`;

            // Al seleccionar una sede en el select, el mapa vuela a ella
            const selectSede = document.getElementById("sede");
            if (selectSede) {
                selectSede.addEventListener("change", (e) => {
                    const sedeId = e.target.value;
                    const sede = sedes.find(s => s.id === sedeId);
                    if (!sede) return;

                    // Corregido el $ en sede.latitude
                    document.getElementById("mapaFrame").src =
                        `https://www.google.com/maps?q=$${sede.latitude},${sede.longitude}&z=16&output=embed`;
                });
            }
        }
    } catch (error) {
        console.error("Error inicializando el mapa:", error);
    }
}

inicializarMapa();

// =============================================
// INICIO
// =============================================

cargarProducto();

async function cargarMapa(idSede) {

    console.log("ID sede:", idSede);

    try {

        const respuesta = await fetch(
            `http://localhost:8003/api/v1/geolocation/id/${idSede}`
        );

        if(!respuesta.ok){
            throw new Error("Ubicación no encontrada");
        }

        const data = await respuesta.json();

        console.log("Respuesta backend:", data);

        const lat = data.latitude;
        const lon = data.longitude;

        const mapa = L.map("mapa").setView(
            [lat, lon],
            16
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "© OpenStreetMap"
            }
        ).addTo(mapa);

        L.marker([lat, lon])
            .addTo(mapa)
            .bindTooltip(
                data.name,
                {
                    permanent: true,
                    direction: "top"
                }
            );

    }
    catch(error){

        console.error(
            "Error cargando mapa:",
            error
        );

    }

}
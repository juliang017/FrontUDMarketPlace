
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

const contenedor = document.getElementById("contenedorMisProductos");

productos.forEach(producto => {
    contenedor.innerHTML += `

    <div class="card">

        <img
            src="${producto.imagen}"
            alt="${producto.nombre}">

        <div class="info">

            <h3>
                ${producto.nombre}
            </h3>

            <p>
                ${producto.descripcion}
            </p>

            <h4>
                $${producto.precio.toLocaleString()}
            </h4>

            <span>
                📍 ${producto.ubicacion}
            </span>

            <div class="acciones">

                <button onclick="editarProducto(${producto.id})" id="editarProducto">
                    Editar
                </button>

                <button onclick="eliminarProducto(${producto.id}) id="eliminarProducto">
                    Eliminar
                </button>

            </div>

        </div>

    </div>

    `;
});

document.getElementById("btnAgregarProducto").addEventListener("click", () => {

    window.location.href = "registroProducto.html";

});

document.getElementById("btnComprarProductos").addEventListener("click", () => {

    window.location.href = "index.html";    

})

document.getElementById("btnPerfil").addEventListener("click", () => {

    window.location.href = "perfil.html";    

})

function cerrarSesion(){

    localStorage.removeItem("usuarioLogueado");

    localStorage.removeItem("correoUsuario");

    window.location.href = "index.html";
}

document.getElementById("btnCerrarSesion")
    .addEventListener("click", cerrarSesion);
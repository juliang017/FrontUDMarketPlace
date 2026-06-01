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

const acciones = document.getElementById("accionesUsuario");

const usuarioLogueado =
localStorage.getItem("usuarioLogueado") === "true";

if(usuarioLogueado){

    acciones.innerHTML = `
        <button type="button" id="btnVender">
            Vender Producto
        </button>

        <button id="btnPerfil">
            Mi Perfil
        </button>

        <button id="btnCerrarSesion">
            Cerrar Sesión
        </button>
    `;

    document.getElementById("btnVender")
    .addEventListener("click", () => {
        window.location.href = "venderProductos.html";
    });

    document.getElementById("btnPerfil")
    .addEventListener("click", () => {
        window.location.href = "perfil.html";
    });

    document.getElementById("btnCerrarSesion")
    .addEventListener("click", cerrarSesion);

}
else{

    acciones.innerHTML = `
        <button id="btnLogin">
            Iniciar Sesión
        </button>

        <button id="btnRegistro">
            Crear Cuenta
        </button>
    `;

    document.getElementById("btnLogin")
    .addEventListener("click", () => {
        window.location.href = "login.html";
    });

    document.getElementById("btnRegistro")
    .addEventListener("click", () => {
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

        </div>

    </div>

    `;
});
function cerrarSesion(){

    localStorage.removeItem("usuarioLogueado");

    localStorage.removeItem("correoUsuario");

    window.location.href = "index.html";
}
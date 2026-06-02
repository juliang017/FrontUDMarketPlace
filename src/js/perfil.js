const campos = [
    "primerNombre", "segundoNombre",
    "primerApellido", "segundoApellido",
    "fechaNacimiento", "correo"
];

const usuarios = [

    {
        primerNombre:"Juan",
        segundoNombre: "Carlos",
        primerApellido: "Torres",
        segundoApellido: "Rios",
        fechaNacimiento: "15/03/2000",
        calificacion: 4.8,
        correo: "jctorresr@udistrital.edu.co"
    }
];

async function cargarPerfil() {

    try {

        /*const response = await fetch("http://localhost:3000/usuarios/perfil");
        const usuario = await response.json();*/

        // Actualiza los textos visibles
        usuarios.forEach(usuario => {
        document.getElementById("v-primerNombre").textContent = usuario.primerNombre;
        document.getElementById("v-segundoNombre").textContent = usuario.segundoNombre;
        document.getElementById("v-primerApellido").textContent = usuario.primerApellido;
        document.getElementById("v-segundoApellido").textContent = usuario.segundoApellido;
        document.getElementById("v-fechaNacimiento").textContent = usuario.fechaNacimiento;
        document.getElementById("v-correo").textContent = usuario.correo;

        // Actualiza los inputs para cuando el usuario edite
        document.getElementById("i-primerNombre").value = usuario.primerNombre;
        document.getElementById("i-segundoNombre").value = usuario.segundoNombre;
        document.getElementById("i-primerApellido").value = usuario.primerApellido;
        document.getElementById("i-segundoApellido").value = usuario.segundoApellido;
        document.getElementById("i-fechaNacimiento").value = usuario.fechaNacimiento;
        document.getElementById("i-correo").value = usuario.correo;

        // Actualiza la info del panel izquierdo
        document.getElementById("nombreCompleto").textContent =
            `${usuario.primerNombre} ${usuario.primerApellido}`;
        document.getElementById("correoVisible").textContent = usuario.correo;
        document.getElementById("avatarIniciales").textContent =
            (usuario.primerNombre[0] || "") + (usuario.primerApellido[0] || "");

        // Calificación si viene del backend
        document.getElementById("calificacionValor").textContent = usuario.calificacion;
        document.getElementById("calBarra").style.width =
            (usuario.calificacion / 5 * 100) + "%";
        })
    } catch (error) {
        console.error(error);
    }
}

cargarPerfil();

function activarEdicion() {
    campos.forEach(c => {
        document.getElementById(`v-${c}`).style.display = "none";
        document.getElementById(`i-${c}`).style.display = "block";
    });
    document.getElementById("btnEditar").style.display = "none";
    document.getElementById("btnGuardar").style.display = "block";
    document.getElementById("btnCancelar").style.display = "block";
}

function cancelarEdicion() {
    campos.forEach(c => {
        document.getElementById(`v-${c}`).style.display = "block";
        document.getElementById(`i-${c}`).style.display = "none";
    });
    document.getElementById("btnEditar").style.display = "block";
    document.getElementById("btnGuardar").style.display = "none";
    document.getElementById("btnCancelar").style.display = "none";
}

function guardarPerfil() {
    const primerNombre = document.getElementById("i-primerNombre").value;
    const primerApellido = document.getElementById("i-primerApellido").value;
    const correo = document.getElementById("i-correo").value;

    // Actualiza los textos visibles
    campos.forEach(c => {
        const valor = document.getElementById(`i-${c}`).value;
        document.getElementById(`v-${c}`).textContent = valor;
    });

    // Actualiza avatar e info lateral
    document.getElementById("avatarIniciales").textContent =
        (primerNombre[0] || "") + (primerApellido[0] || "");
    document.getElementById("nombreCompleto").textContent =
        primerNombre + " " + primerApellido;
    document.getElementById("correoVisible").textContent = correo;

    cancelarEdicion();
}
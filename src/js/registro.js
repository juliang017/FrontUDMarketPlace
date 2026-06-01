const formulario =
document.getElementById("formRegistro");

const correo =
document.getElementById("correo");

correo.addEventListener("input", () => {

    const regexCorreo =
    /^[a-zA-Z0-9._%+-]+@udistrital\.edu\.co$/;

    if(correo.value === ""){

        correo.style.borderColor = "#cbd5e1";

    }else if(regexCorreo.test(correo.value)){

        correo.style.borderColor = "#22c55e";

    }else{

        correo.style.borderColor = "#ef4444";
    }
});

formulario.addEventListener("submit", function(event){

    event.preventDefault();

    limpiarErrores();

    let valido = true;

    const primerNombre =
    document.getElementById("primerNombre");

    const primerApellido =
    document.getElementById("primerApellido");

    const fechaNacimiento =
    document.getElementById("fechaNacimiento");

    const telefono =
    document.getElementById("telefono");

    const regexNombre =
    /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

    const regexCorreo =
    /^[a-zA-Z0-9._%+-]+@udistrital\.edu\.co$/;

    if(
        primerNombre.value.trim() === "" ||
        !regexNombre.test(primerNombre.value)
    ){
        mostrarError(
            primerNombre,
            "Ingrese un nombre válido"
        );
        valido = false;
    }

    if(
        primerApellido.value.trim() === "" ||
        !regexNombre.test(primerApellido.value)
    ){
        mostrarError(
            primerApellido,
            "Ingrese un apellido válido"
        );
        valido = false;
    }

    if(fechaNacimiento.value === ""){
        mostrarError(
            fechaNacimiento,
            "Seleccione una fecha"
        );
        valido = false;
    }

    if(correo.value.trim() === ""){
        mostrarError(
            correo,
            "Ingrese el correo institucional"
        );
        valido = false;
    }
    else if(
        !regexCorreo.test(correo.value.trim())
    ){
        mostrarError(
            correo,
            "Debe terminar en @udistrital.edu.co"
        );
        valido = false;
    }

    if(
        !/^\d{10}$/.test(
            telefono.value.trim()
        )
    ){
        mostrarError(
            telefono,
            "Ingrese un teléfono válido de 10 dígitos"
        );
        valido = false;
    }

    if(valido){

        alert(
            "Formulario validado correctamente"
        );

        // Aquí posteriormente enviarás
        // los datos al backend
    }

});

function mostrarError(input, mensaje){

    input.parentElement
         .querySelector(".error")
         .textContent = mensaje;
}

function limpiarErrores(){

    document
        .querySelectorAll(".error")
        .forEach(error => {
            error.textContent = "";
        });

}
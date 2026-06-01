const formulario =
document.getElementById("formLogin");

formulario.addEventListener(
"submit",
function(event){

    event.preventDefault();

    const correo =
    document.getElementById("correo");

    const error =
    document.querySelector(".error");

    error.textContent = "";

    const regex =
    /^[a-zA-Z0-9._%+-]+@udistrital\.edu\.co$/;

    if(
        !regex.test(
            correo.value.trim()
        )
    ){

        error.textContent =
        "Debe ingresar un correo @udistrital.edu.co";

        return;
    }

    localStorage.setItem(
        "correoUsuario",
        correo.value
    );

    window.location.href =
    "verificacion.html";
});
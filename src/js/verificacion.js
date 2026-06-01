const correo =
localStorage.getItem(
    "correoUsuario"
);

document.getElementById(
    "mensajeCorreo"
).textContent =
`Hemos enviado un código a ${correo}`;

const inputs =
document.querySelectorAll(".otp");

inputs.forEach((input,index)=>{

    input.addEventListener(
    "input",
    ()=>{
        input.value = input.value.replace(/[^0-9]/g, '');
        if(
            input.value.length === 1 &&
            index < inputs.length-1
        ){

            inputs[index+1].focus();
        }

    });

});

document
.getElementById("btnVerificar")
.addEventListener(
"click",
()=>{

    let codigo="";

    inputs.forEach(input=>{

        codigo += input.value;
    });

    if(
        codigo.length !== 6
    ){

        alert(
            "Ingrese el código completo"
        );

        return;
    }

    alert(
        "Código enviado al backend para validación"
    );

    /*
    Aquí después:

    POST /verificar

    {
        correo: correo,
        codigo: codigo
    }

    Backend devuelve:

    rol = ADMIN

    o

    rol = USUARIO

    y redireccionas
    automáticamente.
    */
});
const API = "http://localhost:3000/pqrs";

document
.getElementById("formPQR")
.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const tipo =
    document.getElementById("tipo").value;

    const asunto =
    document.getElementById("asunto").value;

    const mensaje =
    document.getElementById("descripcion").value;

    if(!tipo || !asunto || !mensaje){

        alert("Complete todos los campos");
        return;
    }

    const nuevaPQR = {

        usuarioId: "1",

        tipo,

        asunto,

        mensaje,

        estado: "Pendiente",

        respuestaAdmin: ""

    };

    await fetch(API,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify(nuevaPQR)
    });

    alert("PQR enviada correctamente");

    document
    .getElementById("formPQR")
    .reset();
});

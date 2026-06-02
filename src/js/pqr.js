const API = "http://localhost:3000/pqr";

document
.getElementById("formPQR")
.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const tipo =
    document.getElementById("tipo").value;

    const asunto =
    document.getElementById("asunto").value;

    const descripcion =
    document.getElementById("descripcion").value;

    if(!tipo || !asunto || !descripcion){

        alert("Complete todos los campos");
        return;
    }

    const nuevaPQR = {

    usuarioId: 1,

    tipo,

    asunto,

    descripcion,

    fecha: new Date().toLocaleDateString(),

    estado: "Pendiente"
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
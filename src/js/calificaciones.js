console.log("calificaciones.js cargado");

const API =
"http://localhost:3000/calificaciones";

let puntuacion = 0;

const estrellas =
document.querySelectorAll(".estrellas span");

estrellas.forEach(estrella => {

    estrella.addEventListener("click", ()=>{

        puntuacion =
        Number(estrella.dataset.value);

        estrellas.forEach(e=>{

            e.classList.remove("activa");
        });

        for(let i=0;i<puntuacion;i++){

            estrellas[i]
            .classList.add("activa");
        }
    });
});

document
.getElementById("btnEnviar")
.addEventListener("click", async ()=>{

    const comentario =
    document.getElementById("comentario")
    .value;

    if(puntuacion === 0){

        alert("Seleccione una calificación");
        return;
    }

    const nuevaCalificacion = {

        vendedorId: 1,

        puntuacion,

        comentario,

        fecha: new Date()
    };

    await fetch(API,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify(nuevaCalificacion)
    });

    alert("Calificación guardada");
});
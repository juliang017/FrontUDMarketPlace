console.log("calificaciones.js cargado");

const API = "http://localhost:3000/calificaciones";

let puntuacion = 0;

const estrellas =
document.querySelectorAll(".estrellas span");

// Selección de estrellas
estrellas.forEach(estrella => {

    estrella.addEventListener("click", () => {

        puntuacion =
        Number(estrella.dataset.value);

        estrellas.forEach(e => {
            e.classList.remove("activa");
        });

        for (let i = 0; i < puntuacion; i++) {

            estrellas[i]
            .classList.add("activa");
        }
    });
});

// Guardar calificación
document
.getElementById("btnEnviar")
.addEventListener("click", async () => {

    const comentario =
    document.getElementById("comentario")
    .value
    .trim();

    if (puntuacion === 0) {

        alert("Seleccione una calificación");
        return;
    }

    const nuevaCalificacion = {

        usuarioId: "1",

        vendedorId: "1",

        puntuacion,

        comentario,

        fecha: new Date().toISOString()
    };

    try {

        const respuesta = await fetch(API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(nuevaCalificacion)
        });

        if (!respuesta.ok) {

            throw new Error(
                "Error al guardar la calificación"
            );
        }

        alert("Calificación guardada correctamente");

        // Limpiar comentario
        document
        .getElementById("comentario")
        .value = "";

        // Reiniciar estrellas
        puntuacion = 0;

        estrellas.forEach(e => {

            e.classList.remove("activa");
        });

    } catch (error) {

        console.error(error);

        alert(
            "No fue posible guardar la calificación"
        );
    }
});

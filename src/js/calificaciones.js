console.log("calificaciones.js cargado");

const API =
"http://localhost:3000/calificaciones";

const productoId =
localStorage.getItem("productoSeleccionado");

async function cargarProducto() {

    try {

        const respuesta =
        await fetch(
            `http://localhost:3000/productos/${productoId}`
        );

        if(!respuesta.ok){

            throw new Error(
                "Producto no encontrado"
            );
        }

        const producto =
        await respuesta.json();

        document
        .getElementById("nombreProducto")
        .textContent =
        producto.nombreProducto;

    } catch(error){

        console.error(error);

        document
        .getElementById("nombreProducto")
        .textContent =
        "Producto no disponible";
    }
}

if (!productoId) {

    alert(
        "No se ha seleccionado ningún producto."
    );

    window.location.href = "index.html";
}

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

        productoId,

        puntuacion,

        comentario,

        fecha: new Date().toISOString()
    };

    try {

        const respuesta =
        await fetch(API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(
                nuevaCalificacion
            )
        });

        if (!respuesta.ok) {

            throw new Error(
                "Error al guardar la calificación"
            );
        }

        alert(
            "Calificación guardada correctamente"
        );

        await cargarCalificaciones();

        document
        .getElementById("comentario")
        .value = "";

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


// ======================================
// CARGAR CALIFICACIONES DEL PRODUCTO
// ======================================

async function cargarCalificaciones() {

    const productoId =
    localStorage.getItem(
        "productoSeleccionado"
    );

    if (!productoId) return;

    const lista =
    document.getElementById(
        "listaCalificaciones"
    );

    try {

        const respuesta =
        await fetch(
            "http://localhost:3000/calificaciones"
        );

        const calificaciones =
        await respuesta.json();

        const delProducto =
        calificaciones.filter(
            c => c.productoId === productoId
        );

        if (delProducto.length === 0) {

            lista.innerHTML = `
                <p>
                    Este producto aún no tiene opiniones.
                </p>
            `;

            return;
        }

        lista.innerHTML = "";

        delProducto.forEach(calificacion => {

            lista.innerHTML += `
                <div class="comentario">

                    <h4>
                        ${"⭐".repeat(
                            calificacion.puntuacion
                        )}
                    </h4>

                    <p>
                        ${calificacion.comentario || ""}
                    </p>

                    <small>
                        ${new Date(
                            calificacion.fecha
                        ).toLocaleDateString()}
                    </small>

                </div>
            `;
        });

    } catch (error) {

        console.error(error);
    }
}


// Cargar opiniones al abrir la página
window.addEventListener("load", () => {

    cargarProducto();

    cargarCalificaciones();
});

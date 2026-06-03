const API = "http://localhost:3000/pqrs";

const productoId =
localStorage.getItem("productoSeleccionado");

if (!productoId) {

    alert(
        "No se ha seleccionado ningún producto."
    );

    window.location.href = "index.html";
}

document
.getElementById("formPQR")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const tipo =
    document.getElementById("tipo").value;

    const asunto =
    document.getElementById("asunto").value;

    const mensaje =
    document.getElementById("descripcion").value;

    if (!tipo || !asunto || !mensaje) {

        alert("Complete todos los campos");
        return;
    }

    const nuevaPQR = {

        usuarioId: "1",

        productoId,

        tipo,

        asunto,

        mensaje,

        estado: "Pendiente",

        respuestaAdmin: ""
    };

    try {

        const respuesta = await fetch(API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(nuevaPQR)
        });

        if (!respuesta.ok) {

            throw new Error(
                "Error al guardar la PQR"
            );
        }

        alert("PQR enviada correctamente");

        document
        .getElementById("formPQR")
        .reset();

    } catch (error) {

        console.error(error);

        alert(
            "No fue posible enviar la PQR"
        );
    }
});

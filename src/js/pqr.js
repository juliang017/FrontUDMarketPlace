// =============================================
// ENRUTADOR TOLERANTE A FALLOS
// =============================================
const LOCAL_API = "http://localhost:3000/pqrs";
const API_JAVA = "http://localhost:8080/api/pqrs";

// Funcionalidad del nuevo botón de volver
const btnVolver = document.getElementById("btnVolver");
if (btnVolver) {
    btnVolver.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

document.getElementById("formPQR").addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const asunto = document.getElementById("asunto").value;
    const descripcion = document.getElementById("descripcion").value;

    const inputReferencia = document.getElementById("referencia");
    const referencia = inputReferencia ? inputReferencia.value.trim() : "";

    if (!tipo || !asunto || !descripcion) {
        alert("Complete todos los campos obligatorios");
        return;
    }

    // Armamos un mensaje con contexto
    let mensajeFinal = descripcion;
    if (referencia !== "") {
        mensajeFinal = `[Referencia: ${referencia}] - ${descripcion}`;
    }

    const nuevaPQR = {
        usuarioId: localStorage.getItem("usuarioId") || "1",
        tipo: tipo,
        asunto: asunto,
        mensaje: mensajeFinal,
        estado: "Pendiente",
        respuestaAdmin: ""
    };

    const token = localStorage.getItem("jwt");
    const headersConfig = {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}` 
    };

    try {
        let response;
        try {
            response = await fetch(API_JAVA, { method: "POST", headers: headersConfig, body: JSON.stringify(nuevaPQR) });
            if (!response.ok) throw new Error("Fallo Java");
        } catch (error) {
            console.warn("Servidor Java no responde. Guardando en entorno local.");
            response = await fetch(LOCAL_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nuevaPQR) });
        }

        if (response.ok) {
            alert("PQR enviada correctamente.");
            document.getElementById("formPQR").reset();
        } else {
            alert("Error al procesar la solicitud.");
        }
    } catch (err) {
        alert("Fallo crítico: No se pudo conectar con ningún servidor.");
    }
});
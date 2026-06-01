const formulario = document.getElementById("formRegistroProductos")
const nombreProducto = document.getElementById("nombreProducto")
    const descripcionProducto = document.getElementById("descripcion")
    const ubicacion = document.getElementById("ubicacion")
    const precio = document.getElementById("precio")
    const imagen = document.getElementById("imagen")
    const categoria = document.getElementById("categoria")

    document.getElementById("btnRegresar")
    .addEventListener("click", () => {
        window.location.href = "venderProductos.html";
    });

imagen.addEventListener("change", () => {
    validarImagen(imagen);
});

function validarImagen(input){

    console.log(input);
    console.log(input.files);

    if(!input.files || input.files.length === 0){

        mostrarError(input, "Debe seleccionar una imagen");
        return false;
    }

    const archivo = input.files[0];

    // Validar tipo de archivo
    if(!archivo.type.startsWith("image/")){

        mostrarError(
            input,
            "El archivo debe ser una imagen"
        );
        alert("Debe seleccionar una imagen")

        input.value = "";

        return false;
    }

    limpiarError(input);

        return true;
}

    precio.addEventListener("input" , () => {
        precio.value = precio.value.replace(/[^0-9]/g, '');
        
    })

    function validarCampo(input){
        
        if(input.value.trim() === "" ){
            mostrarError(
                input,
                "Este campo es obligatorio"
            );
            return false;
            } else {
                limpiarError(input)
                return true
            }

    }

    nombreProducto.addEventListener("blur", () => {
        validarCampo(nombreProducto)
    })

    descripcionProducto.addEventListener("blur", () => {
        validarCampo(descripcionProducto)
    })
    ubicacion.addEventListener("blur", () => {
        validarCampo(ubicacion)
    })
    precio.addEventListener("blur", () => {
        validarCampo(precio)    
    })

    const categorias = [

        {
            id: 1,
            nombre: "Tecnologia",
        },
        {
            id: 2,
            nombre: "Comida",
        }
    ];

    async function cargarCategorias() {

        try {
    
            /*const response = await fetch("http://localhost:3000/categorias");
            const categorias = await response.json();*/
    
            const select = document.getElementById("categoria");
    
            // Opción por defecto
            select.innerHTML = `<option value="">Selecciona una categoría</option>`;
    
            categorias.forEach(categoria => {
                select.innerHTML += `
                    <option value="${categoria.id}">
                        ${categoria.nombre}
                    </option>
                `;
            });
    
        } catch (error) {
            console.error(error);
        }
    }
    
    cargarCategorias();

document.getElementById("btnRegistrar").addEventListener("click", async(event) => {
    event.preventDefault();
    let valido = true;

    console.log("nombreProducto:", nombreProducto.value);
    console.log("precio:", precio.value);
    console.log("descripcion:", descripcionProducto.value);
    console.log("ubicacion:", ubicacion.value);
    console.log("imagen files:", imagen.files);

    if(!validarCampo(nombreProducto)) valido = false;
    if(!validarCampo(precio)) valido = false;
    if(!validarCampo(descripcionProducto)) valido = false;
    if(!validarCampo(ubicacion)) valido = false;
    if(!validarImagen(imagen)) valido = false;
    if(!validarCampo(categoria)) valido = false;

    console.log("valido final:", valido);

    if(!valido) return alert("Debe completar los campos correctamente");

    try{

        alert("Formulario enviado")
       /* const formData = new FormData();

        formData.append("nombre", nombreProducto.value);
        formData.append("precio", precio.value);
        formData.append("descripcion", descripcionProducto.value);
        formData.append("ubiacion", ubicacion.value)
        formData.append("imagen", imagen.files[0]);

        const response = await fetch(
            "http://localhost:3000/productos",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        console.log(data);
        console.log(formData);*/
        limpiarCampos(nombreProducto);
        limpiarCampos(descripcionProducto);
        limpiarCampos(precio);
        limpiarCampos(ubicacion);
        limpiarCampos(imagen);
    }catch(error){

        console.error(error);

    }

})

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

function limpiarError(input) {
    const error = input.nextElementSibling;
    error.textContent = "";
}

function limpiarCampos(input){

    input.value = input.value.replace(input.value,"");

}
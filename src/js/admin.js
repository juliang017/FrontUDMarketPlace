// ==============================================================
// 1. CONFIGURACIÓN DE ENDPOINTS (JAVA, PYTHON Y LOCAL)
// ==============================================================
const LOCAL_API = "http://localhost:3000"; 
const REAL_API_GRUPO_1 = "http://localhost:8080/api"; // Back-end Java
const REAL_API_GRUPO_2 = "http://localhost:8000/sedes"; // Back-end Python

// Headers globales
window.backendHeaders = {
    'Content-Type': 'application/json'
};

/**
 * Enrutador Inteligente (Pressman WebApp).
 * Permite ejecutar peticiones asimétricas (Distinto Method/Body para Java y Local).
 * @param {Object} configReal - URL y opciones para el servidor Java/Python
 * @param {Object} configLocal - URL y opciones para el db.json
 */
async function apiFetchIntegrado(configReal, configLocal) {
    try {
        const response = await fetch(configReal.url, configReal.opciones);
        if (!response.ok) throw new Error(`Backend Real Falló: ${response.status}`);
        return response; 
    } catch (error) {
        console.warn(`⚠️ Fallo en Backend Real (${configReal.url}). Redirigiendo a Local: ${configLocal.url}`);
        return await fetch(configLocal.url, configLocal.opciones);
    }
}

// ==============================================================
// 2. INICIALIZACIÓN DEL PANEL
// ==============================================================
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("Acceso denegado. No tienes sesión activa.");
        window.location.href = "login.html"; 
        return;
    }

    // Inyección de token para el backend real (Descomentar en producción)
    // window.backendHeaders['Authorization'] = `Bearer ${token}`; 

    try {
        const responseMe = await fetch(`${REAL_API_GRUPO_1}/auth/me`, { method: 'GET', headers: window.backendHeaders });
        if (responseMe.ok) {
            const userData = await responseMe.json();
            document.getElementById('adminName').textContent = `Admin: ${userData.primerNombre || 'Activo'}`;
            localStorage.setItem('userRole', 'ADMINISTRADOR'); 
        } else {
            throw new Error("No autenticado");
        }
    } catch (error) {
        document.getElementById('adminName').textContent = "Admin (Modo Local)";
        localStorage.setItem('userRole', 'ADMINISTRADOR'); 
    }

    try {
        const responseDash = await fetch(`${REAL_API_GRUPO_1}/admin/dashboard`, { method: 'GET', headers: window.backendHeaders });
        const dashboardDiv = document.getElementById('dashboardContent');
        if (responseDash.ok) {
            const dashData = await responseDash.json();
            dashboardDiv.innerHTML = `<p style="color: green; font-weight: bold;">✔️ Conectado a Java: ${dashData.message || 'OK'}</p>`;
        } else {
            throw new Error("Dashboard caído");
        }
    } catch (error) {
        document.getElementById('dashboardContent').innerHTML = `<p style="color: #d97706; font-weight: bold;">⚠️ Sin conexión a Java. Usando JSON-Server Front-End.</p>`;
    }

    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if(btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', async () => {
            try { await fetch(`${REAL_API_GRUPO_1}/auth/logout`, { method: 'POST', headers: window.backendHeaders }); } 
            catch (error) { console.log("Cerrando localmente."); } 
            finally {
                localStorage.clear();
                window.location.href = "index.html";
            }
        });
    }

    const inputFiltro = document.getElementById('filtroProductos');
    if(inputFiltro) {
        inputFiltro.addEventListener('input', (e) => cargarProductosAdmin(e.target.value));
    }

    cargarProductosAdmin();
    cargarCategoriasAdmin();
    cargarUsuariosAdmin();
    cargarPQRSAdmin();
    cargarSedesAdmin();
});

// ==========================================
// 3. GESTIÓN DE PRODUCTOS (Endpoints Verificados)
// ==========================================
async function cargarProductosAdmin(filtro = '') {
    const contenedor = document.getElementById('adminProductosLista');
    try {
        const res = await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/productos`, opciones: { method: 'GET' } },
            { url: `${LOCAL_API}/productos`, opciones: { method: 'GET' } }
        );
        let productos = await res.json();

        if (filtro.trim() !== '') {
            const f = filtro.toLowerCase();
            productos = productos.filter(p => p.nombreProducto.toLowerCase().includes(f) || String(p.id).toLowerCase().includes(f));
        }

        if (productos.length === 0) { contenedor.innerHTML = '<p>No se encontraron productos.</p>'; return; }

        contenedor.innerHTML = productos.map(p => `
        <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${p.nombreProducto}</strong> - $${p.precio.toLocaleString("es-CO")} <br>
                <small>ID: ${p.id} | Sede ID: ${p.sedeId || 'N/A'}</small>
            </div>
            <div>
                <button onclick="editarPrecioProducto('${p.id}')" style="background: #f59e0b; padding: 5px 10px; cursor: pointer; border: none; border-radius: 4px; color: white;">Editar Precio</button>
                <button onclick="eliminarProductoAdmin('${p.id}')" style="background: #ef4444; padding: 5px 10px; cursor: pointer; border: none; border-radius: 4px; color: white; margin-left: 5px;">Eliminar</button>
            </div>
        </div>
        `).join('');
    } catch (error) { contenedor.innerHTML = '<p>Error al cargar productos.</p>'; }
}

window.eliminarProductoAdmin = async function(id) {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
        // En Java está en /api/seller/productos/{id} (Restringido a Vendedor, caerá al Fallback si el Admin no tiene permiso)
        await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/seller/productos/${id}`, opciones: { method: 'DELETE', headers: window.backendHeaders } },
            { url: `${LOCAL_API}/productos/${id}`, opciones: { method: 'DELETE', headers: window.backendHeaders } }
        );
        cargarProductosAdmin(document.getElementById('filtroProductos').value); 
    }
}

window.editarPrecioProducto = async function(id) {
    let nuevoPrecio = prompt("Ingrese el nuevo valor numérico en pesos:");
    if (nuevoPrecio && /^\d+$/.test(nuevoPrecio.trim())) {
        await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/seller/productos/${id}`, opciones: { method: 'PUT', headers: window.backendHeaders, body: JSON.stringify({ precio: parseInt(nuevoPrecio.trim()) }) } },
            { url: `${LOCAL_API}/productos/${id}`, opciones: { method: 'PATCH', headers: window.backendHeaders, body: JSON.stringify({ precio: parseInt(nuevoPrecio.trim()) }) } }
        );
        cargarProductosAdmin(document.getElementById('filtroProductos').value);
    } else if (nuevoPrecio) {
        alert("Entrada inválida. Debe ser solo numérico.");
    }
}

// ==========================================
// 4. GESTIÓN DE CATEGORÍAS (Endpoints de CategoriaController.java)
// ==========================================
async function cargarCategoriasAdmin() {
    const contenedor = document.getElementById('adminCategoriasLista');
    try {
        const res = await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/categorias`, opciones: { method: 'GET' } },
            { url: `${LOCAL_API}/categorias`, opciones: { method: 'GET' } }
        );
        const categorias = await res.json();
        contenedor.innerHTML = categorias.map(c => `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px 15px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center;">
            <span><strong>${c.nombre}</strong> <small style="color:#6b7280;">(ID: ${c.id})</small></span>
            <button onclick="eliminarCategoria('${c.id}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size:12px;">Eliminar</button>
        </div>
        `).join('');
    } catch (error) { contenedor.innerHTML = '<p>Error al cargar categorías.</p>'; }
}

window.crearCategoria = async function() {
    const nombre = prompt("Escribe el nombre de la nueva categoría:");
    if (nombre && nombre.trim() !== '') {
        await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/admin/categorias`, opciones: { method: 'POST', headers: window.backendHeaders, body: JSON.stringify({ nombre: nombre.trim() }) } },
            { url: `${LOCAL_API}/categorias`, opciones: { method: 'POST', headers: window.backendHeaders, body: JSON.stringify({ nombre: nombre.trim() }) } }
        );
        cargarCategoriasAdmin();
    }
}

window.eliminarCategoria = async function(id) {
    if(confirm("¿Estás seguro de inactivar esta categoría del sistema real?")) {
        // En Java se usa PATCH /api/admin/categorias/{id}/inactivar
        await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/admin/categorias/${id}/inactivar`, opciones: { method: 'PATCH', headers: window.backendHeaders } },
            { url: `${LOCAL_API}/categorias/${id}`, opciones: { method: 'DELETE', headers: window.backendHeaders } }
        );
        cargarCategoriasAdmin();
    }
}

// ==========================================
// 5. GESTIÓN DE USUARIOS (Endpoints de UserAdminController.java)
// ==========================================
async function cargarUsuariosAdmin() {
    const contenedor = document.getElementById('adminUsuariosLista');
    try {
        // En Java el endpoint es /api/admin/users
        const res = await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/admin/users`, opciones: { method: 'GET', headers: window.backendHeaders } },
            { url: `${LOCAL_API}/usuarios`, opciones: { method: 'GET' } }
        );
        const usuarios = await res.json();
        contenedor.innerHTML = usuarios.map(u => `
        <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${u.primerNombre} ${u.primerApellido || ''}</strong> <br>
                <small>${u.correoInstitucional || u.correo} | Rol: ${u.rol || 'USUARIO'}</small>
            </div>
            <button onclick="eliminarUsuario('${u.id}')" style="background: #ef4444; padding: 5px 10px; cursor: pointer; border: none; border-radius: 4px; color: white;">Eliminar</button>
        </div>
        `).join('');
    } catch (error) { contenedor.innerHTML = '<p>Error al cargar usuarios.</p>'; }
}

window.eliminarUsuario = async function(id) {
    if (confirm("¿Eliminar este usuario definitivamente?")) {
        await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/admin/users/${id}`, opciones: { method: 'DELETE', headers: window.backendHeaders } },
            { url: `${LOCAL_API}/usuarios/${id}`, opciones: { method: 'DELETE', headers: window.backendHeaders } }
        );
        cargarUsuariosAdmin();
    }
}

// ==========================================
// 6. BANDEJA DE PQRS (Endpoints de PqrController.java)
// ==========================================
async function cargarPQRSAdmin() {
    const contenedor = document.getElementById('adminPQRSLista');
    try {
        const res = await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/pqrs`, opciones: { method: 'GET', headers: window.backendHeaders } },
            { url: `${LOCAL_API}/pqrs`, opciones: { method: 'GET' } }
        );
        const pqrs = await res.json();

        if (pqrs.length === 0) { contenedor.innerHTML = '<p>No hay PQRS pendientes.</p>'; return; }

        contenedor.innerHTML = pqrs.map(p => `
        <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: ${p.estado === 'Resuelto' || p.estado === 'CERRADA' ? '#f0fdf4' : 'white'}">
            <div style="display: flex; justify-content: space-between;">
                <strong>[${p.tipo}] ${p.asunto}</strong>
                <span style="padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background: ${p.estado === 'Pendiente' ? '#fee2e2' : '#dcfce3'}; color: ${p.estado === 'Pendiente' ? '#991b1b' : '#166534'};">${p.estado}</span>
            </div>
            <p style="margin: 10px 0; font-size: 14px;"><strong>Mensaje:</strong> ${p.mensaje}</p>
            ${p.respuestaAdmin ? `<div style="background: #e0f2fe; padding: 10px; border-left: 3px solid #0284c7; margin: 10px 0; font-size: 14px;"><strong>Respuesta Admin:</strong> ${p.respuestaAdmin}</div>` : ''}
            
            <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                <select id="estadoPQRS_${p.radicado || p.id}" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="ENVIADA">Enviada</option>
                </select>
                <button onclick="guardarEstadoPQRS('${p.radicado || p.id}')" style="background: #3b82f6; border: none; padding: 5px 10px; border-radius: 4px; color: white; cursor: pointer;">Guardar Estado</button>
                <button onclick="responderPQRS('${p.radicado || p.id}')" style="background: #10b981; border: none; padding: 5px 10px; border-radius: 4px; color: white; cursor: pointer;">Responder</button>
                <button onclick="eliminarPQRS('${p.radicado || p.id}')" style="background: #ef4444; border: none; padding: 5px 10px; border-radius: 4px; color: white; cursor: pointer;">Cerrar PQR</button>
            </div>
        </div>
        `).join('');
    } catch (error) { contenedor.innerHTML = '<p>Error al cargar PQRS.</p>'; }
}

window.guardarEstadoPQRS = async function(id) {
    const nuevoEstado = document.getElementById(`estadoPQRS_${id}`).value;
    // Java pide el estado por QueryParam: ?estado=EN_PROCESO. El local lo pide en el JSON body.
    await apiFetchIntegrado(
        { url: `${REAL_API_GRUPO_1}/admin/pqrs/${id}/estado?estado=${nuevoEstado}`, opciones: { method: 'PATCH', headers: window.backendHeaders } },
        { url: `${LOCAL_API}/pqrs/${id}`, opciones: { method: 'PATCH', headers: window.backendHeaders, body: JSON.stringify({ estado: nuevoEstado }) } }
    );
    cargarPQRSAdmin();
}

window.responderPQRS = async function(id) {
    const respuesta = prompt("Escribe la respuesta/solución para el cliente:");
    if(respuesta && respuesta.trim() !== "") {
        // Java usa POST en interacciones. El Local actualiza la tarjeta principal.
        await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/pqrs/${id}/interacciones`, opciones: { method: 'POST', headers: window.backendHeaders, body: JSON.stringify({ mensaje: respuesta.trim() }) } },
            { url: `${LOCAL_API}/pqrs/${id}`, opciones: { method: 'PATCH', headers: window.backendHeaders, body: JSON.stringify({ respuestaAdmin: respuesta.trim(), estado: 'EN_PROCESO' }) } }
        );
        cargarPQRSAdmin();
    }
}

window.eliminarPQRS = async function(id) {
    if(confirm("¿Estás seguro de CERRAR definitivamente esta PQR?")) {
        // Java usa PATCH /cerrar, Local lo borra o lo actualiza.
        await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_1}/admin/pqrs/${id}/cerrar`, opciones: { method: 'PATCH', headers: window.backendHeaders } },
            { url: `${LOCAL_API}/pqrs/${id}`, opciones: { method: 'DELETE', headers: window.backendHeaders } }
        );
        cargarPQRSAdmin();
    }
}

// ==========================================
// 7. GESTIÓN DE SEDES (PYTHON / GRUPO 2)
// ==========================================
async function cargarSedesAdmin() {
    const contenedor = document.getElementById('adminSedesLista');
    if (!contenedor) return; 
    
    try {
        const res = await apiFetchIntegrado(
            { url: REAL_API_GRUPO_2, opciones: { method: 'GET', headers: window.backendHeaders } },
            { url: `${LOCAL_API}/sedes`, opciones: { method: 'GET' } }
        );
        const sedes = await res.json();

        if(sedes.length === 0) { contenedor.innerHTML = '<p>No hay sedes registradas.</p>'; return; }

        contenedor.innerHTML = sedes.map(s => {
            const nombreSede = s.name || s.nombre;
            const descSede = s.description || s.descripcion;
            const dirSede = s.address || s.direccion;
            const latSede = s.latitude || s.latitud;
            const lonSede = s.longitude || s.longitud;

            return `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #fafafa;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0; color: #1e3a8a;">${nombreSede}</h4>
                        <small>Sede ID: ${s.id}</small>
                    </div>
                    <button onclick="editarCampoSede('${s.id}', 'name', 'Nombre de la Sede')" style="background: #f59e0b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Editar Título</button>
                </div>
                
                <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; display: grid; gap: 8px;">
                    <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                        <div><strong>Descripción:</strong> <span>${descSede}</span></div>
                        <button onclick="editarCampoSede('${s.id}', 'description', 'Descripción')" style="cursor: pointer; background: #e5e7eb; border: none; border-radius: 4px; padding: 3px 8px;">✏️</button>
                    </li>
                    <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                        <div><strong>Dirección:</strong> <span>${dirSede}</span></div>
                        <button onclick="editarCampoSede('${s.id}', 'address', 'Dirección')" style="cursor: pointer; background: #e5e7eb; border: none; border-radius: 4px; padding: 3px 8px;">✏️</button>
                    </li>
                    <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                        <div><strong>Latitud:</strong> <span>${latSede}</span></div>
                        <button onclick="editarCampoSede('${s.id}', 'latitude', 'Latitud')" style="cursor: pointer; background: #e5e7eb; border: none; border-radius: 4px; padding: 3px 8px;">✏️</button>
                    </li>
                    <li style="display: flex; justify-content: space-between; align-items: center;">
                        <div><strong>Longitud:</strong> <span>${lonSede}</span></div>
                        <button onclick="editarCampoSede('${s.id}', 'longitude', 'Longitud')" style="cursor: pointer; background: #e5e7eb; border: none; border-radius: 4px; padding: 3px 8px;">✏️</button>
                    </li>
                </ul>
            </div>
            `;
        }).join('');
    } catch(e) { contenedor.innerHTML = '<p>Error cargando sedes.</p>'; }
}

window.editarCampoSede = async function(id, campo, label) {
    let nuevoValor = prompt(`Editar ${label} (Sede ID: ${id}):`);
    
    if(nuevoValor !== null && nuevoValor.trim() !== '') {
        let bodyData = {};
        
        if(campo === 'latitude' || campo === 'longitude' || campo === 'latitud' || campo === 'longitud') {
            let parsed = parseFloat(nuevoValor);
            if(isNaN(parsed)) { alert("Error: Las coordenadas deben ser valores numéricos (Ej: 4.609)."); return; }
            bodyData[campo] = parsed;
        } else {
            bodyData[campo] = nuevoValor.trim();
        }

        await apiFetchIntegrado(
            { url: `${REAL_API_GRUPO_2}/${id}`, opciones: { method: 'PATCH', headers: window.backendHeaders, body: JSON.stringify(bodyData) } },
            { url: `${LOCAL_API}/sedes/${id}`, opciones: { method: 'PATCH', headers: window.backendHeaders, body: JSON.stringify(bodyData) } }
        );
        cargarSedesAdmin();
    }
}
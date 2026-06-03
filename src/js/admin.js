// =============================================
// CONFIGURACIÓN DE CONEXIONES
// =============================================
const API_BASE_URL = "http://localhost:3000"; // Para productos, categorías, usuarios y pqrs
const API_GRUPO_1 = 'http://localhost:8080/api';
const API_GRUPO_2 = 'http://localhost:3000/sedes'; // Se usa el host actual manejado para Grupo 2

const API_BASE_URL = "http://localhost:3000"; // Para productos, categorías, usuarios y pqrs
const API_GRUPO_1 = 'http://localhost:8080/api';
const API_GRUPO_2_CUPONES = 'http://localhost:8001';
const API_GRUPO_2_EMAIL = 'http://localhost:8002'; // Se usa el host actual manejado para Grupo 2
const API_GRUPO_2_GEO = 'http://localhost:8003';
const API_GRUPO_2_REPORTES = 'http://localhost:8004';

document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("Acceso denegado. No tienes sesión activa.");
        window.location.href = "login.html"; 
        return;
    }

    const headersConfig = {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` 
    };

    window.backendHeaders = headersConfig;

    // --- PETICIÓN 1: TRAER DATOS DEL ADMIN ---
    try {
        const responseMe = await fetch(`${API_GRUPO_1}/auth/me`, { method: 'GET', headers: headersConfig });
        if (responseMe.ok) {
            const userData = await responseMe.json();
            document.getElementById('adminName').textContent = `Admin: ${userData.primerNombre || 'Activo'}`;
            localStorage.setItem('userRole', 'ADMINISTRADOR'); 
        }
    } catch (error) {
        document.getElementById('adminName').textContent = "Admin (Modo Prueba)";
        localStorage.setItem('userRole', 'ADMINISTRADOR'); 
    }

    // --- PETICIÓN 2: DASHBOARD ---
    try {
        const responseDash = await fetch(`${API_GRUPO_1}/admin/dashboard`, { method: 'GET', headers: headersConfig });
        const dashboardDiv = document.getElementById('dashboardContent');
        if (responseDash.ok) {
            const dashData = await responseDash.json();
            dashboardDiv.innerHTML = `<p style="color: green; font-weight: bold;">✔️ Conectado: ${dashData.message}</p>`;
        } else {
            dashboardDiv.innerHTML = `<p>Error al contactar con el servidor.</p>`;
        }
    } catch (error) {
        document.getElementById('dashboardContent').innerHTML = `<p>Sin conexión al backend Java. Usando JSON-Server Front-End.</p>`;
    }

    // --- PETICIÓN 3: GRUPO 2 (Reporte Original Intacto) ---
    const btnLoadReports = document.getElementById('btnLoadReports');
    if(btnLoadReports) {
        btnLoadReports.addEventListener('click', async () => {
            const reportDisplay = document.getElementById('reportData');
            reportDisplay.textContent = "Cargando datos...";
            try {
                const responseReport = await fetch(`${API_GRUPO_2}`, { method: 'GET', headers: headersConfig });
                if (responseReport.ok) {
                    const reportData = await responseReport.json();
                    reportDisplay.textContent = JSON.stringify(reportData, null, 4);
                } else {
                    reportDisplay.textContent = `Error ${responseReport.status}: No se encontraron datos.`;
                }
            } catch (error) {
                reportDisplay.textContent = "Error de red: El backend del Grupo 2 no responde.";
            }
        });
    }

    // --- PETICIÓN 4: LOGOUT ---
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if(btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', async () => {
            try { await fetch(`${API_GRUPO_1}/auth/logout`, { method: 'POST', headers: headersConfig }); } 
            catch (error) { console.log("Cerrando localmente."); } 
            finally {
                localStorage.clear();
                window.location.href = "index.html";
            }
        });
    }

    // --- BUSCADOR EN TIEMPO REAL ---
    const inputFiltro = document.getElementById('filtroProductos');
    if(inputFiltro) {
        inputFiltro.addEventListener('input', (e) => cargarProductosAdmin(e.target.value));
    }

    // Inicializamos TODAS las vistas interactivas
    cargarProductosAdmin();
    cargarCategoriasAdmin();
    cargarUsuariosAdmin();
    cargarPQRSAdmin();
    cargarSedesAdmin(); // Nueva vista de edición para Grupo 2
});

// ==========================================
// 1. GESTIÓN DE PRODUCTOS 
// ==========================================
async function cargarProductosAdmin(filtro = '') {
    const contenedor = document.getElementById('adminProductosLista');
    try {
        const res = await fetch(`${API_BASE_URL}/productos`);
        let productos = await res.json();

        if (filtro.trim() !== '') {
            const f = filtro.toLowerCase();
            productos = productos.filter(p => p.nombreProducto.toLowerCase().includes(f) || String(p.id).toLowerCase().includes(f));
        }

        if (productos.length === 0) {
            contenedor.innerHTML = '<p>No se encontraron productos.</p>'; return;
        }

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
        await fetch(`${API_BASE_URL}/productos/${id}`, { method: 'DELETE', headers: window.backendHeaders });
        cargarProductosAdmin(document.getElementById('filtroProductos').value); 
    }
}

window.editarPrecioProducto = async function(id) {
    let nuevoPrecio = prompt("Ingrese los valores en pesos colombianos, directamente un valor no especificar nada más:");

    if (nuevoPrecio && /^\d+$/.test(nuevoPrecio.trim())) {
        await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: 'PATCH',
            headers: window.backendHeaders,
            body: JSON.stringify({ precio: parseInt(nuevoPrecio.trim()) })
        });
        cargarProductosAdmin(document.getElementById('filtroProductos').value);
    } else if (nuevoPrecio) {
        alert("Entrada inválida. Asegúrese de ingresar directamente un valor numérico.");
    }
}

// ==========================================
// 2. GESTIÓN DE CATEGORÍAS
// ==========================================
async function cargarCategoriasAdmin() {
    const contenedor = document.getElementById('adminCategoriasLista');
    try {
        const res = await fetch(`${API_BASE_URL}/categorias`);
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
        await fetch(`${API_BASE_URL}/categorias`, {
            method: 'POST',
            headers: window.backendHeaders,
            body: JSON.stringify({ nombre: nombre.trim() }) 
        });
        cargarCategoriasAdmin();
    }
}

window.eliminarCategoria = async function(id) {
    if(confirm("¿Estás seguro de eliminar esta categoría del sistema?")) {
        await fetch(`${API_BASE_URL}/categorias/${id}`, { method: 'DELETE', headers: window.backendHeaders });
        cargarCategoriasAdmin();
    }
}

// ==========================================
// 3. GESTIÓN DE USUARIOS
// ==========================================
async function cargarUsuariosAdmin() {
    const contenedor = document.getElementById('adminUsuariosLista');
    try {
        const res = await fetch(`${API_BASE_URL}/usuarios`);
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
        await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'DELETE', headers: window.backendHeaders });
        cargarUsuariosAdmin();
    }
}

// ==========================================
// 4. BANDEJA DE PQRS (Avanzada)
// ==========================================
async function cargarPQRSAdmin() {
    const contenedor = document.getElementById('adminPQRSLista');
    try {
        const res = await fetch(`${API_BASE_URL}/pqrs`);
        const pqrs = await res.json();

        if (pqrs.length === 0) { contenedor.innerHTML = '<p>No hay PQRS pendientes.</p>'; return; }

        contenedor.innerHTML = pqrs.map(p => `
        <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: ${p.estado === 'Resuelto' ? '#f0fdf4' : 'white'}">
            <div style="display: flex; justify-content: space-between;">
                <strong>[${p.tipo}] ${p.asunto}</strong>
                <span style="padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background: ${p.estado === 'Pendiente' ? '#fee2e2' : (p.estado === 'En Proceso' ? '#fef3c7' : '#dcfce3')}; color: ${p.estado === 'Pendiente' ? '#991b1b' : (p.estado === 'En Proceso' ? '#92400e' : '#166534')};">${p.estado}</span>
            </div>
            <p style="margin: 10px 0; font-size: 14px;"><strong>Mensaje:</strong> ${p.mensaje}</p>
            ${p.respuestaAdmin ? `<div style="background: #e0f2fe; padding: 10px; border-left: 3px solid #0284c7; margin: 10px 0; font-size: 14px;"><strong>Respuesta Admin:</strong> ${p.respuestaAdmin}</div>` : ''}
            
            <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                <select id="estadoPQRS_${p.id}" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
                    <option value="Pendiente" ${p.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En Proceso" ${p.estado === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="Resuelto" ${p.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                    <option value="Rechazado" ${p.estado === 'Rechazado' ? 'selected' : ''}>Rechazado</option>
                </select>
                <button onclick="guardarEstadoPQRS('${p.id}')" style="background: #3b82f6; border: none; padding: 5px 10px; border-radius: 4px; color: white; cursor: pointer;">Guardar Estado</button>
                <button onclick="responderPQRS('${p.id}')" style="background: #10b981; border: none; padding: 5px 10px; border-radius: 4px; color: white; cursor: pointer;">Responder al Cliente</button>
                <button onclick="eliminarPQRS('${p.id}')" style="background: #ef4444; border: none; padding: 5px 10px; border-radius: 4px; color: white; cursor: pointer;">Borrar PQRS</button>
            </div>
        </div>
        `).join('');
    } catch (error) { contenedor.innerHTML = '<p>Error al cargar PQRS.</p>'; }
}

window.guardarEstadoPQRS = async function(id) {
    const nuevoEstado = document.getElementById(`estadoPQRS_${id}`).value;
    await fetch(`${API_BASE_URL}/pqrs/${id}`, {
        method: 'PATCH',
        headers: window.backendHeaders,
        body: JSON.stringify({ estado: nuevoEstado })
    });
    cargarPQRSAdmin();
}

window.responderPQRS = async function(id) {
    const respuesta = prompt("Escribe la respuesta/solución para el cliente:");
    if(respuesta && respuesta.trim() !== "") {
        await fetch(`${API_BASE_URL}/pqrs/${id}`, {
            method: 'PATCH',
            headers: window.backendHeaders,
            body: JSON.stringify({ respuestaAdmin: respuesta.trim(), estado: 'En Proceso' })
        });
        cargarPQRSAdmin();
    }
}

window.eliminarPQRS = async function(id) {
    if(confirm("¿Borrar permanentemente este registro PQRS?")) {
        await fetch(`${API_BASE_URL}/pqrs/${id}`, { method: 'DELETE', headers: window.backendHeaders });
        cargarPQRSAdmin();
    }
}

// ==========================================
// 5. GESTIÓN DE SEDES (Grupo 2 - Editable)
// ==========================================
async function cargarSedesAdmin() {
    const contenedor = document.getElementById('adminSedesLista');
    // Si no existe el contenedor (por ejemplo, si no agregaste el HTML), se detiene la ejecución para no causar errores.
    if (!contenedor) return; 
    
    try {
        // Usa estrictamente la constante API_GRUPO_2 para las sedes tal cual se solicitó
        const res = await fetch(`${API_GRUPO_2}`);
        const sedes = await res.json();

        if(sedes.length === 0) { contenedor.innerHTML = '<p>No hay sedes registradas.</p>'; return; }

        contenedor.innerHTML = sedes.map(s => `
        <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #fafafa;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <h4 style="margin: 0; color: #1e3a8a;">${s.nombre}</h4>
                    <small>Sede ID: ${s.id}</small>
                </div>
                <button onclick="editarCampoSede('${s.id}', 'nombre', 'Nombre de la Sede')" style="background: #f59e0b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Editar Título</button>
            </div>
            
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; display: grid; gap: 8px;">
                <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                    <div><strong>Descripción:</strong> <span>${s.descripcion}</span></div>
                    <button onclick="editarCampoSede('${s.id}', 'descripcion', 'Descripción')" style="cursor: pointer; background: #e5e7eb; border: none; border-radius: 4px; padding: 3px 8px;">✏️</button>
                </li>
                <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                    <div><strong>Dirección:</strong> <span>${s.direccion}</span></div>
                    <button onclick="editarCampoSede('${s.id}', 'direccion', 'Dirección')" style="cursor: pointer; background: #e5e7eb; border: none; border-radius: 4px; padding: 3px 8px;">✏️</button>
                </li>
                <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                    <div><strong>Latitud:</strong> <span>${s.latitud}</span></div>
                    <button onclick="editarCampoSede('${s.id}', 'latitud', 'Latitud')" style="cursor: pointer; background: #e5e7eb; border: none; border-radius: 4px; padding: 3px 8px;">✏️</button>
                </li>
                <li style="display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>Longitud:</strong> <span>${s.longitud}</span></div>
                    <button onclick="editarCampoSede('${s.id}', 'longitud', 'Longitud')" style="cursor: pointer; background: #e5e7eb; border: none; border-radius: 4px; padding: 3px 8px;">✏️</button>
                </li>
            </ul>
        </div>
        `).join('');
    } catch(e) { contenedor.innerHTML = '<p>Error cargando sedes.</p>'; }
}

window.editarCampoSede = async function(id, campo, label) {
    let nuevoValor = prompt(`Editar ${label} (Sede ID: ${id}):`);
    
    if(nuevoValor !== null && nuevoValor.trim() !== '') {
        let bodyData = {};
        
        if(campo === 'latitud' || campo === 'longitud') {
            let parsed = parseFloat(nuevoValor);
            if(isNaN(parsed)) { alert("Error: Las coordenadas deben ser valores numéricos."); return; }
            bodyData[campo] = parsed;
        } else {
            bodyData[campo] = nuevoValor.trim();
        }

        // Usa estrictamente la constante API_GRUPO_2 para editar las sedes
        await fetch(`${API_GRUPO_2}/${id}`, {
            method: 'PATCH',
            headers: window.backendHeaders,
            body: JSON.stringify(bodyData)
        });
        cargarSedesAdmin();
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. RECUPERAR EL TOKEN: Buscamos la 'llave' que guardamos en verificacion.js
    const token = localStorage.getItem("jwtToken"); 

    // Si no hay token, significa que alguien intentó entrar escribiendo /admin.html en la URL directamente
    if (!token) {
        alert("Acceso denegado. No tienes sesión activa.");
        window.location.href = "login.html"; // Lo echamos al login
        return;
    }

    // 2. CONFIGURAR CABECERA: Este objeto es el que lleva el Token al backend en cada petición
    const headersConfig = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Aquí se inyecta el JWT
    };

    // 3. RUTAS BASE: Ajusta estos puertos según las computadoras de tus compañeros
    const API_GRUPO_1 = 'http://localhost:8080/api'; 
    const API_GRUPO_2 = 'http://localhost:8000/api/v1'; // Endpoint de Python

    /* =========================================================
       PETICIÓN 1: TRAER LOS DATOS DEL ADMINISTRADOR (/auth/me)
       ========================================================= */
    try {
        const responseMe = await fetch(`${API_GRUPO_1}/auth/me`, {
            method: 'GET',
            headers: headersConfig // Enviamos el token
        });

        if (responseMe.ok) {
            const userData = await responseMe.json();
            // Imprimimos el nombre del admin en el botón vacío del header
            document.getElementById('adminName').textContent = `Admin: ${userData.primerNombre || 'Activo'}`;
        }
    } catch (error) {
        console.error("Modo prueba: No se pudo cargar el perfil.");
        document.getElementById('adminName').textContent = "Admin (Modo Prueba)";
    }

    /* =========================================================
       PETICIÓN 2: CARGAR DASHBOARD RESTRINGIDO (/admin/dashboard)
       ========================================================= */
    try {
        const responseDash = await fetch(`${API_GRUPO_1}/admin/dashboard`, {
            method: 'GET',
            headers: headersConfig
        });

        const dashboardDiv = document.getElementById('dashboardContent');
        if (responseDash.ok) {
            const dashData = await responseDash.json();
            // Imprimimos el mensaje que envía el Backend
            dashboardDiv.innerHTML = `<p style="color: green; font-weight: bold;">✔️ Conectado: ${dashData.message}</p>`;
        } else if (responseDash.status === 403) {
            // El status 403 ocurre si un comprador intenta entrar a esta vista
            dashboardDiv.innerHTML = `<p style="color:red;">Error 403: Permisos insuficientes.</p>`;
        } else {
            dashboardDiv.innerHTML = `<p>Error al contactar con el servidor. Código: ${responseDash.status}</p>`;
        }
    } catch (error) {
        document.getElementById('dashboardContent').innerHTML = `<p>Sin conexión al backend Java.</p>`;
    }

    /* =========================================================
       PETICIÓN 3: CONSUMIR ENDPOINTS DEL GRUPO 2 (Ej. Sedes)
       ========================================================= */
    const btnLoadReports = document.getElementById('btnLoadReports');
    
    btnLoadReports.addEventListener('click', async () => {
        const reportDisplay = document.getElementById('reportData');
        reportDisplay.textContent = "Cargando datos...";

        try {
            // Según tu PDF, el Grupo 2 tiene el endpoint GET /sedes
            const responseReport = await fetch(`${API_GRUPO_2}/sedes`, {
                method: 'GET',
                headers: headersConfig // Si ellos no piden token, puedes quitar esta línea
            });

            if (responseReport.ok) {
                const reportData = await responseReport.json();
                // Mostramos el JSON resultante en pantalla formateado bonito (con 4 espacios)
                reportDisplay.textContent = JSON.stringify(reportData, null, 4);
            } else {
                reportDisplay.textContent = `Error ${responseReport.status}: No se encontraron datos.`;
            }
        } catch (error) {
            reportDisplay.textContent = "Error de red: El backend del Grupo 2 (Python) no está respondiendo.";
        }
    });

    /* =========================================================
       PETICIÓN 4: CERRAR SESIÓN (Logout)
       ========================================================= */
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    
    btnCerrarSesion.addEventListener('click', async () => {
        try {
            // Avisamos al backend que invalide el token
            await fetch(`${API_GRUPO_1}/auth/logout`, {
                method: 'POST',
                headers: headersConfig
            });
        } catch (error) {
            console.log("No se pudo notificar al servidor, cerrando localmente.");
        } finally {
            // En el bloque 'finally' nos aseguramos de borrar el token SÍ o SÍ del navegador
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("correoUsuario");
            localStorage.removeItem("usuarioLogueado");
            
            // Mandamos al usuario de regreso a la página inicial
            window.location.href = "index.html";
        }
    });
});
// ========================
// CONFIGURACIÓN DE HOJAS
// ========================
const NOMBRE_HOJA_MASCOTAS_PERDIDAS = "AnimalesPerdidos";
const NOMBRE_HOJA_ADOPCIONES = "Adopciones";
const NOMBRE_HOJA_DASHBOARD = "Dashboard";

// ========================
// MENÚ PERSONALIZADO
// ========================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🐾 Navegación Animal')
    .addItem('🔐 Ir a Login', 'irALogin')
    .addItem('🔎 Registrar animal perdido', 'irARegistroPerdidos')
    .addItem('🏠 Proceso de adopción', 'irAAdopciones')
    .addToUi();
}

// ========================
// NAVEGACIÓN ENTRE HOJAS
// ========================
function irALogin() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Login");
  SpreadsheetApp.setActiveSheet(hoja);
}

function irARegistroPerdidos() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA_MASCOTAS_PERDIDAS);
  SpreadsheetApp.setActiveSheet(hoja);
}

function irAAdopciones() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA_ADOPCIONES);
  SpreadsheetApp.setActiveSheet(hoja);
}

// ========================
// LOGIN DE USUARIOS (ACTUALIZADO)
// ========================
function verificarLogin() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaLogin = ss.getSheetByName("Login");
  const correo = hojaLogin.getRange("B1").getValue().toString().trim();
  const clave = hojaLogin.getRange("B2").getValue().toString().trim();

  if (!correo || !clave) {
    SpreadsheetApp.getUi().alert("❌ Por favor, ingresa correo y contraseña.");
    return;
  }

  const hojaUsuarios = ss.getSheetByName("LoginUsuarios");
  const datos = hojaUsuarios.getDataRange().getValues();

  const usuario = datos.find(fila => 
    fila[0]?.toString().trim() === correo && 
    fila[1]?.toString().trim() === clave
  );

  if (usuario) {
    SpreadsheetApp.getUi().alert(`✅ ¡Bienvenido! Rol: ${usuario[2] || "Ciudadano"}`);
    // Redirigir al Dashboard
    ss.setActiveSheet(ss.getSheetByName(NOMBRE_HOJA_DASHBOARD));
  } else {
    SpreadsheetApp.getUi().alert("❌ Credenciales incorrectas");
  }
}

// ========================
// REGISTRO DE USUARIOS (ACTUALIZADO)
// ========================
function registrarUsuario() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaLogin = ss.getSheetByName("Login");
  const correo = hojaLogin.getRange("B1").getValue().toString().trim();
  const clave = hojaLogin.getRange("B2").getValue().toString().trim();
  const rol = hojaLogin.getRange("B3").getValue().toString().trim() || "Ciudadano";

  if (!correo || !clave) {
    SpreadsheetApp.getUi().alert("❌ Correo y contraseña son obligatorios");
    return;
  }

  if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[\w-]{2,4}$/.test(correo)) {
    SpreadsheetApp.getUi().alert("❌ Formato de correo inválido");
    return;
  }

  const hojaUsuarios = ss.getSheetByName("LoginUsuarios");
  const datos = hojaUsuarios.getDataRange().getValues();

  if (datos.some(fila => fila[0]?.toString().trim() === correo)) {
    SpreadsheetApp.getUi().alert("❌ Este correo ya está registrado");
    return;
  }

  const correosAdminPermitidos = ["admin@buga.com", "soporte@buga.org"];
  if (rol.toLowerCase() === "administrador" && !correosAdminPermitidos.includes(correo)) {
    SpreadsheetApp.getUi().alert("❌ Solo personal autorizado puede ser administrador");
    return;
  }

  hojaUsuarios.appendRow([correo, clave, rol]);
  SpreadsheetApp.getUi().alert("✨ ¡Registro exitoso! Ahora inicia sesión");
  hojaLogin.getRange("B1:B3").clearContent();
}

// ========================
// MASCOTAS PERDIDAS (ACTUALIZADO)
// ========================
function guardarMascotaPerdida(datos) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  
  // Guardar en AnimalesPerdidos
  const hojaPerdidos = libro.getSheetByName(NOMBRE_HOJA_MASCOTAS_PERDIDAS) || libro.insertSheet(NOMBRE_HOJA_MASCOTAS_PERDIDAS);
  const id = Date.now();

  if (hojaPerdidos.getLastRow() === 0) {
    const cabeceras = ['ID', 'Fecha', 'Nombre', 'Tipo', 'Estado de salud', 'Ubicación', 'Reportado por', 'Estado'];
    hojaPerdidos.getRange(1, 1, 1, cabeceras.length).setValues([cabeceras]);
  }

  const nuevaFilaPerdidos = [
    id,
    new Date(),
    datos.nombre,
    datos.tipo,
    datos.estadoSalud,
    datos.ubicacion,
    datos.reportadoPor,
    datos.estado || 'Pendiente'
  ];

  hojaPerdidos.appendRow(nuevaFilaPerdidos);

  // Copiar a Adopciones automáticamente
  const hojaAdopciones = libro.getSheetByName(NOMBRE_HOJA_ADOPCIONES) || libro.insertSheet(NOMBRE_HOJA_ADOPCIONES);
  
  if (hojaAdopciones.getLastRow() === 0) {
    const cabecerasAdopciones = ['ID', 'Fecha', 'Nombre Animal', 'Estado', 'Adoptante', 'Contacto', 'Estado Adopción'];
    hojaAdopciones.getRange(1, 1, 1, cabecerasAdopciones.length).setValues([cabecerasAdopciones]);
  }

  const nuevaFilaAdopciones = [
    id,
    new Date(),
    datos.nombre,
    datos.estado || 'Pendiente',
    '', // Adoptante (vacío inicial)
    '', // Contacto (vacío inicial)
    'Pendiente' // Estado Adopción
  ];

  hojaAdopciones.appendRow(nuevaFilaAdopciones);

  return { estado: 'éxito', mensaje: 'Reporte guardado correctamente' };
}


// ========================
// VISTAS WEB (si usas HTMLService)
// ========================
const VISTAS = {
  FORMULARIO_MASCOTAS_PERDIDAS: 'formulario_mascotas_perdidas',
  LISTADO_MASCOTAS_PERDIDAS: 'listado_mascotas_perdidas',
  FORMULARIO_MASCOTAS_ADOPCION: 'formulario_mascotas_adopcion',
  LISTADO_MASCOTAS_ADOPCION: 'listado_mascotas_adopcion'
};

function doGet(e) {
  let vista = VISTAS.LISTADO_MASCOTAS_PERDIDAS;

  if (e && e.parameter) {
    vista = e.parameter.v;
  }

  let plantilla;
  switch (vista) {
    case VISTAS.LISTADO_MASCOTAS_PERDIDAS:
      plantilla = HtmlService.createTemplateFromFile('ListadoMascotasPerdidas');
      break;
    case VISTAS.FORMULARIO_MASCOTAS_PERDIDAS:
      plantilla = HtmlService.createTemplateFromFile('FormularioMascotasPerdidas');
      break;
    case VISTAS.LISTADO_MASCOTAS_ADOPCION:
      plantilla = HtmlService.createTemplateFromFile('listadomascotasenadopcion');
      break;
    case VISTAS.FORMULARIO_MASCOTAS_ADOPCION:
      plantilla = HtmlService.createTemplateFromFile('Formulariomascotasenadopcion');
      break;
    default:
      plantilla = HtmlService.createTemplateFromFile('ListadoMascotasPerdidas');
  }

  plantilla.url = ScriptApp.getService().getUrl();
  plantilla.vistaActual = vista;

  return plantilla.evaluate()
    .setTitle('Refugio Animal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function obtenerMascotasPerdidas() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(NOMBRE_HOJA_MASCOTAS_PERDIDAS);
  
  return hoja?.getDataRange()
    .getValues()
    .slice(1)
    .map(([id, fecha, nombre, tipo, , ubicacion, reportadoPor, estado]) => ({
      nombre: nombre || 'Sin nombre',
      tipo: tipo || 'No especificado',
      ubicacion: ubicacion || 'Sin ubicación',
      fechaReporte: fecha?.toISOString?.() || 'Fecha no válida',
      estado: estado || 'Sin estado'
    })) || [];
}

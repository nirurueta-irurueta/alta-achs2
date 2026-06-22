/* =====================================================================
   data.js — Modelo del flujo "Alta de Paciente · ACHS"
   Mismo ESQUEMA que el sitio Figma de referencia (Padre Hurtado),
   con datos de la ficha ACHS. Ficha y sitio pareados (ver README).
   ===================================================================== */

const DATA = {

  /* ---------------------------------------------------------------- */
  /* PERFILES (11) — id, name, color (hex para dot/badge), description */
  /* ---------------------------------------------------------------- */
  profiles: [
    { id: "P1",  name: "Enfermera",              color: "#2563eb", description: "Solicita movilizador (alta/traslado), ingresa paciente, cancela solicitud." },
    { id: "P2",  name: "OT / Movilizador",       color: "#0ea5e9", description: "Recoge al paciente e ingresa pacientes a camas libres." },
    { id: "P3",  name: "Staff de Limpieza",      color: "#ec4899", description: "Realiza limpieza (alta/terminal) y arma la cama tras peróxido." },
    { id: "P4",  name: "Supervisor de Limpieza", color: "#65a30d", description: "Supervisa la limpieza, solicita peróxido o nueva limpieza." },
    { id: "P5",  name: "Despachador",            color: "#f59e0b", description: "Coordina el retiro/transporte solicitado." },
    { id: "P6",  name: "Gestor de Camas",        color: "#14b8a6", description: "Torre de control: monitorea disponibilidad de camas." },
    { id: "P7",  name: "TENS",                   color: "#8b5cf6", description: "Solicita movilizador e ingresa paciente." },
    { id: "P8",  name: "Administrativo",         color: "#64748b", description: "Solicita movilizador e ingresa paciente." },
    { id: "P9",  name: "Peróxido",               color: "#06b6d4", description: "Ejecuta el proceso de peróxido sobre la cama." }
  ],

  /* ---------------------------------------------------------------- */
  /* ESTADOS (9) — id, name (MAYÚSCULAS), description, tipo, color     */
  /* tipo: normal | intermedio | libre                                */
  /* ---------------------------------------------------------------- */
  states: [
    { id: "E1", name: "OCUPADA",              tipo: "normal",     hex: "#002A6C", textHex: "#ffffff", description: "Cama en uso por un paciente." },
    { id: "E2", name: "ESPERANDO TRANSPORTE", tipo: "normal",     hex: "#002A6C", textHex: "#ffffff", description: "Cama en espera de un movilizador solicitado." },
    { id: "E3", name: "ESPERANDO LIMPIEZA",   tipo: "normal",     hex: "#002A6C", textHex: "#ffffff", description: "Cama cuya limpieza ha sido solicitada pero aún está pendiente." },
    { id: "E4", name: "EN ASEO (TERMINAL/ALTA)", tipo: "intermedio", hex: "#2FB9A4", textHex: "#ffffff", description: "Cama cuya limpieza terminal/alta está siendo realizada (estado intermedio)." },
    { id: "E5", name: "ESPERANDO SUPERVISIÓN", tipo: "normal",    hex: "#002A6C", textHex: "#ffffff", description: "Cama limpia que está esperando supervisión." },
    { id: "E6", name: "ESPERANDO PERÓXIDO",   tipo: "normal",     hex: "#002A6C", textHex: "#ffffff", description: "Cama limpia que está esperando el proceso de peróxido." },
    { id: "E7", name: "REALIZANDO PERÓXIDO",  tipo: "intermedio", hex: "#2FB9A4", textHex: "#ffffff", description: "Cama limpia durante el proceso de peróxido (estado intermedio)." },
    { id: "E8", name: "ESPERANDO ARMADO",     tipo: "normal",     hex: "#002A6C", textHex: "#ffffff", description: "Cama limpia con peróxido finalizado, esperando ser vestida." },
    { id: "E9", name: "CAMA LIBRE",           tipo: "libre",      hex: "#13C045", textHex: "#ffffff", description: "Cama disponible, limpia, lista para su uso." }
  ],

  /* ---------------------------------------------------------------- */
  /* ESQUEMA UNIFICADO DE PASO (lo usan mainSteps y                   */
  /* additionalTransitions — misma forma para renderizar cajas        */
  /* idénticas en la pestaña "Pasos"):                                */
  /*   step              etiqueta del badge ("1"… | "O1" | "4B"…)     */
  /*   title             título corto de la caja                      */
  /*   profiles          [perfiles que ejecutan]                      */
  /*   code              id de actividad/transición (P1.A1, …)        */
  /*   activity          nombre preciso de la actividad               */
  /*   fromState         estado(s) origen (string | array)            */
  /*   toState           estado destino (string | null = sin cambio)  */
  /*   intermediateState estado intermedio (string | null)            */
  /*   trigger           disparador                                   */
  /*   dataCaptured      [datos] (puede ir [])                        */
  /*   notifications     [ids de notificación] (puede ir [])          */
  /*   description        resumen en prosa                            */
  /*   variantOf          nº del paso del que es variante             */
  /*                      (null = paso principal u opción adicional)  */
  /* ---------------------------------------------------------------- */

  /* PASOS PRINCIPALES (camino feliz) */
  mainSteps: [
    {
      step: "1", title: "Solicitar Movilizador", profiles: ["P1", "P7", "P8"],
      code: "P1.A1", activity: "Solicitar Movilizador (Alta)",
      fromState: "E1", toState: "E2", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Nombre paciente", "Precaución (Aéreo / Gotita / Contacto / Covid / Ninguno)", "Requiere peróxido"],
      notifications: ["N1W"], variantOf: null,
      description: "Enfermera, TENS o Administrativo solicita el movilizador. Cama pasa a E2."
    },
    {
      step: "2", title: "Recoger Paciente", profiles: ["P2"],
      code: "P2.A1", activity: "Recoger Paciente",
      fromState: "E2", toState: "E3", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Destino paciente (Habitaciones, Hall Central, Pabellón Central, CMA, …)"],
      notifications: ["N3W", "N4W"], variantOf: null,
      description: "Movilizador recoge al paciente. Cama pasa a E3."
    },
    {
      step: "3", title: "Realizar Limpieza Terminal", profiles: ["P3"],
      code: "P3.A2", activity: "Limpieza Terminal",
      fromState: "E3", toState: "E5", intermediateState: "E4", trigger: "Escaneo QR",
      dataCaptured: ["Checklist de limpieza (30 ítems por zona)"],
      notifications: ["N7W"], variantOf: null,
      description: "Staff de Limpieza realiza limpieza terminal. Pasa por E4 hasta E5 (siempre requiere supervisión)."
    },
    {
      step: "4", title: "Supervisar Limpieza", profiles: ["P4"],
      code: "P4.A2", activity: "Solicitar Peróxido",
      fromState: "E5", toState: "E6", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Checklist supervisión (16 ítems)", "Foto / evidencia (opcional)"],
      notifications: ["N9W"], variantOf: null,
      description: "Supervisor valida la limpieza y solicita peróxido. Cama pasa a E6."
    },
    {
      step: "5", title: "Realizar Peróxido", profiles: ["P9"],
      code: "P9.A1", activity: "Realizar Peróxido",
      fromState: "E6", toState: "E8", intermediateState: "E7", trigger: "Escaneo QR",
      dataCaptured: [],
      notifications: ["N10W"], variantOf: null,
      description: "Peróxido ejecuta el proceso. Pasa por E7 hasta E8."
    },
    {
      step: "6", title: "Armar Cama", profiles: ["P3"],
      code: "P3.A3", activity: "Armar Cama",
      fromState: "E8", toState: "E9", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: [],
      notifications: ["N11W", "N12W"], variantOf: null,
      description: "Staff de Limpieza habilita la cama (post-peróxido). Cama pasa a E9."
    },
    {
      step: "7", title: "Ingresar Paciente", profiles: ["P2"],
      code: "P2.A2", activity: "Ingresar Paciente",
      fromState: "E9", toState: "E1", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Género paciente (Masculino / Femenino / Transmasculino / Transfemenino)"],
      notifications: ["N13W"], variantOf: null,
      description: "Movilizador ingresa un paciente a la cama libre. Cierra el ciclo (E1)."
    }
  ],

  /* ---------------------------------------------------------------- */
  /* TRANSICIONES ADICIONALES (ramas / opciones)                     */
  /* Mismo esquema que mainSteps (ver arriba).                        */
  /* ---------------------------------------------------------------- */
  additionalTransitions: [
    {
      step: "1B", title: "Solicitar Movilizador", profiles: ["P1", "P7", "P8"],
      code: "P1.A1·Traslado", activity: "Solicitar Movilizador (Traslado)",
      fromState: "E1", toState: "E2", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Nombre paciente", "Precaución", "Requiere peróxido", "Cama destino"],
      notifications: ["N2W"], variantOf: "1",
      description: "Variante de traslado del Paso 1: además del nombre y la precaución, se indica la cama destino. La cama pasa a E2 y se notifica al Despachador."
    },
    {
      step: "3B", title: "Realizar Limpieza Alta", profiles: ["P3"],
      code: "P3.A1", activity: "Limpieza Alta",
      fromState: "E3", toState: "E9", intermediateState: "E4", trigger: "Escaneo QR",
      dataCaptured: ["Checklist de limpieza (30 ítems)"],
      notifications: ["N5W", "N6W"], variantOf: "3",
      description: "Variante del Paso 3: el Staff elige limpieza de Alta. Pasa por E4 y, al completar el checklist, la cama queda directamente en E9 (no requiere supervisión)."
    },
    {
      step: "4B", title: "Supervisar Limpieza", profiles: ["P4"],
      code: "P4.A1", activity: "Supervisión sin peróxido",
      fromState: "E5", toState: "E9", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Checklist supervisión (16 ítems)", "Foto (opcional)"],
      notifications: ["N8W"], variantOf: "4",
      description: "Variante del Paso 4: al no requerirse peróxido, el Supervisor habilita la cama directamente. Pasa de E5 a E9 y se notifica al Gestor de Camas."
    },
    {
      step: "4C", title: "Solicitar Nueva Limpieza", profiles: ["P4"],
      code: "P4.A3", activity: "Solicitar nueva limpieza",
      fromState: "E5", toState: "E3", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Tipo de limpieza solicitada (Alta / Terminal)"],
      notifications: [], variantOf: "4",
      description: "Variante del Paso 4: si la supervisión no aprueba, el Supervisor solicita una nueva limpieza. La cama vuelve a E3."
    },
    {
      step: "7B", title: "Ingresar Paciente", profiles: ["P1", "P7", "P8"],
      code: "P1.A3·Ingreso", activity: "Ingresar Paciente (Enf / TENS / Adm)",
      fromState: "E9", toState: "E1", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Género paciente"],
      notifications: ["N14W"], variantOf: "7",
      description: "Variante del Paso 7: Enfermera, TENS o Administrativo ingresa un paciente a una cama libre sin necesidad de movilizador. La cama pasa a E1 y se notifica al Gestor de Camas."
    },
    {
      step: "O1", title: "Cancelar Transporte", profiles: ["P1", "P7", "P8"],
      code: "P1.A4·Cancelar", activity: "Cancelar Solicitud",
      fromState: "E2", toState: "E1", intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: [],
      notifications: ["N15W"], variantOf: null,
      description: "Enfermera, TENS o Administrativo cancela un transporte ya solicitado. La cama vuelve a E1 y se notifica al Despachador."
    },
    {
      step: "O2", title: "Supervisión General", profiles: ["P4"],
      code: "P4.A4", activity: "Supervisión Limpieza",
      fromState: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9"], toState: null, intermediateState: null, trigger: "Escaneo QR",
      dataCaptured: ["Checklist supervisión (16 ítems)", "Foto (opcional)"],
      notifications: [], variantOf: null,
      description: "El Supervisor registra una supervisión de control de calidad sobre cualquier cama. No cambia el estado de la cama; queda como registro."
    }
  ],

  /* ---------------------------------------------------------------- */
  /* NOTIFICACIONES WhatsApp (N1–N15)                                 */
  /* ---------------------------------------------------------------- */
  notifications: [
    { id: "N1W.[P1/P7/P8].A1.E2.P5",  emitter: ["P1", "P7", "P8"], activity: "A1 Solicitar Movilizador (Alta)",     state: "E2", recipient: "P5", description: "Enfermera/TENS/Administrativo solicita alta; la cama pasa a E2; notifica a Despachador.",            exclusivoCluster: false },
    { id: "N2W.[P1/P7/P8].A2.E2.P5",  emitter: ["P1", "P7", "P8"], activity: "A2 Solicitar Movilizador (Traslado)", state: "E2", recipient: "P5", description: "Enfermera/TENS/Administrativo solicita traslado; la cama pasa a E2; notifica a Despachador.",       exclusivoCluster: false },
    { id: "N3W.P2.A1.E3.P6",          emitter: ["P2"],            activity: "A1 Recoger Paciente",                  state: "E3", recipient: "P6", description: "Movilizador recoge paciente; la cama pasa a E3; notifica a Gestor de Camas.",                       exclusivoCluster: false },
    { id: "N4W.P2.A1.E3.P4",          emitter: ["P2"],            activity: "A1 Recoger Paciente",                  state: "E3", recipient: "P4", description: "Movilizador recoge paciente; la cama pasa a E3; notifica a Supervisor de Limpieza.",                exclusivoCluster: true  },
    { id: "N5W.P3.A1.E9.P6",          emitter: ["P3"],            activity: "A1 Limpieza Alta",                     state: "E9", recipient: "P6", description: "Staff de Limpieza finaliza limpieza alta; la cama pasa a E9; notifica a Gestor de Camas.",          exclusivoCluster: false },
    { id: "N6W.P3.A1.E9.P4",          emitter: ["P3"],            activity: "A1 Limpieza Alta",                     state: "E9", recipient: "P4", description: "Staff de Limpieza finaliza limpieza alta; la cama pasa a E9; notifica a Supervisor de Limpieza.",   exclusivoCluster: true  },
    { id: "N7W.P3.A2.E5.P4",          emitter: ["P3"],            activity: "A2 Limpieza Terminal",                 state: "E5", recipient: "P4", description: "Staff de Limpieza finaliza limpieza terminal; la cama pasa a E5; notifica a Supervisor de Limpieza.", exclusivoCluster: true  },
    { id: "N8W.P4.A1.E9.P6",          emitter: ["P4"],            activity: "A1 Supervisión",                       state: "E9", recipient: "P6", description: "Supervisor habilita la cama tras supervisión; la cama pasa a E9; notifica a Gestor de Camas.",      exclusivoCluster: false },
    { id: "N9W.P4.A2.E6.P9",          emitter: ["P4"],            activity: "A2 Solicitar Peróxido",                state: "E6", recipient: "P9", description: "Supervisor solicita peróxido; la cama pasa a E6; notifica a Peróxido.",                             exclusivoCluster: true  },
    { id: "N10W.P9.A1.E8.P4",         emitter: ["P9"],            activity: "A1 Realizar Peróxido",                 state: "E8", recipient: "P4", description: "Peróxido finaliza el proceso; la cama pasa a E8; notifica a Supervisor de Limpieza.",               exclusivoCluster: true  },
    { id: "N11W.P3.A3.E9.P6",         emitter: ["P3"],            activity: "A3 Armar Cama",                        state: "E9", recipient: "P6", description: "Staff de Limpieza habilita la cama; la cama pasa a E9; notifica a Gestor de Camas.",                exclusivoCluster: false },
    { id: "N12W.P3.A3.E9.P4",         emitter: ["P3"],            activity: "A3 Armar Cama",                        state: "E9", recipient: "P4", description: "Staff de Limpieza habilita la cama; la cama pasa a E9; notifica a Supervisor de Limpieza.",         exclusivoCluster: true  },
    { id: "N13W.P2.A2.E1.P6",         emitter: ["P2"],            activity: "A2 Ingresar Paciente",                 state: "E1", recipient: "P6", description: "Movilizador ingresa paciente; la cama pasa a E1; notifica a Gestor de Camas.",                     exclusivoCluster: false },
    { id: "N14W.[P1/P7/P8].A3.E1.P6", emitter: ["P1", "P7", "P8"], activity: "A3 Ingresar Paciente",                state: "E1", recipient: "P6", description: "Enfermera/TENS/Administrativo ingresa paciente; la cama pasa a E1; notifica a Gestor de Camas.",     exclusivoCluster: false },
    { id: "N15W.[P1/P7/P8].A4.E1.P5", emitter: ["P1", "P7", "P8"], activity: "A4 Cancelar Solicitud",              state: "E1", recipient: "P5", description: "Enfermera/TENS/Administrativo cancela transporte; la cama vuelve a E1; notifica a Despachador.",     exclusivoCluster: false }
  ],

  /* ---------------------------------------------------------------- */
  /* DIAGRAMA — posición de nodos (centros, caja 100×100)             */
  /* ---------------------------------------------------------------- */
  diagramViewBox: "-90 -40 1330 800",
  diagramLayout: [
    { id: "E1", x: 130,  y: 90 },
    { id: "E2", x: 500,  y: 90 },
    { id: "E3", x: 870,  y: 90 },
    { id: "E4", x: 1090, y: 320 },
    { id: "E5", x: 1090, y: 600 },
    { id: "E6", x: 820,  y: 600 },
    { id: "E7", x: 560,  y: 600 },
    { id: "E8", x: 300,  y: 600 },
    { id: "E9", x: 70,   y: 600 }
  ],

  /* DIAGRAMA — aristas (flechas). pts = polilínea [[x,y]…]            */
  /* kind: main | branch ; las etiquetas se dibujan con fondo blanco   */
  diagramEdges: [
    // ---- camino principal ---- (ref = code del paso al que enlaza)
    { from: "E1", to: "E2", kind: "main", ref: "P1.A1", label: "Solicitar Movilizador (P1/P7/P8)", labelAt: [315, 78],   anchor: "middle", pts: [[180, 90], [450, 90]] },
    { from: "E2", to: "E3", kind: "main", ref: "P2.A1", label: "Recoger Paciente (P2)",            labelAt: [685, 78],   anchor: "middle", pts: [[550, 90], [820, 90]] },
    { from: "E3", to: "E4", kind: "main", ref: "P3.A2", label: "Limpieza Alta/Terminal (P3)",      labelAt: [1078, 185], anchor: "end",    pts: [[920, 90], [1090, 90], [1090, 270]] },
    { from: "E4", to: "E5", kind: "main", ref: "P3.A2", label: "Limpieza Terminal (P3)",           labelAt: [1078, 460], anchor: "end",    pts: [[1090, 370], [1090, 550]] },
    { from: "E5", to: "E6", kind: "main", ref: "P4.A2", label: "Solicitar Peróxido (P4)",          labelAt: [955, 585],  anchor: "middle", pts: [[1040, 600], [870, 600]] },
    { from: "E6", to: "E7", kind: "main", ref: "P9.A1", label: "Iniciar Peróxido (P9)",            labelAt: [690, 585],  anchor: "middle", pts: [[770, 600], [610, 600]] },
    { from: "E7", to: "E8", kind: "main", ref: "P9.A1", label: "Finalizar Peróxido (P9)",          labelAt: [430, 585],  anchor: "middle", pts: [[510, 600], [350, 600]] },
    { from: "E8", to: "E9", kind: "main", ref: "P3.A3", label: "Armar Cama (P3)",                  labelAt: [185, 585],  anchor: "middle", pts: [[250, 600], [120, 600]] },
    { from: "E9", to: "E1", kind: "main", ref: "P2.A2", label: "Ingresar Paciente (P2)", labelAt: [-58, 345], anchor: "middle", rotate: -90, pts: [[20, 600], [-50, 600], [-50, 90], [80, 90]] },
    // ---- ramas ----
    { from: "E4", to: "E9", kind: "branch", ref: "P3.A1",          label: "Limpieza Alta (P3)",            labelAt: [545, 308],  anchor: "middle", pts: [[1040, 320], [70, 320], [70, 550]] },
    { from: "E5", to: "E9", kind: "branch", ref: "P4.A1",          label: "Supervisión sin peróxido (P4)", labelAt: [580, 726],  anchor: "middle", pts: [[1090, 650], [1090, 710], [70, 710], [70, 650]] },
    { from: "E2", to: "E1", kind: "branch", ref: "P1.A4·Cancelar", label: "Cancelar Transporte (O1)",      labelAt: [315, 4],    anchor: "middle", pts: [[500, 40], [500, 12], [130, 12], [130, 40]] },
    { from: "E5", to: "E3", kind: "branch", ref: "P4.A3",          label: "Nueva limpieza (P4)",           labelAt: [1025, 4],   anchor: "middle", pts: [[1140, 600], [1180, 600], [1180, 12], [870, 12], [870, 40]] }
  ],

  /* ---------------------------------------------------------------- */
  resumen: { titulo: "Flujo de Alta de Paciente", cliente: "ACHS", nEstados: 9, nPerfiles: 9, nNotificaciones: 15 }
};

if (typeof window !== "undefined") { window.DATA = DATA; }

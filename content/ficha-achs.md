# FLUJO ESTÁNDAR: Alta de Paciente ACHS

## Paso 1: Solicitar Movilizador

**P1 Enfermera**, **P7 TENS** o **P8 Administrativo** escanea el QR de una cama ocupada y selecciona una de dos opciones: **Alta** o **Traslado**. En ambos casos completa nombre del paciente, selecciona precaución y marca si requiere peróxido. Si elige Traslado, además agrega el campo cama destino. La cama pasa a **E2: Esperando Transporte** y se notifica al **P5 Despachador** para coordinar el retiro.

1. Trigger: Escaneo QR
2. Perfil: P1 Enfermera, P7 TENS, P8 Administrativo
3. Actividades:
   - Alta: P1.A1 Solicitar Movilizador, P7.A1 Solicitar Movilizador, P8.A1 Solicitar Movilizador
   - Traslado: P1.A1 Solicitar Movilizador, P7.A1 Solicitar Movilizador, P8.A1 Solicitar Movilizador
4. Estado origen: E1 Cama Ocupada
5. Nuevo estado: E2 Esperando Transporte
6. Datos capturados:
   - Comunes: nombre paciente (texto libre), precaución (dropdown: Aéreo / Gotita / Contacto / Contacto + gotita / Covid / Ninguno), requiere peróxido (boolean)
   - Solo Traslado: cama destino (texto libre)
7. Integración: No hay
8. Notificaciones:
   - Alta: N1W.[P1/P7/P8].A1.E2.P5 (a P5 Despachador) — Exclusivo cluster: No
   - Traslado: N2W.[P1/P7/P8].A2.E2.P5 (a P5 Despachador) — Exclusivo cluster: No
9. Edge Cases: No hay
10. Guía UI: Selector tipo solicitud (Alta / Traslado), dropdown precaución, toggle requiere peróxido, campo texto nombre paciente, campo texto cama destino (solo si Traslado)

## Paso 2: Recoger Paciente (Movilizador)

**P2 OT/Movilizador** escanea el QR de la cama en estado Esperando Transporte y presiona "Recoger paciente". La cama pasa inmediatamente a **E3: Esperando Limpieza** y se notifica a **P6 Gestor de Camas** y **P4 Supervisor de Limpieza**. Al llegar a destino, el movilizador selecciona el destino final del paciente y confirma.

1. Trigger: Escaneo QR
2. Perfil: P2 OT/Movilizador
3. Actividad: P2.A1 Recoger Paciente
4. Estado origen: E2 Esperando Transporte
5. Nuevo estado: E3 Esperando Limpieza
6. Datos capturados: destino paciente (radio: Habitaciones / Hall Central / Estacionamientos / Sala de Transporte / Pabellón Central / CMA / Otros)
7. Integración: No hay
8. Notificaciones: N3W.P2.A1.E3.P6 (a P6 Gestor de Camas) — Exclusivo cluster: No; N4W.P2.A1.E3.P4 (a P4 Supervisor de Limpieza) — Exclusivo cluster: Sí
9. Edge Cases: No hay
10. Guía UI: Radio button destino paciente (7 opciones)

## Paso 3: Realizar Limpieza (Staff de Limpieza)

**P3 Staff de Limpieza** escanea el QR de la cama en estado Esperando Limpieza y selecciona el tipo de limpieza: **Alta** o **Terminal**. La cama pasa a **E4: Cama libre en aseo (terminal/alta)**. Si elige **Alta**, al completar el checklist la cama queda directamente en **E9: Cama Libre** (disponible, sin necesidad de supervisión). Si elige **Terminal**, al completar el checklist la cama queda en **E5: Esperando Supervisión** (la limpieza terminal siempre requiere supervisión).

1. Trigger: Escaneo QR
2. Perfil: P3 Staff de Limpieza
3. Actividades:
   - Alta: P3.A1 Limpieza Alta
   - Terminal: P3.A2 Limpieza Terminal
4. Estado origen: E3 Esperando Limpieza
5. Nuevo estado:
   - Alta: E4 Cama libre en aseo (terminal/alta) (intermedio) → E9 Cama Libre
   - Terminal: E4 Cama libre en aseo (terminal/alta) (intermedio) → E5 Esperando Supervisión
6. Datos capturados: Checklist de limpieza (30 items configurados por zona)
7. Integración: No hay
8. Notificaciones:
   - Alta: N5W.P3.A1.E9.P6 (a P6 Gestor de Camas) — Exclusivo cluster: No; N6W.P3.A1.E9.P4 (a P4 Supervisor de Limpieza) — Exclusivo cluster: Sí
   - Terminal: N7W.P3.A2.E5.P4 (a P4 Supervisor de Limpieza) — Exclusivo cluster: Sí
9. Edge Cases: No hay
10. Guía UI: Selector tipo limpieza (ALTA / TERMINAL). Checklist interactivo con items de limpieza. Si el checklist no se completa al 100%, se solicita motivo (radio: No fue necesario / Tuve un problema)

## Paso 4: Supervisar Limpieza (Supervisor de Limpieza)

**P4 Supervisor de Limpieza** escanea el QR de la cama en estado Esperando Supervisión, completa el checklist de supervisión y adjunta foto opcional. Luego tiene dos caminos:

- **Solicitar nueva limpieza**: se selecciona tipo (Alta o Terminal), la cama vuelve a **E3: Esperando Limpieza**.
- **Siguiente**: el sistema pregunta si requiere peróxido.
  - **Sí**: la cama pasa a **E6: Esperando Peróxido** y se notifica a **P9 Peróxido**.
  - **No**: la cama pasa a **E9: Cama Libre** y se notifica a **P6 Gestor de Camas**.

1. Trigger: Escaneo QR
2. Perfil: P4 Supervisor de Limpieza
3. Actividades:
   - Sin peróxido: P4.A1 Supervisión de Limpieza
   - Con peróxido: P4.A2 Solicitar Peróxido
   - Solicitar nueva limpieza: P4.A3 Supervisión de Limpieza
4. Estado origen: E5 Esperando Supervisión
5. Nuevo estado:
   - Sin peróxido: E9 Cama Libre
   - Con peróxido: E6 Esperando Peróxido
   - Solicitar nueva limpieza: E3 Esperando Limpieza
6. Datos capturados: Checklist supervisión (16 items), foto/evidencia (opcional), tipo de limpieza solicitada (Alta/Terminal — solo si elige nueva limpieza)
7. Integración: No hay
8. Notificaciones:
   - Sin peróxido: N8W.P4.A1.E9.P6 (a P6 Gestor de Camas) — Exclusivo cluster: No
   - Con peróxido: N9W.P4.A2.E6.P9 (a P9 Peróxido) — Exclusivo cluster: Sí
   - Solicitar nueva limpieza: No hay
9. Edge Cases: No hay
10. Guía UI: Checklist supervisión + campo foto opcional (workflow-photo-uploader) + dos botones: "Solicitar limpieza" (abre selector Alta/Terminal) y "Siguiente" (abre pregunta ¿Requiere peróxido? con opciones Sí/No)

## Paso 5: Realizar Peróxido

**P9 Peróxido** escanea el QR de la cama en estado Esperando Peróxido y presiona "Iniciar Peróxido". La cama pasa a **E7: Realizando Peróxido** (estado intermedio). Al finalizar el proceso, presiona "Siguiente" y la cama pasa a **E8: Esperando Armado**. Se notifica al **P4 Supervisor de Limpieza**.

1. Trigger: Escaneo QR
2. Perfil: P9 Peróxido
3. Actividad: P9.A1 Realizar Peróxido
4. Estado origen: E6 Esperando Peróxido
5. Nuevo estado: E7 Realizando Peróxido (intermedio) → E8 Esperando Armado
6. Datos capturados: No hay (solo confirmación inicio/fin)
7. Integración: No hay
8. Notificaciones: N10W.P9.A1.E8.P4 (a P4 Supervisor de Limpieza) — Exclusivo cluster: Sí
9. Edge Cases: No hay
10. Guía UI: Botón "Iniciar Peróxido", animación de proceso en curso, botón "Siguiente" para confirmar fin

## Paso 6: Armar Cama (Staff de Limpieza — solo viene de Peróxido)

**P3 Staff de Limpieza** escanea el QR de la cama en estado Esperando Armado (post-peróxido) y presiona "HABILITAR CAMA". La cama pasa directamente a **E9: Cama Libre**. Se notifica a **P6 Gestor de Camas** y **P4 Supervisor de Limpieza**.

1. Trigger: Escaneo QR
2. Perfil: P3 Staff de Limpieza
3. Actividad: P3.A3 Armar Cama
4. Estado origen: E8 Esperando Armado
5. Nuevo estado: E9 Cama Libre
6. Datos capturados: No hay (acción directa "Habilitar Cama")
7. Integración: No hay
8. Notificaciones: N11W.P3.A3.E9.P6 (a P6 Gestor de Camas) — Exclusivo cluster: No; N12W.P3.A3.E9.P4 (a P4 Supervisor de Limpieza) — Exclusivo cluster: Sí
9. Edge Cases: No hay
10. Guía UI: Botón "HABILITAR CAMA"

## Paso 7: Ingresar Paciente

### A: Ingresar Paciente (Movilizador)

**P2 OT/Movilizador** escanea el QR de una cama libre y selecciona "Ingresar paciente". Selecciona el género del paciente y confirma. La cama pasa a **E1: Cama Ocupada** y se notifica a **P6 Gestor de Camas**.

1. Trigger: Escaneo QR
2. Perfil: P2 OT/Movilizador
3. Actividad: P2.A2 Ingresar Paciente
4. Estado origen: E9 Cama Libre
5. Nuevo estado: E1 Cama Ocupada
6. Datos capturados: género paciente (radio: Masculino / Femenino / Transmasculino / Transfemenino)
7. Integración: No hay
8. Notificaciones: N13W.P2.A2.E1.P6 (a P6 Gestor de Camas) — Exclusivo cluster: No
9. Edge Cases: No hay
10. Guía UI: Radio button género (4 opciones)

### B: Ingresar Paciente (Enfermera/TENS/Administrativo)

**P1 Enfermera**, **P7 TENS** o **P8 Administrativo** escanea el QR de una cama libre y selecciona "Ingresar paciente". Selecciona el género del paciente y confirma. Registra directamente el ingreso sin necesidad de movilizador. La cama pasa a **E1: Cama Ocupada** y se notifica a **P6 Gestor de Camas**.

1. Trigger: Escaneo QR
2. Perfil: P1 Enfermera, P7 TENS, P8 Administrativo
3. Actividad: P1.A3 Ingresar Paciente, P7.A3 Ingresar Paciente, P8.A3 Ingresar Paciente
4. Estado origen: E9 Cama Libre
5. Nuevo estado: E1 Cama Ocupada
6. Datos capturados: género paciente (radio: Masculino / Femenino / Transmasculino / Transfemenino)
7. Integración: No hay
8. Notificaciones: N14W.[P1/P7/P8].A3.E1.P6 (a P6 Gestor de Camas) — Exclusivo cluster: No
9. Edge Cases: No hay
10. Guía UI: Radio button género (4 opciones)

# Opciones Adicionales

## O1: Cancelar Transporte

**P1 Enfermera**, **P7 TENS** o **P8 Administrativo** cancela un transporte previamente solicitado. Al escanear el QR de la cama en estado Esperando Transporte, se muestra un mensaje indicando que la solicitud ya fue realizada con opción de cancelar. La cama vuelve a **E1: Cama Ocupada** y se notifica al **P5 Despachador**.

1. Trigger: Escaneo QR
2. Perfil: P1 Enfermera, P7 TENS, P8 Administrativo
3. Actividad: P1.A4 Cancelar Solicitud, P7.A4 Cancelar Solicitud, P8.A4 Cancelar Solicitud
4. Estado origen: E2 Esperando Transporte
5. Nuevo estado: E1 Cama Ocupada
6. Datos capturados: No hay
7. Integración: No hay
8. Notificaciones: N15W.[P1/P7/P8].A4.E1.P5 (a P5 Despachador) — Exclusivo cluster: No
9. Edge Cases: No hay
10. Guía UI: Mensaje "La solicitud del movilizador ya fue realizada." + botón "Cancelar solicitud" + botón "Atrás"

## O2: Supervisión General

**P4 Supervisor de Limpieza** puede registrar una supervisión en cualquier cama sin importar su estado mediante escaneo QR. Completa un checklist de verificación y adjunta foto opcional. Esta acción no modifica el estado de la cama pero queda registrada como control de calidad.

1. Trigger: Escaneo QR
2. Perfil: P4 Supervisor de Limpieza
3. Actividad: P4.A4 Supervisión Limpieza
4. Estado origen: Cualquiera
5. Nuevo estado: Sin cambio
6. Datos capturados: Checklist supervisión (16 items), foto/evidencia (opcional)
7. Integración: No hay
8. Notificaciones: No hay
9. Edge Cases: No hay
10. Guía UI: Checklist supervisión + campo foto opcional (workflow-photo-uploader)

# Anexos

## 4.1 Perfiles (11)

* P1: Enfermera
* P2: OT/Movilizador
* P3: Staff de Limpieza
* P4: Supervisor de Limpieza
* P5: Despachador
* P6: Gestor de Camas
* P7: TENS
* P8: Administrativo
* P9: Peróxido
* P10: Gestión/Manager
* P11: Mantenimiento

## 4.2 Estados (9)

* E1: Cama Ocupada — Representación de una cama ocupada
* E2: Esperando Transporte — Cama en espera de un movilizador solicitado
* E3: Esperando Limpieza — Cama cuya limpieza ha sido solicitada pero aún está pendiente
* E4: Cama libre en aseo (terminal/alta) — Cama cuya limpieza terminal/alta está siendo realizada
* E5: Esperando Supervisión — Cama limpia que está esperando supervisión
* E6: Esperando Peróxido — Cama limpia que está esperando el proceso de peróxido
* E7: Realizando Peróxido — Cama limpia durante proceso de peróxido
* E8: Esperando Armado — Cama limpia con peróxido finalizado esperando ser vestida
* E9: Cama Libre — Cama disponible, limpia, lista para su uso

## 4.3 Notificaciones

Paso 1 — Solicitar Alta
N1W.[P1/P7/P8].A1.E2.P5

Exclusivo cluster: No

Enfermera/TENS/Administrativo (P1/P7/P8) solicita alta (A1), la cama pasa a E2 Esperando Transporte, notifica a P5 Despachador.

Paso 1 — Solicitar Traslado
N2W.[P1/P7/P8].A2.E2.P5

Exclusivo cluster: No

Enfermera/TENS/Administrativo (P1/P7/P8) solicita traslado (A2), la cama pasa a E2 Esperando Transporte, notifica a P5 Despachador.

Paso 2 — Recoger Paciente
N3W.P2.A1.E3.P6

Exclusivo cluster: No

Movilizador (P2) recoge paciente (A1), la cama pasa a E3 Esperando Limpieza, notifica a P6 Gestor de Camas.

N4W.P2.A1.E3.P4

Exclusivo cluster: Sí

Movilizador (P2) recoge paciente (A1), la cama pasa a E3 Esperando Limpieza, notifica a P4 Supervisor de Limpieza.

Paso 3 — Limpieza Alta
N5W.P3.A1.E9.P6

Exclusivo cluster: No

Staff de Limpieza (P3) finaliza limpieza alta (A1), la cama pasa a E9 Cama Libre, notifica a P6 Gestor de Camas.

N6W.P3.A1.E9.P4

Exclusivo cluster: Sí

Staff de Limpieza (P3) finaliza limpieza alta (A1), la cama pasa a E9 Cama Libre, notifica a P4 Supervisor de Limpieza.

Paso 3 — Limpieza Terminal
N7W.P3.A2.E5.P4

Exclusivo cluster: Sí

Staff de Limpieza (P3) finaliza limpieza terminal (A2), la cama pasa a E5 Esperando Supervisión, notifica a P4 Supervisor de Limpieza.

Paso 4 — Sin peróxido
N8W.P4.A1.E9.P6

Exclusivo cluster: No

Supervisor de Limpieza (P4) habilita cama tras supervisión (A1), la cama pasa a E9 Cama Libre, notifica a P6 Gestor de Camas.

Paso 4 — Solicitar Peróxido
N9W.P4.A2.E6.P9

Exclusivo cluster: Sí

Supervisor de Limpieza (P4) solicita peróxido (A2), la cama pasa a E6 Esperando Peróxido, notifica a P9 Peróxido.

Paso 5 — Peróxido
N10W.P9.A1.E8.P4

Exclusivo cluster: Sí

Peróxido (P9) finaliza proceso de peróxido (A1), la cama pasa a E8 Esperando Armado, notifica a P4 Supervisor de Limpieza.

Paso 6 — Armar Cama
N11W.P3.A3.E9.P6

Exclusivo cluster: No

Staff de Limpieza (P3) habilita cama (A3), la cama pasa a E9 Cama Libre, notifica a P6 Gestor de Camas.

N12W.P3.A3.E9.P4

Exclusivo cluster: Sí

Staff de Limpieza (P3) habilita cama (A3), la cama pasa a E9 Cama Libre, notifica a P4 Supervisor de Limpieza.

Paso 7A — Ingresar Paciente (Movilizador)
N13W.P2.A2.E1.P6

Exclusivo cluster: No

Movilizador (P2) ingresa paciente (A2), la cama pasa a E1 Cama Ocupada, notifica a P6 Gestor de Camas.

Paso 7B — Ingresar Paciente (Enfermera/TENS/Administrativo)
N14W.[P1/P7/P8].A3.E1.P6

Exclusivo cluster: No

Enfermera/TENS/Administrativo (P1/P7/P8) ingresa paciente (A3), la cama pasa a E1 Cama Ocupada, notifica a P6 Gestor de Camas.

O1 — Cancelar Transporte
N15W.[P1/P7/P8].A4.E1.P5

Exclusivo cluster: No

Enfermera/TENS/Administrativo (P1/P7/P8) cancela transporte (A4), la cama vuelve a E1 Cama Ocupada, notifica a P5 Despachador.

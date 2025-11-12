/**
 * testAsignaciones.js
 * Prueba simple para ver los datos de AsignacionesProfesor
 */

import supabase from "./model/supabase";

async function testAsignaciones() {
  console.log("🔍 Obteniendo todos los registros de AsignacionesProfesor...\n");

  try {
    // SELECT * FROM AsignacionesProfesor
    const { data, error } = await supabase
      .from("AsignacionesProfesor")
      .select("*");

    if (error) {
      console.error("❌ ERROR:", error);
      console.error("Mensaje:", error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log("⚠️ No hay registros en AsignacionesProfesor");
      return;
    }

    console.log(`✅ SE ENCONTRARON ${data.length} REGISTROS\n`);
    
    // Mostrar estructura
    console.log("📋 COLUMNAS:");
    const columnas = Object.keys(data[0]);
    columnas.forEach((col, i) => {
      console.log(`  ${i + 1}. ${col}`);
    });

    console.log("\n📊 DATOS EN TABLA:");
    console.table(data);

    console.log("\n📄 DATOS EN JSON:");
    console.log(JSON.stringify(data, null, 2));

    // Verificar si existen los campos que esperamos
    console.log("\n✔️ VALIDACIÓN:");
    const primerRegistro = data[0];
    
    console.log(`  - idProfesor: ${primerRegistro.idProfesor ? "✅ SÍ EXISTE" : "❌ NO EXISTE"}`);
    console.log(`  - disponibilidad: ${primerRegistro.disponibilidad !== undefined ? "✅ SÍ EXISTE" : "❌ NO EXISTE"}`);
    console.log(`  - asignados: ${primerRegistro.asignados !== undefined ? "✅ SÍ EXISTE" : "❌ NO EXISTE"}`);

  } catch (err) {
    console.error("❌ ERROR FATAL:", err.message);
    console.error(err);
  }
}

// Ejecutar automáticamente
console.log("════════════════════════════════════════");
console.log("TEST: SELECT * FROM AsignacionesProfesor");
console.log("════════════════════════════════════════\n");

testAsignaciones();

export { testAsignaciones };

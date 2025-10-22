import { conn } from "@/libs/postgress";
import { NextResponse } from "next/server";

export const POST = async (request, { params }) => {
  console.log("🔍 [INICIO] Asignando miembros a la familia");
  console.log("📌 Parámetros de ruta recibidos:", params);

  const { id: familyId } = params;

  if (!familyId) {
    console.warn("⚠️ [ERROR] ID de familia no proporcionado en la URL");
    return NextResponse.json(
      { message: "ID de familia es requerido" },
      { status: 400 }
    );
  }

  console.log(`🆔 ID de familia extraído: ${familyId}`);

  try {
    const body = await request.json();
    console.log("📦 Cuerpo de la solicitud recibido:", body);

    const { members } = body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      console.warn("⚠️ [ERROR] Lista de miembros ausente, no es un array o está vacía");
      return NextResponse.json(
        { message: "Lista de miembros es requerida" },
        { status: 400 }
      );
    }

    console.log(`👥 Número de miembros a procesar: ${members.length}`);
    console.log("📋 Lista de miembros:", members);

    // Verificar que la familia existe
    console.log(`🔍 Verificando existencia de la familia con ID: ${familyId}`);
    const familyCheck = await conn.query(
      "SELECT id_fam FROM tbfamilias WHERE id_fam = $1",
      [familyId]
    );
    console.log("✅ Resultado de verificación de familia:", familyCheck.rows);

    if (familyCheck.rows.length === 0) {
      console.warn(`❌ Familia con ID ${familyId} no encontrada en la base de datos`);
      return NextResponse.json(
        { message: "Familia no encontrada" },
        { status: 404 }
      );
    }

    const results = [];
    const client = await conn.connect();
    console.log("🔌 Conexión a la base de datos establecida para transacción");

    try {
      await client.query('BEGIN');
      console.log("🔄 Transacción iniciada (BEGIN)");

      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        console.log(`\n--- 🧑‍💼 Procesando miembro ${i + 1}/${members.length} ---`);
        console.log("📥 Datos del miembro:", member);

        const { nombre, cedula, parentesco } = member;

        console.log(`👤 Nombre: ${nombre}, Cédula: ${cedula}, Parentesco: ${parentesco}`);

        if (!cedula || !parentesco) {
          console.warn("⚠️ Datos incompletos para este miembro (falta cédula o parentesco)");
          results.push({
            cedula: cedula || "N/A",
            nombre: nombre || "N/A",
            success: false,
            message: "Cédula y parentesco son requeridos"
          });
          continue;
        }

        // Buscar miembro SOLO por cédula (única)
        console.log(`🔍 Buscando miembro por cédula: ${cedula}`);

        const memberSearch = await client.query(
          `SELECT id_mie, nombre_mie, cedula_mie, id_fam
           FROM tbmiembros
           WHERE cedula_mie = $1`,
          [cedula]
        );
        console.log("✅ Resultado de búsqueda del miembro:", memberSearch.rows);

        if (memberSearch.rows.length === 0) {
          console.warn(`❌ Miembro con cédula ${cedula} no encontrado en tbmiembros`);
          results.push({
            cedula,
            nombre: nombre || "N/A",
            success: false,
            message: "Miembro no encontrado"
          });
          continue;
        }

        const foundMember = memberSearch.rows[0];
        console.log("👤 Miembro encontrado:", foundMember);

        if (foundMember.id_fam !== null) {
          console.warn(`⚠️ Miembro ${foundMember.nombre_mie} (C.I. ${foundMember.cedula_mie}) ya pertenece a la familia ID ${foundMember.id_fam}`);
          results.push({
            cedula: foundMember.cedula_mie,
            nombre: foundMember.nombre_mie,
            success: false,
            message: "Miembro ya pertenece a otra familia"
          });
          continue;
        }

        // Actualizar usando id_mie (clave primaria)
        console.log(`✏️ Actualizando miembro ID ${foundMember.id_mie}: asignando a familia ${familyId} como '${parentesco}'`);
        await client.query(
          `UPDATE tbmiembros
           SET id_fam = $1, parentesco = $2
           WHERE id_mie = $3`,
          [familyId, parentesco, foundMember.id_mie]
        );
        console.log("✅ Miembro actualizado correctamente");

        results.push({
          cedula: foundMember.cedula_mie,
          nombre: foundMember.nombre_mie,
          success: true,
          message: "Miembro asignado exitosamente"
        });
      }

      await client.query('COMMIT');
      console.log("✅ Transacción confirmada (COMMIT)");

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("❌ Error durante la transacción. Rollback ejecutado.");
      console.error("💥 Detalle del error:", error);
      throw error;
    } finally {
      client.release();
      console.log("🔌 Conexión a la base de datos liberada");
    }

    const summary = {
      total: members.length,
      assigned: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    console.log("📊 Resumen del proceso:", summary);
    console.log("📤 Enviando respuesta final al cliente");
    console.log("✅ [FINAL] Asignación de miembros completada");

    return NextResponse.json({
      message: "Proceso de asignación completado",
      results,
      summary
    });

  } catch (error) {
    console.error("🔥 [ERROR GLOBAL] Error al asignar miembros a familia:", error);
    return NextResponse.json(
      { 
        message: "Error interno del servidor", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
};


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."EstadoAnteproyecto" AS ENUM (
    'Aprobado',
    'Pendiente',
    'Correccion',
    'Reprobado',
    'Defensa',
    'Corregido'
);


ALTER TYPE "public"."EstadoAnteproyecto" OWNER TO "postgres";


CREATE TYPE "public"."ListaDeCausasDePerdida" AS ENUM (
    'Situaciones familiares',
    'Por Trabajo',
    'Por asesoría inadecuada de profesor asesor',
    'Situaciones de la empresa',
    'Por falta de datos de la empresa',
    'Por mala organización del tiempo',
    'Situaciones de salud certificada'
);


ALTER TYPE "public"."ListaDeCausasDePerdida" OWNER TO "postgres";


CREATE TYPE "public"."SemestreProyecto" AS ENUM (
    'I',
    'II'
);


ALTER TYPE "public"."SemestreProyecto" OWNER TO "postgres";


CREATE TYPE "public"."SituacionLaboral" AS ENUM (
    'Trabaja',
    'Trabaja y estudia',
    'Solo estudia'
);


ALTER TYPE "public"."SituacionLaboral" OWNER TO "postgres";


CREATE TYPE "public"."TiposDeEvento" AS ENUM (
    'Entrega Avance 1',
    'Entrega Avance 2',
    'Entrega Avance 3',
    'Plazo para establecer disponibilidad',
    'Defensas',
    'Actas',
    'Semestre',
    'Informe Final',
    'Informe Preliminar',
    'Informe a Coordinación',
    'Informe Completo para Actas'
);


ALTER TYPE "public"."TiposDeEvento" OWNER TO "postgres";


CREATE TYPE "public"."enum" AS ENUM (
    '1',
    '2',
    '3'
);


ALTER TYPE "public"."enum" OWNER TO "postgres";


CREATE TYPE "public"."estado" AS ENUM (
    'Aprobado',
    'Reprobado',
    'Defensa'
);


ALTER TYPE "public"."estado" OWNER TO "postgres";


CREATE TYPE "public"."estadoavance" AS ENUM (
    'Aprobado',
    'Reprobado',
    'Pendiente',
    'Atrasado',
    'Asignado',
    'Pasa',
    'No Pasa',
    'A Mejorar'
);


ALTER TYPE "public"."estadoavance" OWNER TO "postgres";


CREATE TYPE "public"."estadousuario" AS ENUM (
    'aprobado',
    'reprobado',
    'retirado',
    'defensa',
    'en progreso'
);


ALTER TYPE "public"."estadousuario" OWNER TO "postgres";


CREATE TYPE "public"."seccion" AS ENUM (
    'Contexto',
    'Justificacion',
    'Sintomas',
    'Impacto',
    'Actividad'
);


ALTER TYPE "public"."seccion" OWNER TO "postgres";


CREATE TYPE "public"."sede" AS ENUM (
    'Central Cartago',
    'Local San Carlos',
    'Local San José',
    'Alajuela',
    'Limón'
);


ALTER TYPE "public"."sede" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cambiar_estado_proyecto"("p_proyecto_id" "uuid", "p_nuevo_estado" "public"."estadoavance", "p_usuario_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_tiene_permiso boolean;
BEGIN
    -- Verificar permisos
    SELECT validar_permiso(p_usuario_id, 'write', 'proyecto')
      INTO v_tiene_permiso;
    
    IF NOT v_tiene_permiso THEN
        RAISE EXCEPTION 'El usuario no tiene permisos para modificar el proyecto';
    END IF;

    -- Actualizar estado del proyecto
    UPDATE Proyecto
       SET estado = p_nuevo_estado
     WHERE id = p_proyecto_id;

    -- Crear entrada en bitácora para dejar constancia del cambio
    INSERT INTO Bitacora (estudiante_id, profesor_id, proyecto_id)
    SELECT p.estudiante_id, p.profesor_id, p.id
      FROM Proyecto p
     WHERE p.id = p_proyecto_id;

    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."cambiar_estado_proyecto"("p_proyecto_id" "uuid", "p_nuevo_estado" "public"."estadoavance", "p_usuario_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_bitacora_for_project"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO Bitacora (estudiante_id, profesor_id, proyecto_id)
    VALUES (NEW.estudiante_id, NEW.profesor_id, NEW.id);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_bitacora_for_project"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_disponibilidad_profesor"("p_profesor_id" "uuid", "p_fecha_inicio" "date", "p_fecha_fin" "date") RETURNS TABLE("dia" "date", "hora_inicio" time without time zone, "hora_fin" time without time zone, "citas_programadas" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.dia,
        d.hora_inicio,
        d.hora_fin,
        COUNT(c.cita_id)::integer AS citas_programadas
    FROM Disponibilidad d
    LEFT JOIN Cita c
           ON ((d.profesor_id = c.lector1 OR d.profesor_id = c.lector2)
               AND c.fecha = d.dia)
    WHERE d.profesor_id = p_profesor_id
      AND d.dia BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY d.dia, d.hora_inicio, d.hora_fin
    ORDER BY d.dia, d.hora_inicio;
END;
$$;


ALTER FUNCTION "public"."get_disponibilidad_profesor"("p_profesor_id" "uuid", "p_fecha_inicio" "date", "p_fecha_fin" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_proyecto_info"("p_proyecto_id" "uuid") RETURNS TABLE("estudiante_nombre" character varying, "profesor_nombre" character varying, "empresa_nombre" character varying, "estado" "public"."estadoavance", "fecha_inicio" "date", "fecha_fin" "date", "avance_actual" integer, "ultima_calificacion" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u1.nombre AS estudiante_nombre,
        u2.nombre AS profesor_nombre,
        e.nombre  AS empresa_nombre,
        p.estado,
        p.fecha_inicio,
        p.fecha_fin,
        COALESCE(
            (SELECT COUNT(*) FROM Avance a WHERE a.proyecto_id = p.id), 0
        ) AS avance_actual,
        COALESCE(
            (SELECT puntaje FROM Calificacion c 
             WHERE c.proyecto_id = p.id 
             ORDER BY fecha_calificacion DESC 
             LIMIT 1), 0
        ) AS ultima_calificacion
    FROM Proyecto p
    JOIN Estudiante est ON p.estudiante_id = est.estudiante_id
    JOIN Usuario u1 ON est.id_usuario = u1.id
    JOIN Profesor prof ON p.profesor_id = prof.profesor_id
    JOIN Usuario u2 ON prof.id_usuario = u2.id
    JOIN Anteproyecto ant ON p.anteproyecto_id = ant.id
    JOIN Empresa e ON ant.empresa_id = e.id
    WHERE p.id = p_proyecto_id;
END;
$$;


ALTER FUNCTION "public"."get_proyecto_info"("p_proyecto_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_proyectos_activos"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW vm_proyectos_activos;
END;
$$;


ALTER FUNCTION "public"."refresh_proyectos_activos"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reporte_avance_profesor"("p_profesor_id" "uuid") RETURNS TABLE("total_proyectos" integer, "proyectos_al_dia" integer, "proyectos_atrasados" integer, "promedio_calificaciones" numeric, "estudiantes_activos" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT p.id)::integer AS total_proyectos,
        COUNT(DISTINCT CASE WHEN p.estado = 'Aprobado' THEN p.id END)::integer AS proyectos_al_dia,
        COUNT(DISTINCT CASE WHEN p.estado = 'Atrasado' THEN p.id END)::integer AS proyectos_atrasados,
        COALESCE(AVG(c.puntaje), 0)::decimal AS promedio_calificaciones,
        COUNT(DISTINCT p.estudiante_id)::integer AS estudiantes_activos
    FROM Proyecto p
    LEFT JOIN Calificacion c ON p.id = c.proyecto_id
    WHERE p.profesor_id = p_profesor_id
      AND EXISTS (
          SELECT 1
          FROM Semestre s 
          WHERE s.semestre_id = p.semestre_id 
            AND s.activo = TRUE
      );
END;
$$;


ALTER FUNCTION "public"."reporte_avance_profesor"("p_profesor_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.ultima_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profesor_estudiantes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE Profesor
        SET cantidad_estudiantes = cantidad_estudiantes + 1
        WHERE profesor_id = NEW.profesor_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE Profesor
        SET cantidad_estudiantes = cantidad_estudiantes - 1
        WHERE profesor_id = OLD.profesor_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_profesor_estudiantes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validar_permiso"("p_usuario_id" "uuid", "p_accion" "text", "p_recurso" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_rol INTEGER;
BEGIN
    -- Obtener el rol del usuario
    SELECT rol
      INTO v_rol
      FROM Usuario
     WHERE id = p_usuario_id;
    
    -- Validar según el rol
    IF v_rol = 1 THEN
        -- Rol 1: Coordinador, puede todo
        RETURN TRUE;
    ELSIF v_rol = 2 THEN
        -- Rol 2: Profesor
        IF p_accion = 'read' THEN
            RETURN TRUE;
        ELSIF p_accion = 'write'
          AND p_recurso IN ('calificacion', 'avance', 'bitacora', 'proyecto') THEN
            RETURN TRUE;
        END IF;
    ELSIF v_rol = 3 THEN
        -- Rol 3: Estudiante
        IF p_accion = 'read'
           AND p_recurso IN ('proyecto', 'anteproyecto', 'calificacion') THEN
            RETURN TRUE;
        ELSIF p_accion = 'write'
           AND p_recurso = 'anteproyecto' THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."validar_permiso"("p_usuario_id" "uuid", "p_accion" "text", "p_recurso" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_disponibilidad_dates"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM Disponibilidad
        WHERE profesor_id = NEW.profesor_id
          AND dia = NEW.dia
          AND (
               (hora_inicio <= NEW.hora_inicio AND hora_fin > NEW.hora_inicio)
               OR (hora_inicio < NEW.hora_fin AND hora_fin >= NEW.hora_fin)
              )
          AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Conflicto de horario en disponibilidad';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_disponibilidad_dates"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Acta" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "estudiante_id" "uuid" NOT NULL,
    "profesor_id" "uuid" NOT NULL,
    "fecha_creacion" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "titulo" "text",
    "datos" "jsonb",
    "semestre" "text",
    "machote" "text"
);


ALTER TABLE "public"."Acta" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Anteproyecto" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "estudiante_id" "uuid" NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "contexto" "text" NOT NULL,
    "justificacion" "text" NOT NULL,
    "sintomas" "text" NOT NULL,
    "impacto" "text" NOT NULL,
    "actividad" "text",
    "comentario" "text",
    "fecha_creacion" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "ultima_modificacion" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "estado" "public"."EstadoAnteproyecto",
    "tipo" "text",
    "departamento" "text",
    "categoria_id" integer,
    "año" bigint,
    "semestre" bigint
);


ALTER TABLE "public"."Anteproyecto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."AnteproyectoContacto" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "anteproyecto_id" "uuid" NOT NULL,
    "contacto_id" "uuid" NOT NULL,
    "rrhh_id" "uuid"
);


ALTER TABLE "public"."AnteproyectoContacto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."AsignacionesProfesor" (
    "idProfesor" "uuid" NOT NULL,
    "semestre" bigint NOT NULL,
    "año" bigint NOT NULL,
    "disponibilidad" bigint DEFAULT '0'::bigint NOT NULL,
    "asignados" bigint DEFAULT '0'::bigint NOT NULL
);


ALTER TABLE "public"."AsignacionesProfesor" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Avance" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "num_avance" integer NOT NULL,
    "proyecto_id" "uuid" NOT NULL,
    "estado" "public"."estadoavance" NOT NULL,
    "fecha_avance" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."Avance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Bitacora" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "fecha_creacion" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "estudiante_id" "uuid" NOT NULL,
    "profesor_id" "uuid" NOT NULL,
    "proyecto_id" "uuid" NOT NULL
);


ALTER TABLE "public"."Bitacora" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Calendario" (
    "calendario_id" integer NOT NULL,
    "nombre" "text" NOT NULL,
    "fecha_inicio" "date" NOT NULL,
    "fecha_fin" "date" NOT NULL
);


ALTER TABLE "public"."Calendario" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Calificacion" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proyecto_id" "uuid",
    "profesor_id" "uuid" NOT NULL,
    "estudiante_id" "uuid" NOT NULL,
    "semestre_id" integer NOT NULL,
    "score_agilidad" smallint NOT NULL,
    "score_empatia" smallint NOT NULL,
    "score_respeto" smallint NOT NULL,
    "score_comunicacion" smallint NOT NULL,
    "score_aclaracion" smallint NOT NULL,
    "score_respuestas" smallint NOT NULL,
    "score_correccion" smallint NOT NULL,
    "score_explicacion" smallint NOT NULL,
    "score_retroalimentacion" smallint NOT NULL,
    "recomendacion" smallint NOT NULL,
    "star_rating" smallint NOT NULL,
    "comentarios" "text",
    "fecha_calificacion" timestamp without time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "Calificacion_recomendacion_check" CHECK ((("recomendacion" >= 0) AND ("recomendacion" <= 10))),
    CONSTRAINT "Calificacion_score_aclaracion_check" CHECK ((("score_aclaracion" >= 1) AND ("score_aclaracion" <= 5))),
    CONSTRAINT "Calificacion_score_agilidad_check" CHECK ((("score_agilidad" >= 1) AND ("score_agilidad" <= 5))),
    CONSTRAINT "Calificacion_score_comunicacion_check" CHECK ((("score_comunicacion" >= 1) AND ("score_comunicacion" <= 5))),
    CONSTRAINT "Calificacion_score_correccion_check" CHECK ((("score_correccion" >= 1) AND ("score_correccion" <= 5))),
    CONSTRAINT "Calificacion_score_empatia_check" CHECK ((("score_empatia" >= 1) AND ("score_empatia" <= 5))),
    CONSTRAINT "Calificacion_score_explicacion_check" CHECK ((("score_explicacion" >= 1) AND ("score_explicacion" <= 5))),
    CONSTRAINT "Calificacion_score_respeto_check" CHECK ((("score_respeto" >= 1) AND ("score_respeto" <= 5))),
    CONSTRAINT "Calificacion_score_respuestas_check" CHECK ((("score_respuestas" >= 1) AND ("score_respuestas" <= 5))),
    CONSTRAINT "Calificacion_score_retroalimentacion_check" CHECK ((("score_retroalimentacion" >= 1) AND ("score_retroalimentacion" <= 5))),
    CONSTRAINT "Calificacion_star_rating_check" CHECK ((("star_rating" >= 1) AND ("star_rating" <= 5)))
);


ALTER TABLE "public"."Calificacion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Categoria" (
    "categoria_id" integer NOT NULL,
    "nombre" character varying(100) NOT NULL
);


ALTER TABLE "public"."Categoria" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Cita" (
    "cita_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tutor" "uuid",
    "lector1" "uuid",
    "lector2" "uuid",
    "proyecto_id" "uuid",
    "medio" character varying(100),
    "virtual" boolean DEFAULT false,
    "semestre_id" integer,
    "estudiante_id" "uuid",
    "disponibilidad_id" "uuid",
    CONSTRAINT "different_lectors" CHECK ((("lector1" IS NULL) OR ("lector2" IS NULL) OR ("lector1" <> "lector2")))
);


ALTER TABLE "public"."Cita" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ContactoEmpresa" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "nombre" "text" NOT NULL,
    "departamento" "text",
    "correo" "text",
    "telefono" "text"
);


ALTER TABLE "public"."ContactoEmpresa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Correcciones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "anteproyecto_id" "uuid" NOT NULL,
    "seccion" "public"."seccion" NOT NULL,
    "contenido" "text" NOT NULL,
    "fecha_correccion" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "Corregido" boolean DEFAULT false
);


ALTER TABLE "public"."Correcciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Empresa" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nombre" "text" NOT NULL,
    "tipo" "text" NOT NULL,
    "provincia" "text" NOT NULL,
    "canton" "text" NOT NULL,
    "distrito" "text" NOT NULL,
    "actividad" "text"
);


ALTER TABLE "public"."Empresa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Entrada" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "bitacora_id" "uuid" NOT NULL,
    "fecha" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "contenido" "text" NOT NULL,
    "aprobada_prof" boolean DEFAULT false,
    "aprobada_est" boolean DEFAULT false
);


ALTER TABLE "public"."Entrada" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Estudiante" (
    "estudiante_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "id_usuario" "uuid" NOT NULL,
    "carnet" "text" NOT NULL,
    "asesor" "uuid",
    "estado" "public"."estadousuario",
    "semestre_id" integer,
    "situacion_laboral" "public"."SituacionLaboral",
    "anio_ingreso" integer
);


ALTER TABLE "public"."Estudiante" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Evento" (
    "evento_id" integer NOT NULL,
    "calendario_id" integer NOT NULL,
    "descripcion" "text" NOT NULL,
    "fecha_inicio" timestamp without time zone NOT NULL,
    "fecha_fin" timestamp without time zone NOT NULL,
    CONSTRAINT "valid_event_dates" CHECK (("fecha_inicio" < "fecha_fin"))
);


ALTER TABLE "public"."Evento" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."HistorialReprobacion" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "estudiante_id" "uuid" NOT NULL,
    "causa" "public"."ListaDeCausasDePerdida" NOT NULL,
    "semestre" "public"."SemestreProyecto" NOT NULL,
    "anio" integer NOT NULL,
    "detalle" "text",
    "fecha_registro" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."HistorialReprobacion" OWNER TO "postgres";


COMMENT ON TABLE "public"."HistorialReprobacion" IS 'Registra cada instancia en que un estudiante ha reprobado o abandonado el proyecto de graduación, junto con la causa específica.';



CREATE TABLE IF NOT EXISTS "public"."Machote" (
    "id_machote" integer NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "formulario_json" "jsonb" NOT NULL,
    "activo" boolean DEFAULT true
);


ALTER TABLE "public"."Machote" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Profesor" (
    "profesor_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "id_usuario" "uuid" NOT NULL,
    "cantidad_estudiantes" integer DEFAULT 0,
    "categoria_id" integer,
    "estudiantes_libres" integer DEFAULT 0 NOT NULL,
    "ver_calificaciones" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."Profesor" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Proyecto" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profesor_id" "uuid",
    "estudiante_id" "uuid" NOT NULL,
    "anteproyecto_id" "uuid" NOT NULL,
    "estado" "public"."estadoavance" NOT NULL,
    "semestre_id" integer,
    "fecha_inicio" "date" NOT NULL,
    "fecha_fin" "date",
    "semestre" bigint,
    "año" bigint,
    CONSTRAINT "valid_dates" CHECK ((("fecha_fin" IS NULL) OR ("fecha_inicio" <= "fecha_fin")))
);


ALTER TABLE "public"."Proyecto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Semestre" (
    "semestre_id" integer NOT NULL,
    "fecha_inicio" "date" NOT NULL,
    "fecha_fin" "date" NOT NULL,
    "nombre" "text",
    "calendario_id" integer,
    CONSTRAINT "valid_semestre_dates" CHECK (("fecha_inicio" < "fecha_fin"))
);


ALTER TABLE "public"."Semestre" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."SolicitudCarta" (
    "id_solicitud" integer NOT NULL,
    "estudiante_id" "uuid" NOT NULL,
    "fecha_solicitud" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "nombre_receptor" "text",
    "puesto_receptor" "text",
    "empresa" "text",
    "genero_emisor" "text",
    "genero_receptor" "text",
    "apellidos_receptor" "text",
    "cedula" "text",
    "idioma" "text",
    "semestre" "text",
    "annio" "text"
);


ALTER TABLE "public"."SolicitudCarta" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."TipoEvento" (
    "id" bigint NOT NULL,
    "nombre" "text" NOT NULL
);


ALTER TABLE "public"."TipoEvento" OWNER TO "postgres";


ALTER TABLE "public"."TipoEvento" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."TipoEvento_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."TipoProyecto" (
    "id" integer NOT NULL,
    "nombre" "text" NOT NULL
);


ALTER TABLE "public"."TipoProyecto" OWNER TO "postgres";


ALTER TABLE "public"."TipoProyecto" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."TipoProyecto_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."Usuario" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "correo" character varying(100) NOT NULL,
    "contrasena" character varying(100) NOT NULL,
    "rol" integer NOT NULL,
    "sede" "public"."sede" NOT NULL,
    "telefono" character varying(20),
    "recovery_token" character varying(100),
    "exp_recuperacion" timestamp without time zone,
    "provincia" "text",
    "canton" "text",
    "distrito" "text",
    "correo_opt" "text",
    CONSTRAINT "valid_rol" CHECK (("rol" = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE "public"."Usuario" OWNER TO "postgres";


COMMENT ON COLUMN "public"."Usuario"."correo_opt" IS 'Usado para el correo opcional al registrar usuarios, por lo tanto puede que hayan registros que no tengan este valor.';



CREATE SEQUENCE IF NOT EXISTS "public"."avance_num_avance_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."avance_num_avance_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."avance_num_avance_seq" OWNED BY "public"."Avance"."num_avance";



CREATE SEQUENCE IF NOT EXISTS "public"."calendario_calendario_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."calendario_calendario_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."calendario_calendario_id_seq" OWNED BY "public"."Calendario"."calendario_id";



CREATE SEQUENCE IF NOT EXISTS "public"."categoria_categoria_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."categoria_categoria_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categoria_categoria_id_seq" OWNED BY "public"."Categoria"."categoria_id";



CREATE TABLE IF NOT EXISTS "public"."disponibilidad" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profesor_id" "uuid" NOT NULL,
    "hora_inicio" time without time zone NOT NULL,
    "hora_fin" time without time zone NOT NULL,
    "dia" "date" NOT NULL,
    CONSTRAINT "valid_hours" CHECK (("hora_inicio" < "hora_fin"))
);


ALTER TABLE "public"."disponibilidad" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."evento_evento_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."evento_evento_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."evento_evento_id_seq" OWNED BY "public"."Evento"."evento_id";



CREATE SEQUENCE IF NOT EXISTS "public"."machote_id_machote_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."machote_id_machote_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."machote_id_machote_seq" OWNED BY "public"."Machote"."id_machote";



CREATE SEQUENCE IF NOT EXISTS "public"."semestre_semestre_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."semestre_semestre_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."semestre_semestre_id_seq" OWNED BY "public"."Semestre"."semestre_id";



CREATE SEQUENCE IF NOT EXISTS "public"."solicitudcarta_id_solicitud_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."solicitudcarta_id_solicitud_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."solicitudcarta_id_solicitud_seq" OWNED BY "public"."SolicitudCarta"."id_solicitud";



ALTER TABLE ONLY "public"."Avance" ALTER COLUMN "num_avance" SET DEFAULT "nextval"('"public"."avance_num_avance_seq"'::"regclass");



ALTER TABLE ONLY "public"."Calendario" ALTER COLUMN "calendario_id" SET DEFAULT "nextval"('"public"."calendario_calendario_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Categoria" ALTER COLUMN "categoria_id" SET DEFAULT "nextval"('"public"."categoria_categoria_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Evento" ALTER COLUMN "evento_id" SET DEFAULT "nextval"('"public"."evento_evento_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Machote" ALTER COLUMN "id_machote" SET DEFAULT "nextval"('"public"."machote_id_machote_seq"'::"regclass");



ALTER TABLE ONLY "public"."Semestre" ALTER COLUMN "semestre_id" SET DEFAULT "nextval"('"public"."semestre_semestre_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."SolicitudCarta" ALTER COLUMN "id_solicitud" SET DEFAULT "nextval"('"public"."solicitudcarta_id_solicitud_seq"'::"regclass");



ALTER TABLE ONLY "public"."Anteproyecto"
    ADD CONSTRAINT "Anteproyecto_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."AsignacionesProfesor"
    ADD CONSTRAINT "AsignacionesProfesor_pkey" PRIMARY KEY ("idProfesor", "semestre", "año");



ALTER TABLE ONLY "public"."Calendario"
    ADD CONSTRAINT "Calendario_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."Calificacion"
    ADD CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."TipoEvento"
    ADD CONSTRAINT "TipoEvento_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."TipoProyecto"
    ADD CONSTRAINT "TipoProyecto_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Usuario"
    ADD CONSTRAINT "Usuario_correo_key" UNIQUE ("correo");



ALTER TABLE ONLY "public"."Usuario"
    ADD CONSTRAINT "Usuario_correo_opt_key" UNIQUE ("correo_opt");



ALTER TABLE ONLY "public"."Acta"
    ADD CONSTRAINT "acta_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Anteproyecto"
    ADD CONSTRAINT "anteproyecto_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."AnteproyectoContacto"
    ADD CONSTRAINT "anteproyectocontacto_anteproyecto_id_contacto_id_key" UNIQUE ("anteproyecto_id", "contacto_id");



ALTER TABLE ONLY "public"."AnteproyectoContacto"
    ADD CONSTRAINT "anteproyectocontacto_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Avance"
    ADD CONSTRAINT "avance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Bitacora"
    ADD CONSTRAINT "bitacora_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Calendario"
    ADD CONSTRAINT "calendario_pkey" PRIMARY KEY ("calendario_id");



ALTER TABLE ONLY "public"."Categoria"
    ADD CONSTRAINT "categoria_pkey" PRIMARY KEY ("categoria_id");



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "cita_estudiante_id_key" UNIQUE ("estudiante_id");



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "cita_pkey" PRIMARY KEY ("cita_id");



ALTER TABLE ONLY "public"."ContactoEmpresa"
    ADD CONSTRAINT "contactoempresa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Correcciones"
    ADD CONSTRAINT "correcciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."disponibilidad"
    ADD CONSTRAINT "disponibilidad_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Empresa"
    ADD CONSTRAINT "empresa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Entrada"
    ADD CONSTRAINT "entrada_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Estudiante"
    ADD CONSTRAINT "estudiante_carnet_key" UNIQUE ("carnet");



ALTER TABLE ONLY "public"."Estudiante"
    ADD CONSTRAINT "estudiante_pkey" PRIMARY KEY ("estudiante_id");



ALTER TABLE ONLY "public"."Evento"
    ADD CONSTRAINT "evento_pkey" PRIMARY KEY ("evento_id");



ALTER TABLE ONLY "public"."HistorialReprobacion"
    ADD CONSTRAINT "historialreprobacion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Machote"
    ADD CONSTRAINT "machote_pkey" PRIMARY KEY ("id_machote");



ALTER TABLE ONLY "public"."Profesor"
    ADD CONSTRAINT "profesor_pkey" PRIMARY KEY ("profesor_id");



ALTER TABLE ONLY "public"."Proyecto"
    ADD CONSTRAINT "proyecto_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Semestre"
    ADD CONSTRAINT "semestre_pkey" PRIMARY KEY ("semestre_id");



ALTER TABLE ONLY "public"."SolicitudCarta"
    ADD CONSTRAINT "solicitudcarta_pkey" PRIMARY KEY ("id_solicitud");



ALTER TABLE ONLY "public"."Usuario"
    ADD CONSTRAINT "usuario_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_avance_proyecto" ON "public"."Avance" USING "btree" ("proyecto_id");



CREATE INDEX "idx_bitacora_proyecto" ON "public"."Bitacora" USING "btree" ("proyecto_id");



CREATE INDEX "idx_disponibilidad_profesor_fecha" ON "public"."disponibilidad" USING "btree" ("profesor_id", "dia");



CREATE INDEX "idx_entrada_bitacora" ON "public"."Entrada" USING "btree" ("bitacora_id");



CREATE INDEX "idx_estudiante_carnet" ON "public"."Estudiante" USING "btree" ("carnet");



CREATE INDEX "idx_evento_calendario" ON "public"."Evento" USING "btree" ("calendario_id");



CREATE INDEX "idx_proyecto_estado" ON "public"."Proyecto" USING "btree" ("estado");



CREATE INDEX "idx_usuario_correo" ON "public"."Usuario" USING "btree" ("correo");



CREATE OR REPLACE TRIGGER "update_anteproyecto_timestamp" BEFORE UPDATE ON "public"."Anteproyecto" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_timestamp"();



ALTER TABLE ONLY "public"."AnteproyectoContacto"
    ADD CONSTRAINT "AnteproyectoContacto_rrhh_id_fkey" FOREIGN KEY ("rrhh_id") REFERENCES "public"."ContactoEmpresa"("id");



ALTER TABLE ONLY "public"."Anteproyecto"
    ADD CONSTRAINT "Anteproyecto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."Categoria"("categoria_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."AsignacionesProfesor"
    ADD CONSTRAINT "AsignacionesProfesor_idProfesor_fkey" FOREIGN KEY ("idProfesor") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Avance"
    ADD CONSTRAINT "Avance_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Bitacora"
    ADD CONSTRAINT "Bitacora_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Calificacion"
    ADD CONSTRAINT "Calificacion_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "Cita_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "Cita_semestre_id_fkey" FOREIGN KEY ("semestre_id") REFERENCES "public"."Semestre"("semestre_id");



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "Cita_tutor_fkey" FOREIGN KEY ("tutor") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."disponibilidad"
    ADD CONSTRAINT "Disponibilidad_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Entrada"
    ADD CONSTRAINT "Entrada_bitacora_id_fkey" FOREIGN KEY ("bitacora_id") REFERENCES "public"."Bitacora"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Entrada"
    ADD CONSTRAINT "Entrada_bitacora_id_fkey1" FOREIGN KEY ("bitacora_id") REFERENCES "public"."Bitacora"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Estudiante"
    ADD CONSTRAINT "Estudiante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Estudiante"
    ADD CONSTRAINT "Estudiante_semestre_id_fkey" FOREIGN KEY ("semestre_id") REFERENCES "public"."Semestre"("semestre_id");



ALTER TABLE ONLY "public"."Profesor"
    ADD CONSTRAINT "Profesor_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."Categoria"("categoria_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."Profesor"
    ADD CONSTRAINT "Profesor_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Proyecto"
    ADD CONSTRAINT "Proyecto_anteproyecto_id_fkey" FOREIGN KEY ("anteproyecto_id") REFERENCES "public"."Anteproyecto"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Semestre"
    ADD CONSTRAINT "Semestre_calendario_id_fkey" FOREIGN KEY ("calendario_id") REFERENCES "public"."Calendario"("calendario_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."SolicitudCarta"
    ADD CONSTRAINT "SolicitudCarta_estudiante_id_fkey1" FOREIGN KEY ("estudiante_id") REFERENCES "public"."Estudiante"("estudiante_id");



ALTER TABLE ONLY "public"."Acta"
    ADD CONSTRAINT "acta_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."Estudiante"("estudiante_id");



ALTER TABLE ONLY "public"."Acta"
    ADD CONSTRAINT "acta_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Anteproyecto"
    ADD CONSTRAINT "anteproyecto_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."Empresa"("id");



ALTER TABLE ONLY "public"."Anteproyecto"
    ADD CONSTRAINT "anteproyecto_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."Estudiante"("estudiante_id");



ALTER TABLE ONLY "public"."AnteproyectoContacto"
    ADD CONSTRAINT "anteproyectocontacto_anteproyecto_id_fkey" FOREIGN KEY ("anteproyecto_id") REFERENCES "public"."Anteproyecto"("id");



ALTER TABLE ONLY "public"."AnteproyectoContacto"
    ADD CONSTRAINT "anteproyectocontacto_contacto_id_fkey" FOREIGN KEY ("contacto_id") REFERENCES "public"."ContactoEmpresa"("id");



ALTER TABLE ONLY "public"."Bitacora"
    ADD CONSTRAINT "bitacora_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."Estudiante"("estudiante_id");



ALTER TABLE ONLY "public"."Bitacora"
    ADD CONSTRAINT "bitacora_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "cita_disponibilidad_id_fkey" FOREIGN KEY ("disponibilidad_id") REFERENCES "public"."disponibilidad"("id");



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "cita_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."Estudiante"("estudiante_id");



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "cita_lector1_fkey" FOREIGN KEY ("lector1") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Cita"
    ADD CONSTRAINT "cita_lector2_fkey" FOREIGN KEY ("lector2") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."ContactoEmpresa"
    ADD CONSTRAINT "contactoempresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."Empresa"("id");



ALTER TABLE ONLY "public"."Correcciones"
    ADD CONSTRAINT "correcciones_anteproyecto_id_fkey" FOREIGN KEY ("anteproyecto_id") REFERENCES "public"."Anteproyecto"("id");



ALTER TABLE ONLY "public"."disponibilidad"
    ADD CONSTRAINT "disponibilidad_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Estudiante"
    ADD CONSTRAINT "estudiante_asesor_fkey" FOREIGN KEY ("asesor") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Evento"
    ADD CONSTRAINT "evento_calendario_id_fkey" FOREIGN KEY ("calendario_id") REFERENCES "public"."Calendario"("calendario_id");



ALTER TABLE ONLY "public"."Calificacion"
    ADD CONSTRAINT "fk_calificacion_estudiante" FOREIGN KEY ("estudiante_id") REFERENCES "public"."Estudiante"("estudiante_id");



ALTER TABLE ONLY "public"."Calificacion"
    ADD CONSTRAINT "fk_calificacion_profesor" FOREIGN KEY ("profesor_id") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Calificacion"
    ADD CONSTRAINT "fk_calificacion_semestre" FOREIGN KEY ("semestre_id") REFERENCES "public"."Semestre"("semestre_id");



ALTER TABLE ONLY "public"."HistorialReprobacion"
    ADD CONSTRAINT "historialreprobacion_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."Estudiante"("estudiante_id");



ALTER TABLE ONLY "public"."Proyecto"
    ADD CONSTRAINT "proyecto_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."Estudiante"("estudiante_id");



ALTER TABLE ONLY "public"."Proyecto"
    ADD CONSTRAINT "proyecto_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."Profesor"("profesor_id");



ALTER TABLE ONLY "public"."Proyecto"
    ADD CONSTRAINT "proyecto_semestre_id_fkey" FOREIGN KEY ("semestre_id") REFERENCES "public"."Semestre"("semestre_id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."cambiar_estado_proyecto"("p_proyecto_id" "uuid", "p_nuevo_estado" "public"."estadoavance", "p_usuario_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cambiar_estado_proyecto"("p_proyecto_id" "uuid", "p_nuevo_estado" "public"."estadoavance", "p_usuario_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cambiar_estado_proyecto"("p_proyecto_id" "uuid", "p_nuevo_estado" "public"."estadoavance", "p_usuario_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_bitacora_for_project"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_bitacora_for_project"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_bitacora_for_project"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_disponibilidad_profesor"("p_profesor_id" "uuid", "p_fecha_inicio" "date", "p_fecha_fin" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_disponibilidad_profesor"("p_profesor_id" "uuid", "p_fecha_inicio" "date", "p_fecha_fin" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_disponibilidad_profesor"("p_profesor_id" "uuid", "p_fecha_inicio" "date", "p_fecha_fin" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_proyecto_info"("p_proyecto_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_proyecto_info"("p_proyecto_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_proyecto_info"("p_proyecto_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_proyectos_activos"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_proyectos_activos"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_proyectos_activos"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reporte_avance_profesor"("p_profesor_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reporte_avance_profesor"("p_profesor_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reporte_avance_profesor"("p_profesor_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profesor_estudiantes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profesor_estudiantes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profesor_estudiantes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validar_permiso"("p_usuario_id" "uuid", "p_accion" "text", "p_recurso" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validar_permiso"("p_usuario_id" "uuid", "p_accion" "text", "p_recurso" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validar_permiso"("p_usuario_id" "uuid", "p_accion" "text", "p_recurso" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_disponibilidad_dates"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_disponibilidad_dates"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_disponibilidad_dates"() TO "service_role";


















GRANT ALL ON TABLE "public"."Acta" TO "anon";
GRANT ALL ON TABLE "public"."Acta" TO "authenticated";
GRANT ALL ON TABLE "public"."Acta" TO "service_role";



GRANT ALL ON TABLE "public"."Anteproyecto" TO "anon";
GRANT ALL ON TABLE "public"."Anteproyecto" TO "authenticated";
GRANT ALL ON TABLE "public"."Anteproyecto" TO "service_role";



GRANT ALL ON TABLE "public"."AnteproyectoContacto" TO "anon";
GRANT ALL ON TABLE "public"."AnteproyectoContacto" TO "authenticated";
GRANT ALL ON TABLE "public"."AnteproyectoContacto" TO "service_role";



GRANT ALL ON TABLE "public"."AsignacionesProfesor" TO "anon";
GRANT ALL ON TABLE "public"."AsignacionesProfesor" TO "authenticated";
GRANT ALL ON TABLE "public"."AsignacionesProfesor" TO "service_role";



GRANT ALL ON TABLE "public"."Avance" TO "anon";
GRANT ALL ON TABLE "public"."Avance" TO "authenticated";
GRANT ALL ON TABLE "public"."Avance" TO "service_role";



GRANT ALL ON TABLE "public"."Bitacora" TO "anon";
GRANT ALL ON TABLE "public"."Bitacora" TO "authenticated";
GRANT ALL ON TABLE "public"."Bitacora" TO "service_role";



GRANT ALL ON TABLE "public"."Calendario" TO "anon";
GRANT ALL ON TABLE "public"."Calendario" TO "authenticated";
GRANT ALL ON TABLE "public"."Calendario" TO "service_role";



GRANT ALL ON TABLE "public"."Calificacion" TO "anon";
GRANT ALL ON TABLE "public"."Calificacion" TO "authenticated";
GRANT ALL ON TABLE "public"."Calificacion" TO "service_role";



GRANT ALL ON TABLE "public"."Categoria" TO "anon";
GRANT ALL ON TABLE "public"."Categoria" TO "authenticated";
GRANT ALL ON TABLE "public"."Categoria" TO "service_role";



GRANT ALL ON TABLE "public"."Cita" TO "anon";
GRANT ALL ON TABLE "public"."Cita" TO "authenticated";
GRANT ALL ON TABLE "public"."Cita" TO "service_role";



GRANT ALL ON TABLE "public"."ContactoEmpresa" TO "anon";
GRANT ALL ON TABLE "public"."ContactoEmpresa" TO "authenticated";
GRANT ALL ON TABLE "public"."ContactoEmpresa" TO "service_role";



GRANT ALL ON TABLE "public"."Correcciones" TO "anon";
GRANT ALL ON TABLE "public"."Correcciones" TO "authenticated";
GRANT ALL ON TABLE "public"."Correcciones" TO "service_role";



GRANT ALL ON TABLE "public"."Empresa" TO "anon";
GRANT ALL ON TABLE "public"."Empresa" TO "authenticated";
GRANT ALL ON TABLE "public"."Empresa" TO "service_role";



GRANT ALL ON TABLE "public"."Entrada" TO "anon";
GRANT ALL ON TABLE "public"."Entrada" TO "authenticated";
GRANT ALL ON TABLE "public"."Entrada" TO "service_role";



GRANT ALL ON TABLE "public"."Estudiante" TO "anon";
GRANT ALL ON TABLE "public"."Estudiante" TO "authenticated";
GRANT ALL ON TABLE "public"."Estudiante" TO "service_role";



GRANT ALL ON TABLE "public"."Evento" TO "anon";
GRANT ALL ON TABLE "public"."Evento" TO "authenticated";
GRANT ALL ON TABLE "public"."Evento" TO "service_role";



GRANT ALL ON TABLE "public"."HistorialReprobacion" TO "anon";
GRANT ALL ON TABLE "public"."HistorialReprobacion" TO "authenticated";
GRANT ALL ON TABLE "public"."HistorialReprobacion" TO "service_role";



GRANT ALL ON TABLE "public"."Machote" TO "anon";
GRANT ALL ON TABLE "public"."Machote" TO "authenticated";
GRANT ALL ON TABLE "public"."Machote" TO "service_role";



GRANT ALL ON TABLE "public"."Profesor" TO "anon";
GRANT ALL ON TABLE "public"."Profesor" TO "authenticated";
GRANT ALL ON TABLE "public"."Profesor" TO "service_role";



GRANT ALL ON TABLE "public"."Proyecto" TO "anon";
GRANT ALL ON TABLE "public"."Proyecto" TO "authenticated";
GRANT ALL ON TABLE "public"."Proyecto" TO "service_role";



GRANT ALL ON TABLE "public"."Semestre" TO "anon";
GRANT ALL ON TABLE "public"."Semestre" TO "authenticated";
GRANT ALL ON TABLE "public"."Semestre" TO "service_role";



GRANT ALL ON TABLE "public"."SolicitudCarta" TO "anon";
GRANT ALL ON TABLE "public"."SolicitudCarta" TO "authenticated";
GRANT ALL ON TABLE "public"."SolicitudCarta" TO "service_role";



GRANT ALL ON TABLE "public"."TipoEvento" TO "anon";
GRANT ALL ON TABLE "public"."TipoEvento" TO "authenticated";
GRANT ALL ON TABLE "public"."TipoEvento" TO "service_role";



GRANT ALL ON SEQUENCE "public"."TipoEvento_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."TipoEvento_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."TipoEvento_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."TipoProyecto" TO "anon";
GRANT ALL ON TABLE "public"."TipoProyecto" TO "authenticated";
GRANT ALL ON TABLE "public"."TipoProyecto" TO "service_role";



GRANT ALL ON SEQUENCE "public"."TipoProyecto_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."TipoProyecto_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."TipoProyecto_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Usuario" TO "anon";
GRANT ALL ON TABLE "public"."Usuario" TO "authenticated";
GRANT ALL ON TABLE "public"."Usuario" TO "service_role";



GRANT ALL ON SEQUENCE "public"."avance_num_avance_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."avance_num_avance_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."avance_num_avance_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."calendario_calendario_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."calendario_calendario_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."calendario_calendario_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categoria_categoria_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categoria_categoria_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categoria_categoria_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."disponibilidad" TO "anon";
GRANT ALL ON TABLE "public"."disponibilidad" TO "authenticated";
GRANT ALL ON TABLE "public"."disponibilidad" TO "service_role";



GRANT ALL ON SEQUENCE "public"."evento_evento_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."evento_evento_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."evento_evento_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."machote_id_machote_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."machote_id_machote_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."machote_id_machote_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."semestre_semestre_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."semestre_semestre_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."semestre_semestre_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."solicitudcarta_id_solicitud_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."solicitudcarta_id_solicitud_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."solicitudcarta_id_solicitud_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";































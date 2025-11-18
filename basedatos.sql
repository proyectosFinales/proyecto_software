-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Acta (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  estudiante_id uuid NOT NULL,
  profesor_id uuid NOT NULL,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  titulo text,
  datos jsonb,
  semestre text,
  machote text,
  CONSTRAINT Acta_pkey PRIMARY KEY (id),
  CONSTRAINT acta_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT acta_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.Profesor(profesor_id)
);
CREATE TABLE public.Anteproyecto (
  id uuid NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  estudiante_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  contexto text NOT NULL,
  justificacion text NOT NULL,
  sintomas text NOT NULL,
  impacto text NOT NULL,
  actividad text,
  comentario text,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  ultima_modificacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  estado USER-DEFINED,
  tipo text,
  departamento text,
  categoria_id integer,
  año bigint,
  semestre bigint,
  CONSTRAINT Anteproyecto_pkey PRIMARY KEY (id),
  CONSTRAINT anteproyecto_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT anteproyecto_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.Empresa(id),
  CONSTRAINT Anteproyecto_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.Categoria(categoria_id)
);
CREATE TABLE public.AnteproyectoContacto (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  anteproyecto_id uuid NOT NULL,
  contacto_id uuid NOT NULL,
  rrhh_id uuid,
  CONSTRAINT AnteproyectoContacto_pkey PRIMARY KEY (id),
  CONSTRAINT anteproyectocontacto_anteproyecto_id_fkey FOREIGN KEY (anteproyecto_id) REFERENCES public.Anteproyecto(id),
  CONSTRAINT anteproyectocontacto_contacto_id_fkey FOREIGN KEY (contacto_id) REFERENCES public.ContactoEmpresa(id),
  CONSTRAINT AnteproyectoContacto_rrhh_id_fkey FOREIGN KEY (rrhh_id) REFERENCES public.ContactoEmpresa(id)
);
CREATE TABLE public.AsignacionesProfesor (
  idProfesor uuid NOT NULL,
  semestre bigint NOT NULL,
  año bigint NOT NULL,
  disponibilidad bigint NOT NULL DEFAULT '0'::bigint,
  asignados bigint NOT NULL DEFAULT '0'::bigint,
  CONSTRAINT AsignacionesProfesor_pkey PRIMARY KEY (idProfesor, semestre, año),
  CONSTRAINT AsignacionesProfesor_idProfesor_fkey FOREIGN KEY (idProfesor) REFERENCES public.Profesor(profesor_id)
);
CREATE TABLE public.Avance (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  num_avance integer NOT NULL DEFAULT nextval('avance_num_avance_seq'::regclass),
  proyecto_id uuid NOT NULL,
  estado USER-DEFINED NOT NULL,
  fecha_avance timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Avance_pkey PRIMARY KEY (id),
  CONSTRAINT Avance_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.Proyecto(id)
);
CREATE TABLE public.Bitacora (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  estudiante_id uuid NOT NULL,
  profesor_id uuid NOT NULL,
  proyecto_id uuid NOT NULL,
  CONSTRAINT Bitacora_pkey PRIMARY KEY (id),
  CONSTRAINT bitacora_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT bitacora_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT Bitacora_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.Proyecto(id)
);
CREATE TABLE public.Calendario (
  calendario_id integer NOT NULL DEFAULT nextval('calendario_calendario_id_seq'::regclass),
  nombre USER-DEFINED NOT NULL UNIQUE,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  CONSTRAINT Calendario_pkey PRIMARY KEY (calendario_id)
);
CREATE TABLE public.Calificacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  proyecto_id uuid,
  profesor_id uuid NOT NULL,
  estudiante_id uuid NOT NULL,
  semestre_id integer NOT NULL,
  score_agilidad smallint NOT NULL CHECK (score_agilidad >= 1 AND score_agilidad <= 5),
  score_empatia smallint NOT NULL CHECK (score_empatia >= 1 AND score_empatia <= 5),
  score_respeto smallint NOT NULL CHECK (score_respeto >= 1 AND score_respeto <= 5),
  score_comunicacion smallint NOT NULL CHECK (score_comunicacion >= 1 AND score_comunicacion <= 5),
  score_aclaracion smallint NOT NULL CHECK (score_aclaracion >= 1 AND score_aclaracion <= 5),
  score_respuestas smallint NOT NULL CHECK (score_respuestas >= 1 AND score_respuestas <= 5),
  score_correccion smallint NOT NULL CHECK (score_correccion >= 1 AND score_correccion <= 5),
  score_explicacion smallint NOT NULL CHECK (score_explicacion >= 1 AND score_explicacion <= 5),
  score_retroalimentacion smallint NOT NULL CHECK (score_retroalimentacion >= 1 AND score_retroalimentacion <= 5),
  recomendacion smallint NOT NULL CHECK (recomendacion >= 0 AND recomendacion <= 10),
  star_rating smallint NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  comentarios text,
  fecha_calificacion timestamp without time zone NOT NULL DEFAULT now(),
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT Calificacion_pkey PRIMARY KEY (id),
  CONSTRAINT Calificacion_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.Proyecto(id),
  CONSTRAINT fk_calificacion_profesor FOREIGN KEY (profesor_id) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT fk_calificacion_estudiante FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT fk_calificacion_semestre FOREIGN KEY (semestre_id) REFERENCES public.Semestre(semestre_id)
);
CREATE TABLE public.Categoria (
  categoria_id integer NOT NULL DEFAULT nextval('categoria_categoria_id_seq'::regclass),
  nombre character varying NOT NULL,
  CONSTRAINT Categoria_pkey PRIMARY KEY (categoria_id)
);
CREATE TABLE public.Cita (
  cita_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tutor uuid,
  lector1 uuid,
  lector2 uuid,
  proyecto_id uuid,
  medio character varying,
  virtual boolean DEFAULT false,
  semestre_id integer,
  estudiante_id uuid UNIQUE,
  disponibilidad_id uuid,
  CONSTRAINT Cita_pkey PRIMARY KEY (cita_id),
  CONSTRAINT cita_lector1_fkey FOREIGN KEY (lector1) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT cita_lector2_fkey FOREIGN KEY (lector2) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT Cita_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.Proyecto(id),
  CONSTRAINT Cita_tutor_fkey FOREIGN KEY (tutor) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT Cita_semestre_id_fkey FOREIGN KEY (semestre_id) REFERENCES public.Semestre(semestre_id),
  CONSTRAINT cita_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT cita_disponibilidad_id_fkey FOREIGN KEY (disponibilidad_id) REFERENCES public.disponibilidad(id)
);
CREATE TABLE public.ContactoEmpresa (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL,
  nombre text NOT NULL,
  departamento text,
  correo text,
  telefono text,
  CONSTRAINT ContactoEmpresa_pkey PRIMARY KEY (id),
  CONSTRAINT contactoempresa_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.Empresa(id)
);
CREATE TABLE public.Correcciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  anteproyecto_id uuid NOT NULL,
  seccion USER-DEFINED NOT NULL,
  contenido text NOT NULL,
  fecha_correccion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  Corregido boolean DEFAULT false,
  CONSTRAINT Correcciones_pkey PRIMARY KEY (id),
  CONSTRAINT correcciones_anteproyecto_id_fkey FOREIGN KEY (anteproyecto_id) REFERENCES public.Anteproyecto(id)
);
CREATE TABLE public.Empresa (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  tipo text NOT NULL,
  provincia text NOT NULL,
  canton text NOT NULL,
  distrito text NOT NULL,
  actividad text,
  CONSTRAINT Empresa_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Entrada (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bitacora_id uuid NOT NULL,
  fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  contenido text NOT NULL,
  aprobada_prof boolean DEFAULT false,
  aprobada_est boolean DEFAULT false,
  CONSTRAINT Entrada_pkey PRIMARY KEY (id),
  CONSTRAINT Entrada_bitacora_id_fkey FOREIGN KEY (bitacora_id) REFERENCES public.Bitacora(id),
  CONSTRAINT Entrada_bitacora_id_fkey1 FOREIGN KEY (bitacora_id) REFERENCES public.Bitacora(id)
);
CREATE TABLE public.Estudiante (
  estudiante_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_usuario uuid NOT NULL,
  carnet text NOT NULL UNIQUE,
  asesor uuid,
  estado USER-DEFINED,
  semestre_id integer,
  situacion_laboral USER-DEFINED,
  anio_ingreso integer,
  CONSTRAINT Estudiante_pkey PRIMARY KEY (estudiante_id),
  CONSTRAINT estudiante_asesor_fkey FOREIGN KEY (asesor) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT Estudiante_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.Usuario(id),
  CONSTRAINT Estudiante_semestre_id_fkey FOREIGN KEY (semestre_id) REFERENCES public.Semestre(semestre_id)
);
CREATE TABLE public.Evento (
  evento_id integer NOT NULL DEFAULT nextval('evento_evento_id_seq'::regclass),
  calendario_id integer NOT NULL,
  descripcion text NOT NULL,
  fecha_inicio timestamp without time zone NOT NULL,
  fecha_fin timestamp without time zone NOT NULL,
  CONSTRAINT Evento_pkey PRIMARY KEY (evento_id),
  CONSTRAINT evento_calendario_id_fkey FOREIGN KEY (calendario_id) REFERENCES public.Calendario(calendario_id)
);
CREATE TABLE public.HistorialReprobacion (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  estudiante_id uuid NOT NULL,
  causa USER-DEFINED NOT NULL,
  semestre USER-DEFINED NOT NULL,
  anio integer NOT NULL,
  detalle text,
  fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT HistorialReprobacion_pkey PRIMARY KEY (id),
  CONSTRAINT historialreprobacion_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id)
);
CREATE TABLE public.Machote (
  id_machote integer NOT NULL DEFAULT nextval('machote_id_machote_seq'::regclass),
  nombre character varying NOT NULL,
  formulario_json jsonb NOT NULL,
  activo boolean DEFAULT true,
  CONSTRAINT Machote_pkey PRIMARY KEY (id_machote)
);
CREATE TABLE public.Profesor (
  profesor_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_usuario uuid NOT NULL,
  cantidad_estudiantes integer DEFAULT 0,
  categoria_id integer,
  estudiantes_libres integer NOT NULL DEFAULT 0,
  ver_calificaciones boolean NOT NULL DEFAULT false,
  CONSTRAINT Profesor_pkey PRIMARY KEY (profesor_id),
  CONSTRAINT Profesor_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.Usuario(id),
  CONSTRAINT Profesor_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.Categoria(categoria_id)
);
CREATE TABLE public.Proyecto (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profesor_id uuid,
  estudiante_id uuid NOT NULL,
  anteproyecto_id uuid NOT NULL,
  estado USER-DEFINED NOT NULL,
  semestre_id integer,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  semestre bigint,
  año bigint,
  CONSTRAINT Proyecto_pkey PRIMARY KEY (id),
  CONSTRAINT Proyecto_anteproyecto_id_fkey FOREIGN KEY (anteproyecto_id) REFERENCES public.Anteproyecto(id),
  CONSTRAINT proyecto_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT proyecto_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT proyecto_semestre_id_fkey FOREIGN KEY (semestre_id) REFERENCES public.Semestre(semestre_id)
);
CREATE TABLE public.Semestre (
  semestre_id integer NOT NULL DEFAULT nextval('semestre_semestre_id_seq'::regclass),
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  nombre text,
  calendario_id integer,
  CONSTRAINT Semestre_pkey PRIMARY KEY (semestre_id),
  CONSTRAINT Semestre_calendario_id_fkey FOREIGN KEY (calendario_id) REFERENCES public.Calendario(calendario_id)
);
CREATE TABLE public.SolicitudCarta (
  id_solicitud integer NOT NULL DEFAULT nextval('solicitudcarta_id_solicitud_seq'::regclass),
  estudiante_id uuid NOT NULL,
  fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  nombre_receptor text,
  puesto_receptor text,
  empresa text,
  genero_emisor text,
  genero_receptor text,
  apellidos_receptor text,
  cedula text,
  idioma text,
  semestre text,
  CONSTRAINT SolicitudCarta_pkey PRIMARY KEY (id_solicitud),
  CONSTRAINT SolicitudCarta_estudiante_id_fkey1 FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id)
);
CREATE TABLE public.TipoEvento (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  CONSTRAINT TipoEvento_pkey PRIMARY KEY (id)
);
CREATE TABLE public.TipoProyecto (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  CONSTRAINT TipoProyecto_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Usuario (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre character varying NOT NULL,
  correo character varying NOT NULL UNIQUE,
  contrasena character varying NOT NULL,
  rol integer NOT NULL CHECK (rol = ANY (ARRAY[1, 2, 3])),
  sede USER-DEFINED NOT NULL,
  telefono character varying,
  recovery_token character varying,
  exp_recuperacion timestamp without time zone,
  provincia text,
  canton text,
  distrito text,
  CONSTRAINT Usuario_pkey PRIMARY KEY (id)
);
CREATE TABLE public.disponibilidad (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profesor_id uuid NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL,
  dia date NOT NULL,
  CONSTRAINT disponibilidad_pkey PRIMARY KEY (id),
  CONSTRAINT disponibilidad_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT Disponibilidad_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.Profesor(profesor_id)
);
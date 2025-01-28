import React, { useState, useEffect } from 'react';
import { Page, Text, Image, Document, StyleSheet, View } from "@react-pdf/renderer";
import {Font} from '@react-pdf/renderer';
import Cambria from './Font/Cambria-Font-For-Windows.ttf';

Font.register({
    family: 'Cambria',
    src: Cambria
  })

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 34,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  text: {
    margin: 12,
    fontSize: 11,
    textAlign: "justify",
    fontFamily: "Cambria",
  },
  date: {
    margin: 12,
    fontSize: 11,
    textAlign: "right",
    fontFamily: "Cambria",
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
});

const Carta = (solicitud) => {

    const [generoR, setGeneroR] = useState('');
    const [generoE1, setGeneroE1] = useState('');
    const [generoE2, setGeneroE2] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [carnet, setCarnet] = useState('');
    const [estudiante, setEstudiante] = useState('');
    const [provincia, setProvincia] = useState('');

    useEffect(() => {
        setData();
    }, []);

    function setData(){
        const today = new Date();
        setDay(today.getDate());
        setMonth(today.toLocaleString('es-ES', { month: 'long' }));
        setYear(today.getFullYear());
        setCarnet(solicitud.solicitud.Estudiante.carnet);
        setEstudiante(solicitud.solicitud.Estudiante.Usuario.nombre);
        if(solicitud.solicitud.genero_emisor == "Masculino" || solicitud.solicitud.genero_emisor == "Neutral"){
            setGeneroE1("el");
            setGeneroE2("activo");
        }
        else{
            setGeneroE1("la");
            setGeneroE2("activa");
        }
        if(solicitud.solicitud.genero_receptor == "Señor"){
            setGeneroR("Estimado");
        }
        else{
            setGeneroR("Estimada");
        }
        if(solicitud.solicitud.Estudiante.Usuario.sede == "Central Cartago"){
            setProvincia("Cartago");
        }
        else if(solicitud.solicitud.Estudiante.Usuario.sede == "Local San José"){
            setProvincia("San José");
        }
        else if(solicitud.solicitud.Estudiante.Usuario.sede == "Centro Académico de Limón"){
            setProvincia("Limón");
        }
        else{
            setProvincia("Alajuela");
        }
    }

    return(
    <Document>
        <Page style={styles.body}>
        <Text style={styles.date}>
            {provincia}, {day} de {month} de {year}. 
        </Text>
        <Text style={styles.text}>
            {solicitud.solicitud.genero_receptor}{`\n`}
            {solicitud.solicitud.nombre_receptor} {solicitud.solicitud.apellidos_receptor}{`\n`}
            {solicitud.solicitud.puesto_receptor}{`\n`}
            {solicitud.solicitud.empresa}
        </Text>
        <Text style={styles.text}>
            {generoR} {solicitud.solicitud.nombre_receptor}: 
        </Text>
        <Text style={styles.text}>
            Nos complace manifestarle que, dentro del programa de estudios de Licenciatura en Ingeniería en Producción 
            Industrial, acreditado por la Agencia de Acreditación de programas de Ingeniería y Arquitectura (AAPIA) 13 
            semanas, los estudiantes realizan un Proyecto con dedicación de tiempo completo (40 horas/semana) en una 
            empresa de manufactura o de servicios.
        </Text>
        <Text style={styles.text}>
            Durante el semestre académico {generoE1} estudiante de proyecto de graduación es asesorado por un(a) profesional de 
            nuestra Escuela, quien visita la empresa para orientarle. Claramente, tanto el Asesor como {generoE1} Estudiante se 
            comprometen a mantener la más absoluta confidencialidad sobre los alcances de este proyecto, como de toda 
            la información que al respecto recabe {generoE1} estudiante en relación con negocios de la empresa y clientes.
        </Text>
        <Text style={styles.text}>
            En esta oportunidad agradeceremos se sirva acoger la solicitud de {estudiante}, carnet: {carnet}, cédula: {solicitud.solicitud.cedula}, estudiante {generoE2} de nuestro Programa de Licenciatura, quien requiere 
            realizar el Proyecto Final de Graduación a partir del {solicitud.solicitud.semestre} semestre {year} salvo acuerdo entre ambas partes 
            (empresa y estudiante) para iniciar antes de dicha fecha como parte del proceso de inducción y otras 
            necesidades identificadas por la empresa. Está de más indicar que a partir de ese momento, {generoE1} estudiante deberá 
            ajustarse a los principios y exigencias éticas y de conducta de su empresa. 
        </Text>
        <Text style={styles.text}>
            Conviene apuntar que nuestra institución insta respetuosamente a la organización que acoge al estudiante, a 
            proporcionar una ayuda económica (subsidio) para cubrir gastos tales como transporte y alimentación, monto 
            que está sujeto a negociación exclusiva entre las partes (empresa y estudiante). Lo anterior no demerita el 
            carácter gratuito de esta relación en razón de la cual el ITCR no recibe pago alguno proveniente de las empresas 
            donde sus estudiantes realizan sus Proyectos de Graduación, como {generoE1} estudiante tampoco percibe un salario 
            dada la inexistencia de una relación laboral (priva un deseo de formación académica y profesional, totalmente 
            desligado de las exigencias y demandas de producción y desempeño características de una relación laboral), 
            situación que tampoco da pie a ninguna de las partes para pretender derechos indemnizatorios al finalizar el 
            proyecto respectivo.
        </Text>
        <Text style={styles.text}>
            Es importante agregar que {generoE1} estudiante está cubierto por la póliza (01-03-EUM-1-07) que el ITCR suscribe con 
            el Instituto Nacional de Seguros (INS), bajo la modalidad presencial, teletrabajo o una combinación de ambos.
        </Text>
        <Text style={styles.text}>
            Atentamente
        </Text>
        <Text style={styles.text}>
            Ing. Biljhana Farah Guzman, MEng.{`\n`}
            Coordinadora Programa de Trabajo Final de Graduación{`\n`}
            Escuela Ingeniería en Producción Industrial{`\n`}
            Instituto Tecnológico de Costa Rica (TEC){`\n`}
            Tel. 8828-0547 e-mail: bguzman@itcr.ac.cr 
        </Text>
        </Page>
    </Document>
    )
};

export default Carta;
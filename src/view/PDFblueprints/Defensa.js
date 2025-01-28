import React, { useState, useEffect } from 'react';
import { Page, Text, Image, Document, StyleSheet, View } from "@react-pdf/renderer";
import {Font} from '@react-pdf/renderer';
import Logo from "./logoTec.jpg"
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
    margin: 8,
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
    fontFamily: "Cambria",
  },
  footer: {
    fontSize: 11,
    marginTop: 60,
    textAlign: "center",
  },
  signingRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
  },
  signingSpace: {
    width: "40%",
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    width: "100%",
    marginBottom: 0,
  },
  name: {
    fontSize: 11,
    textAlign: "left",
    fontFamily: "Cambria",
  },
});

const Carta = (solicitud) => {

    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [estudiante, setEstudiante] = useState('');
    const [profesor, setProfesor] = useState('');
    const [titulo, setTitulo] = useState('');
    const [aprobado, setAprobado] = useState('');
    const [correccion, setCorreccion] = useState('');
    const [reprobado, setReprobado] = useState('');
    const [dias, setDias] = useState('');
    const [razon, setRazon] = useState('');
    const [nota, setNota] = useState('');
    const [persona1, setPersona1] = useState('');
    const [persona2, setPersona2] = useState('');
    const [sede, setSede] = useState('');


    useEffect(() => {
        setData();
    }, []);

    function setData(){
        const today = new Date();
        setDay(today.getDate());
        setMonth(today.toLocaleString('es-ES', { month: 'long' }));
        setYear(today.getFullYear());
        setEstudiante(solicitud.solicitud.Estudiante.Usuario.nombre);
        setProfesor(solicitud.solicitud.Profesor.Usuario.nombre);
        setTitulo(solicitud.solicitud.titulo);
        setDias(solicitud.solicitud.datos.dias);
        setNota(solicitud.solicitud.datos.nota);
        setPersona1(solicitud.solicitud.datos.persona1);
        setPersona2(solicitud.solicitud.datos.persona2);
        if(solicitud.solicitud.datos.aprobacion == "Aprobado"){
            setAprobado("x");
            setCorreccion(" ");
            setReprobado(" ");
        }
        else if(solicitud.solicitud.datos.aprobacion == "Correccion"){
          setAprobado(" ");
          setCorreccion("x");
          setReprobado(" ");
        }
        else{
          setAprobado(" ");
          setCorreccion(" ");
          setReprobado("x");
        }
        if(solicitud.solicitud.datos.razon == ""){
          setRazon(`\n\n\n\n\n`);
        }
        else{
          setRazon(solicitud.solicitud.datos.razon);
        }
        if(solicitud.solicitud.Profesor.Usuario.sede == "Central Cartago"){
          setSede("Cartago");
        }
        else if(solicitud.solicitud.Profesor.Usuario.sede == "Local San José"){
          setSede("San José");
        }
        else if(solicitud.solicitud.Profesor.Usuario.sede == "Centro Académico de Limón"){
          setSede("Limón");
        }
        else{
          setSede("Alajuela");
        }
    }

    return(
    <Document>
        <Page style={styles.body}>
        <Image src={Logo} style={{ width: '40%', height: 'auto' , textAlign: "center", display: 'block', margin: '0 auto',}} />
        <Text style={styles.header}>
          INSTITUTO TECNOLÓGICO DE COSTA RICA{`\n`}
          ESCUELA DE INGENIERÍA EN PRODUCCIÓN INDUSTRIAL{`\n`}
          Acta de Defensa Pública{`\n`}
          Trabajo Final de Graduación
        </Text>
        <Text style={styles.text}>
          Se hace constar que el Trabajo de Proyecto de Graduación presentado por: {estudiante}, titulado {titulo}, cumple 
          con las regulaciones y requisitos establecidos en el 
          Reglamento General de Trabajo Final de Graduación, para optar por el grado de Licenciatura en 
          Ingeniería en Producción Industrial.
        </Text>
        <Text style={styles.text}>
          Además, se acuerda que el documento se ha declarado:
        </Text>
        <Text style={styles.text}>
          ({aprobado}) Aprobado. (No está sujeto a modificaciones) (Artículo 21, inciso i.1).
        </Text>
        <Text style={styles.text}>
          ({correccion}) Aprobado sujeto a modificaciones. Para dichas modificaciones la persona estudiante cuenta con {dias} días hábiles para la presentación a los miembros del Jurado Examinador. Si la persona estudiante 
          no entrega las correcciones o no son aprobadas por los miembros del tribunal, pierde automáticamente el TFG, 
          asignándose una nota final igual a 60. (Artículo 21, inciso i.2).
        </Text>
        <Text style={styles.text}>
          ({reprobado}) Reprobado. (No cumple con los elementos mínimos necesarios que debe contener un proyecto de graduación), 
          (Artículo 21, inciso i.3)
        </Text>
        <Text style={styles.text}>
          Los motivos principales por los que el trabajo queda reprobado son los siguientes:{`\n`}
          {razon}
        </Text>
        <Text style={styles.text}>
          La nota correspondiente a la defensa pública es de: {nota}
        </Text>
        <Text style={styles.text}>
          Firmando conforme:{`\n`}
        </Text>
        <View style={styles.signingRow}>
          <View style={styles.signingSpace}>
            <View style={styles.line} />
            <Text style={styles.name}>
              Ing. {persona1}{`\n`}
              Miembro del Tribunal
            </Text>
            
          </View>
          <View style={styles.signingSpace}>
            <View style={styles.line} />
            <Text style={styles.name}>
              Ing. {persona2}{`\n`}
              Miembro del Tribunal
            </Text>
          </View>
        </View>
        <View style={styles.signingRow}>
          <View style={styles.signingSpace}>
            <View style={styles.line} />
            <Text style={styles.name}>
              Ing. {profesor}{`\n`}
              Profesor (a) Asesor (a)
            </Text>
            
          </View>
          <View style={styles.signingSpace}>
            <View style={styles.line} />
            <Text style={styles.name}>
              {estudiante}{`\n`}
              Estudiante
            </Text>
          </View>
        </View>
        <Text style={styles.footer}>
          Sede {sede}, {day} de {month} del {year}
        </Text>
        </Page>
    </Document>
    )
};

export default Carta;
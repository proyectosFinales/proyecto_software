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
  option: {
    fontSize: 11,
    textAlign: "center",
    fontFamily: "Cambria",
  },
});

const Entrega = (solicitud) => {

    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [estudiante, setEstudiante] = useState('');
    const [profesor, setProfesor] = useState('');
    const [titulo, setTitulo] = useState('');
    const [persona1, setPersona1] = useState('');
    const [persona2, setPersona2] = useState('');
    const [sede, setSede] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [semestre, setSemestre] = useState('');
    const [publico, setPublico] = useState('');
    const [confidencial, setConfidencial] = useState('');
    const [lugar, setLugar] = useState('');
    const [carnet, setCarnet] = useState('');

    useEffect(() => {
        setData();
    }, []);

    function setData(){
        const today = new Date();
        setDay(today.getDate());
        setMonth(today.toLocaleString('es-ES', { month: 'long' }));
        setYear(today.getFullYear());
        setEstudiante(solicitud.solicitud.Estudiante.Usuario.nombre);
        setCarnet(solicitud.solicitud.Estudiante.carnet);
        setProfesor(solicitud.solicitud.Profesor.Usuario.nombre);
        setTitulo(solicitud.solicitud.titulo);
        setPersona1(solicitud.solicitud.datos.persona1);
        setPersona2(solicitud.solicitud.datos.persona2);
        setSemestre(solicitud.solicitud.semestre);
        setLugar(solicitud.solicitud.datos.lugar);
        setEmpresa(solicitud.solicitud.Estudiante.Anteproyecto[0].Empresa.nombre);
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
          ACTA DE ENTREGA DEL INFORME FINAL {`\n`}
          DE LA PRÁCTICA PROFESIONAL{`\n`}
        </Text>
        <Text style={styles.text}>
          Se certifica que se ha recibido el Informe Final de la Práctica Profesional, realizada por el(la) 
          estudiante {estudiante}, carné {carnet}, la cual se titula: “{titulo}” y 
          que se realizó en {lugar}, el {semestre} Semestre de {year}. 
        </Text>
        <Text style={styles.text}>
          La Práctica Profesional es un requisito académico del Programa de Licenciatura en Ingeniería en 
          Producción Industrial del Instituto Tecnológico de Costa Rica.  
        </Text>
        <Text style={styles.text}>
          La supervisión y orientación del trabajo realizado por el estudiante, estuvo a cargo del 
          profesor(a) {profesor}.    
        </Text>
        <Text style={styles.text}>
          {`\n\n\n\n`}
        </Text>
        <View style={styles.signingRow}>
          <View style={styles.signingSpace}>
            <View style={styles.line} />
            <Text style={styles.name}>
              Ing. {profesor}{`\n`}
              Profesor(a) asesor(a)
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
        <View style={styles.signingRow}>
          <View style={styles.signingSpace}>
            <View style={styles.line} />
            <Text style={styles.name}>
              Ing. {persona1}{`\n`}
              Coordinador(a) Programa Vinculación Empresarial 
            </Text>
            
          </View>
          <View style={styles.signingSpace}>
            <View style={styles.line} />
            <Text style={styles.name}>
              Ing. {persona2}{`\n`}
              Director(a) Escuela de Ingeniería en Producción Industrial
            </Text>
          </View>
        </View>
        <Text style={styles.footer}>
          {sede}, {day} de {month} del {year}
        </Text>
        </Page>
    </Document>
    )
};

export default Entrega;
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
    marginBottom: 5,
  },
  name: {
    fontSize: 12,
    textAlign: "left",
    fontFamily: "Cambria",
  },
  suffix: {
    fontSize: 8,
    verticalAlign: "super",
  },
});

const Letter = (solicitud) => {

    const [generoR, setGeneroR] = useState('');
    const [generoE1, setGeneroE1] = useState('');
    const [generoE2, setGeneroE2] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [carnet, setCarnet] = useState('');
    const [estudiante, setEstudiante] = useState('');
    const [suffix, setSuffix] = useState('');
    const [semestre, setSemestre] = useState('');

    useEffect(() => {
        setData();
    }, []);

    function setData(){
        const today = new Date();
        setDay(today.getDate());
        setMonth(today.toLocaleString('en-US', { month: 'long' }));
        setYear(today.getFullYear());
        const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                 (day % 10 === 2 && day !== 12) ? "nd" :
                 (day % 10 === 3 && day !== 13) ? "rd" : "th";
        setSuffix(suffix);
        setCarnet(solicitud.solicitud.Estudiante.carnet);
        setEstudiante(solicitud.solicitud.Estudiante.Usuario.nombre);
        setGeneroE1("the");
        setGeneroE2("activa");
        if(solicitud.solicitud.genero_receptor == "Señor"){
            setGeneroR("Mr");
        }
        else{
            setGeneroR("Ms");
        }
        if(solicitud.solicitud.semestre == "I"){
          setSemestre("first");
        }
        else{
          setSemestre("second");
        }
    }

    return(
    <Document>
        <Page style={styles.body}>
          <Text style={styles.date}>
              {month} {day} <Text style={styles.suffix}>{suffix}</Text>, {year}. 
          </Text>
          <Text style={styles.text}>
              {generoR} {solicitud.solicitud.nombre_receptor} {solicitud.solicitud.apellidos_receptor}{`\n`}
              {solicitud.solicitud.puesto_receptor}{`\n`}
              {solicitud.solicitud.empresa}
          </Text>
          <Text style={styles.text}>
              Dear {generoR} {solicitud.solicitud.nombre_receptor}: 
          </Text>
          <Text style={styles.text}>
            With great joy, we would like to communicate that as requisite to obtain the Licenciatura degree in Industrial 
            Production Engineering, a program accredited by AAPIA, our students must complete a capstone project in 13 
            weeks, with a partial dedication of 40 hours on a weekly basis in a service or manufacturing company. 
          </Text>
          <Text style={styles.text}>
            During the academic semester, the student will be assisted by a professor from the Industrial Production 
            Engineering School, who will be visiting the company for further support to the student. Thus, the student and 
            the professor are committed to keep the required confidentiality about products, process, and any information 
            given related to the company and its clients. 
          </Text>
          <Text style={styles.text}>
            This time, we highly appreciate your support for {estudiante}, ID {solicitud.solicitud.cedula}, who is 
            currently a student at our school, and is requiring developing the capstone project during the {semestre} semester 
            of {year}. The start date can be modified based on the company´s requirements for orientation or other related 
            activities. Nonetheless, the student will be role modeling the code of conduct required by our school and the 
            company. 
          </Text>
          <Text style={styles.text}>
            It is important to mention, that we kindly suggest considering a subsidy for the student, to cover expenses 
            related to travel and meals. This subsidy is an agreement between the student and the company, exclusively. 
            This subsidy does not debunk the nature of this requisite, in which ITCR does not perceive any income resulting 
            from the capstone project request, nor the fact that the subsidy does not represent an employer-employee 
            relationship between the company and the student during the length of the capstone project (the ultimate goal 
            for the capstone project is academic and professional development for the student before graduating from our 
            engineering program). This academic relationship between the company and the student does not obligate the 
            parts (ITCR, student and/or company) to any kind of compensation at the end of the capstone project.  
          </Text>
          <Text style={styles.text}>
            Finally, we want to highlight that our student is covered by insurance (01-03-EUM-1-07), previously acquired 
            by ITCR and INS, including on-site, virtual or hybrid working mode. 
          </Text>
          <Text style={styles.text}>
            Best Regards, 
          </Text>
          <Text style={styles.text}>
            Eng. Biljhana Farah Guzman, MEng.{`\n`}
            Capstone Project Coordination{`\n`}
            Industrial Production Engineering School.{`\n`}
            Instituto Tecnológico de Costa Rica (ITCR){`\n`}
            Phone. 8828-0547 e-mail: bguzman@itcr.ac.cr 
          </Text>
        </Page>
    </Document>
    )
};

export default Letter;
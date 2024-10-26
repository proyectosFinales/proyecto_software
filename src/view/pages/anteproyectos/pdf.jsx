import { Document, Page, Text, View, PDFDownloadLink, StyleSheet } from "@react-pdf/renderer";
import Button from "../../components/button";

const GenerarPDFAnteproyecto = ({ anteproyecto }) => {
    return <>
        <PDFDownloadLink
            document={<PDFAnteproyecto anteproyecto={anteproyecto}/>}
            fileName={`${anteproyecto.nombreEmpresa}.pdf`}
        >
            <Button>Reporte</Button>
        </PDFDownloadLink>
    </>;
}

const PDFAnteproyecto = ({ anteproyecto }) => {
    return <>
        <Document>
            <Page style={styles.page}>
                <Text style={styles.title}>Anteproyecto</Text>
                <LabelTextPDF label="Nombre:" text={anteproyecto.nombreEmpresa}/>
                <LabelTextPDF label="Estudiante:" text={anteproyecto.estudiante?.nombre}/>
            </Page>
        </Document>
    </>;
}

const LabelTextPDF = ({ label, text }) => <>
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.text}>{text}</Text>
    </View>
</>;

const styles = StyleSheet.create({
    page: {
        margin: 20
    },
    row: {
        flexDirection: "row",
        gap: "5px",
        marginBottom: "7px"
    },
    title: {
        fontSize: 20,
        color: "#5b9bd5",
        marginBottom: "10px"
    },
    label: {
        fontSize: 12
    },
    text: {
        fontSize: 12
    }
});

export default GenerarPDFAnteproyecto;
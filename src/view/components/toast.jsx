/*Toast.jsx */
import { ToastContainer as ToastModule, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastProperties = {
	position: "bottom-right",
	autoClose: 5000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	progress: undefined,
	theme: "dark"
};

const loadToast = (promise, load, success, error) => 
  toast.promise(promise, {
    pending: load,
    success: success,
    error: error
  }, { ...toastProperties });

const successToast = (message) => {
  toast.success(message, { ...toastProperties });
};

const errorToast = (message) => {
  toast.error(message, { ...toastProperties });
};

const infoToast = (message) => {
  toast.info(message, { ...toastProperties });
};

const darkToast = (message) => {
  toast.dark(message, { ...toastProperties });
};

const hideToast = () => toast.dismiss();

const ToastContainer = () => <ToastModule/>;

export {
	successToast,
	errorToast,
	darkToast,
	loadToast,
	infoToast,
	hideToast
};

export default ToastContainer;

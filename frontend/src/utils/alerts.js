import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const showSuccessToast = (message) => {
  Toast.fire({
    icon: 'success',
    title: message
  });
};

export const showErrorToast = (message) => {
  Toast.fire({
    icon: 'error',
    title: message
  });
};

export const showAlert = (title, text, icon = 'info') => {
  return MySwal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#3085d6',
  });
};
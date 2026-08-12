import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// SweetAlert2 wrapper with premium dark/neon theme styling matching the site
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  background: "#111827",
  color: "#E0F0E8",
  customClass: {
    popup: "border border-[#39FF14]/30 rounded-xl shadow-lg",
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const CustomSwal = Swal.mixin({
  background: "#111827",
  color: "#E0F0E8",
  confirmButtonColor: "#39FF14",
  cancelButtonColor: "#FF00FF",
  customClass: {
    popup: "border border-[#39FF14]/30 rounded-2xl shadow-2xl",
    title: "text-white font-bold",
    htmlContainer: "text-[#7DCEA0]",
    confirmButton: "text-[#0A0E1A] font-semibold px-4 py-2 rounded-lg cursor-pointer",
    cancelButton: "text-white font-semibold px-4 py-2 rounded-lg cursor-pointer",
  },
});

export const alertHelper = {
  success(title, text = "", toast = true) {
    if (toast) {
      Toast.fire({
        icon: "success",
        title: title + (text ? `: ${text}` : ""),
      });
    } else {
      CustomSwal.fire({ icon: "success", title, text });
    }
  },
  error(title, text = "", toast = false) {
    if (toast) {
      Toast.fire({
        icon: "error",
        title: title + (text ? `: ${text}` : ""),
      });
    } else {
      CustomSwal.fire({ icon: "error", title, text });
    }
  },
  confirm(title, text = "") {
    return CustomSwal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "確定",
      cancelButtonText: "取消",
    }).then((result) => result.isConfirmed);
  },

  prompt(title, { inputPlaceholder = "", inputValue = "" } = {}) {
    return CustomSwal.fire({
      title,
      input: "text",
      inputPlaceholder,
      inputValue,
      showCancelButton: true,
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      inputValidator: (value) => {
        if (!value || !value.trim()) return "請輸入名稱";
      },
    }).then((result) =>
      result.isConfirmed ? result.value.trim() : null
    );
  },
};

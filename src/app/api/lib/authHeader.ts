import { toast } from "sonner";

export function getAuthHeader() {
  const token = localStorage.getItem("gb_token");

  if (!token) {
    toast.error("Sessão inválida ou expirada. Faça login novamente.");
    window.location.href = "/login";
    throw new Error("Token inválido ou ausente");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

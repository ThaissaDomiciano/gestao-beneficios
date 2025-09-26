import { toast } from "sonner";

export function getAuthHeader(opts?: { withJsonBody?: boolean }) {
  const token = localStorage.getItem("gb_token");
  if (!token) {
    toast.error("Sessão inválida ou expirada. Faça login novamente.");
    window.location.href = "/login";
    throw new Error("Token inválido ou ausente");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  if (opts?.withJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

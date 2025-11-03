export const formatarTexto = (texto: string): string => {
  return texto
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

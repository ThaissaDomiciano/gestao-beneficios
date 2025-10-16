export type Dependente = { 
    id: string; 
    nome: string 
};

export type Colaborador = {
    id: string; 
    nome: string; 
    matricula: string; 
    dtNascimento: string;
    funcao: string; 
    genero: string; 
    cidade: string; 
    dependentes: Dependente[];
};

export type Especialidade = { 
    id: string; 
    nome: string 
};

export type Disponibilidade = { 
    id: string; 
    dia: number 
};

export type Medico = {
  id: string; 
  nome: string; 
  email: string; especialidade: Especialidade;
  disponibilidade: Disponibilidade[]; horaEntrada: string; horaPausa: string;
  horaVolta: string; horaSaida: string;
};

export type Agendamento = {
  idAgendamento: string;
  colaborador: Colaborador;
  dependente: Dependente | null;
  medico: Medico;
  horario: string;
  status: "AGENDADO" | "CANCELADO" | "REALIZADO";
};

export type Beneficio = { 
  id: string; 
  nome: string; 
  descricao: string; 
  percentualDesconto: number; 
};

export type Solicitacao = {
  id: string;
  colaborador: Colaborador;
  dependente: Dependente | null;
  beneficio: Beneficio;
  valorTotal: number;
  desconto: number;
  descricao: string;
  qtdeParcelas: number;
  dataSolicitacao: string;
  tipoPagamento: "DESCONTADO_FOLHA" | "PAGAMENTO_UNICO" | "PAGAMENTO_PROPRIO";
  status:  "APROVADA" | "REJEITADA" | "CANCELADA" | "PENDENTE" | "PENDENTE_ASSINATURA";
};

export type Documento = {
  nomeArquivoUnico: string;
  nomeArquivoOriginal: string;
  tamanho: number;
  dataUpload: string;
  contentType: string;
  tipoDocumento?: string;
  dataAssinatura?: string | null;
};


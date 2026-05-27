"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";

const botoesPonto = [
  {
    tipo: "ENTRADA",
    label: "Entrada",
    cor: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100",
    badge: "bg-emerald-50 text-emerald-700",
  },
  {
    tipo: "SAIDA_ALMOCO",
    label: "Saída Almoço",
    cor: "bg-orange-500 hover:bg-orange-600 shadow-orange-100",
    badge: "bg-orange-50 text-orange-700",
  },
  {
    tipo: "VOLTA_ALMOCO",
    label: "Volta Almoço",
    cor: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
    badge: "bg-blue-50 text-blue-700",
  },
  {
    tipo: "SAIDA",
    label: "Saída",
    cor: "bg-red-600 hover:bg-red-700 shadow-red-100",
    badge: "bg-red-50 text-red-700",
  },
];

function formatarData(data) {
  if (!data) return "-";

  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatarHora(hora) {
  if (!hora) return "-";

  return hora.slice(0, 5);
}

export default function RegistroPontoPage() {
  const [tempo, setTempo] = useState(new Date());
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioId, setFuncionarioId] = useState("");
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTempo(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function carregarFuncionarios() {
      setIsLoading(true);

      try {
        const response = await api.get("/funcionarios/listar");
        const lista = response.data || [];

        setFuncionarios(lista);

        if (lista.length > 0) {
          setFuncionarioId(String(lista[0].id));
        }
      } catch (error) {
        toast.error("Erro ao buscar funcionários.");
      } finally {
        setIsLoading(false);
      }
    }

    carregarFuncionarios();
  }, []);

  async function carregarHistorico(id) {
    if (!id) {
      setRegistros([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.get(`/pontos/funcionario/${id}`);
      setRegistros(response.data || []);
    } catch (error) {
      toast.error("Erro ao buscar histórico de ponto.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function buscarHistoricoAtual() {
      await carregarHistorico(funcionarioId);
    }

    buscarHistoricoAtual();
  }, [funcionarioId]);

  async function registrarPonto(tipo) {
    if (!funcionarioId) {
      toast.error("Selecione um funcionário.");
      return;
    }

    setIsSaving(true);

    try {
      await api.post(`/pontos/funcionario/${funcionarioId}/registrar/${tipo}`);
      await carregarHistorico(funcionarioId);
      toast.success("Ponto registrado com sucesso!");
    } catch (error) {
      const mensagem =
        error?.response?.data?.mensagem ||
        error?.response?.data?.message ||
        "Erro ao registrar ponto.";

      toast.error(mensagem);
    } finally {
      setIsSaving(false);
    }
  }

  const historico = useMemo(() => {
    return registros.flatMap((registro) => {
      const eventos = [
        {
          data: registro.data,
          tipo: "Entrada",
          horario: registro.horaEntrada,
          cor: botoesPonto[0].badge,
        },
        {
          data: registro.data,
          tipo: "Saída Almoço",
          horario: registro.horaSaidaAlmoco,
          cor: botoesPonto[1].badge,
        },
        {
          data: registro.data,
          tipo: "Volta Almoço",
          horario: registro.horaVoltaAlmoco,
          cor: botoesPonto[2].badge,
        },
        {
          data: registro.data,
          tipo: "Saída",
          horario: registro.horaSaida,
          cor: botoesPonto[3].badge,
        },
      ];

      return eventos.filter((evento) => evento.horario);
    });
  }, [registros]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Registro de Ponto</h1>
        <p className="text-gray-500">Controle de horários</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <Clock size={20} />
            <span className="font-medium">Registrar Ponto</span>
          </div>

          <div className="mb-8">
            <h2 className="text-6xl font-black text-gray-800 tracking-tight">
              {tempo.toLocaleTimeString("pt-BR")}
            </h2>
            <p className="text-gray-400 mt-2 capitalize">
              {tempo.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-3">
            <UserRound size={18} className="text-gray-400" />
            <select
              value={funcionarioId}
              onChange={(event) => setFuncionarioId(event.target.value)}
              className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isLoading || isSaving}
            >
              <option value="">Selecione um funcionário</option>
              {funcionarios.map((funcionario) => (
                <option key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {botoesPonto.map((botao) => (
              <button
                key={botao.tipo}
                onClick={() => registrarPonto(botao.tipo)}
                disabled={isLoading || isSaving || !funcionarioId}
                className={`${botao.cor} text-white py-3 rounded-xl font-bold transition-all shadow-md disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSaving ? (
                  <Loader2 size={20} className="mx-auto animate-spin" />
                ) : (
                  botao.label
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">Histórico de Registros</h3>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[11px] uppercase text-gray-400 font-semibold">
              <tr>
                <th className="px-8 py-4">Data</th>
                <th className="px-8 py-4 text-center">Tipo</th>
                <th className="px-8 py-4 text-right">Horário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="px-8 py-10 text-center">
                    <Loader2
                      size={28}
                      className="mx-auto mb-2 animate-spin text-orange-500"
                    />
                    <span className="font-medium text-gray-500">
                      Carregando registros...
                    </span>
                  </td>
                </tr>
              ) : historico.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-8 py-10 text-center text-gray-500"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                historico.map((item, index) => (
                  <tr
                    key={`${item.data}-${item.tipo}-${index}`}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-4 text-gray-600 font-medium">
                      {formatarData(item.data)}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span
                        className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${item.cor}`}
                      >
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right text-gray-800 font-bold">
                      {formatarHora(item.horario)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";

const hoje = new Date();
const seteDiasAtras = new Date(hoje);
seteDiasAtras.setDate(hoje.getDate() - 6);

const formatarDataInput = (data) => data.toISOString().slice(0, 10);

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarNumero = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

function BarrasPorProduto({ dados }) {
  const maior = Math.max(...dados.map((item) => item.total), 1);

  return (
    <div className="space-y-4">
      {dados.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          Nenhum produto vendido no periodo.
        </p>
      ) : (
        dados.map((item) => (
          <div key={item.produtoId}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-bold text-gray-700 truncate pr-3">
                {item.nome}
              </span>
              <span className="text-gray-500">{formatarMoeda(item.total)}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-600 rounded-full"
                style={{ width: `${Math.max((item.total / maior) * 100, 4)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formatarNumero(item.quantidade)} unidade(s)
            </p>
          </div>
        ))
      )}
    </div>
  );
}

function GraficoPorDia({ dados }) {
  const largura = 720;
  const altura = 240;
  const padding = 28;
  const maior = Math.max(...dados.map((item) => item.total), 1);
  const pontos = dados.map((item, index) => {
    const x =
      dados.length === 1
        ? largura / 2
        : padding + (index * (largura - padding * 2)) / (dados.length - 1);
    const y = altura - padding - (item.total / maior) * (altura - padding * 2);
    return { ...item, x, y };
  });
  const linha = pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(" ");

  if (dados.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Nenhuma venda encontrada para o filtro.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full h-64">
      <line
        x1={padding}
        y1={altura - padding}
        x2={largura - padding}
        y2={altura - padding}
        stroke="#e5e7eb"
      />
      <polyline
        points={linha}
        fill="none"
        stroke="#ea580c"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pontos.map((ponto) => (
        <g key={ponto.data}>
          <circle cx={ponto.x} cy={ponto.y} r="5" fill="#ea580c" />
          <text
            x={ponto.x}
            y={ponto.y - 12}
            textAnchor="middle"
            className="fill-gray-500 text-[11px] font-bold"
          >
            {formatarMoeda(ponto.total)}
          </text>
          <text
            x={ponto.x}
            y={altura - 8}
            textAnchor="middle"
            className="fill-gray-400 text-[10px]"
          >
            {ponto.data.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function RelatoriosPage() {
  const [inicio, setInicio] = useState(formatarDataInput(seteDiasAtras));
  const [fim, setFim] = useState(formatarDataInput(hoje));
  const [produtoId, setProdutoId] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [tempoResposta, setTempoResposta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function carregarProdutos() {
    try {
      const response = await api.get("/produtos");
      setProdutos(response.data);
    } catch (error) {
      toast.error("Erro ao carregar produtos.");
    }
  }

  async function carregarRelatorio() {
    setIsLoading(true);
    // eslint-disable-next-line react-hooks/purity
    const inicioTempo = performance.now();

    try {
      const params = { inicio, fim };
      if (produtoId) params.produtoId = produtoId;

      const relatorioResponse = await api.get("/relatorios", { params });

      setRelatorio(relatorioResponse.data);
      // eslint-disable-next-line react-hooks/purity
      setTempoResposta(performance.now() - inicioTempo);
    } catch (error) {
      toast.error("Erro ao carregar relatorio.");
    } finally {
      setIsLoading(false);
    }
  }

  async function marcarDividaComoPaga(dividaId) {
    try {
      await api.patch(`/dividas/${dividaId}/pagar`);
      toast.success("Venda fiada marcada como paga.");
      await carregarRelatorio();
    } catch (error) {
      toast.error("Erro ao baixar venda fiada.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarProdutos();
    carregarRelatorio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalDividas = useMemo(
    () =>
      relatorio?.dividas?.reduce(
        (total, divida) =>
          divida.paga ? total : total + Number(divida.valor || 0),
        0,
      ) || 0,
    [relatorio],
  );

  const dividasPendentes = useMemo(
    () => (relatorio?.dividas || []).filter((divida) => !divida.paga),
    [relatorio],
  );

  const cards = [
    {
      titulo: "Total vendido",
      valor: formatarMoeda(relatorio?.totalVendido),
      icon: DollarSign,
      cor: "text-emerald-600 bg-emerald-50",
    },
    {
      titulo: "Vendas",
      valor: formatarNumero(relatorio?.quantidadeVendas),
      icon: ShoppingBag,
      cor: "text-blue-600 bg-blue-50",
    },
    {
      titulo: "Itens vendidos",
      valor: formatarNumero(relatorio?.quantidadeItens),
      icon: Package,
      cor: "text-orange-600 bg-orange-50",
    },
    {
      titulo: "Ticket medio",
      valor: formatarMoeda(relatorio?.ticketMedio),
      icon: TrendingUp,
      cor: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Relatorios</h1>
          <p className="text-gray-500">Resumo de vendas, produtos e fiado.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
          <Clock size={16} className="text-orange-600" />
          {tempoResposta == null
            ? "Carregando..."
            : `${(tempoResposta / 1000).toFixed(2)}s`}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-[1fr_1fr_1.3fr_auto] gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Inicio
            </label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                value={inicio}
                onChange={(event) => setInicio(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Fim
            </label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                value={fim}
                onChange={(event) => setFim(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Produto
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
              value={produtoId}
              onChange={(event) => setProdutoId(event.target.value)}
            >
              <option value="">Todos os produtos</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={carregarRelatorio}
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl"
          >
            <Search size={18} />
            Filtrar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 flex flex-col items-center text-orange-600">
          <Loader2 size={36} className="animate-spin mb-3" />
          <p className="font-bold text-gray-600">Gerando relatorio...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {cards.map(({ titulo, valor, icon: Icon, cor }) => (
              <div
                key={titulo}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-500">
                    {titulo}
                  </span>
                  <span className={`p-2 rounded-xl ${cor}`}>
                    <Icon size={20} />
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{valor}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1.3fr_1fr] gap-6">
            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Vendas por dia
                </h2>
                <p className="text-sm text-gray-500">
                  Evolucao do faturamento no periodo selecionado.
                </p>
              </div>
              <GraficoPorDia dados={relatorio?.vendasPorDia || []} />
            </section>

            <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Produtos vendidos
                </h2>
                <p className="text-sm text-gray-500">
                  Ranking por faturamento.
                </p>
              </div>
              <BarrasPorProduto dados={relatorio?.produtosMaisVendidos || []} />
            </section>
          </div>

          <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Clientes com compra fiada
                </h2>
                <p className="text-sm text-gray-500">
                  Total em aberto: {formatarMoeda(totalDividas)}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm">
                <AlertCircle size={18} />
                {dividasPendentes.length} pendencia(s)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold">
                  <tr>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Data da compra</th>
                    <th className="px-6 py-4">Produtos</th>
                    <th className="px-6 py-4">Notificacoes</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4 text-right">Baixa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(relatorio?.dividas || []).length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Nenhuma divida registrada.
                      </td>
                    </tr>
                  ) : (
                    relatorio.dividas.map((divida) => (
                      <tr key={divida.id}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-700">
                            {divida.cliente}
                          </p>
                          <p className="text-xs text-gray-400">
                            {divida.email || "Sem email"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {divida.dataCompra}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {divida.produtos?.length
                            ? divida.produtos.join(", ")
                            : "Nao informado"}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {divida.datasNotificacoes?.length
                            ? divida.datasNotificacoes.join(", ")
                            : "Nenhuma"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                              divida.paga
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {divida.paga ? "Pago" : "Em aberto"}
                          </span>
                          {divida.paga && divida.dataPagamento && (
                            <p className="mt-1 text-xs text-gray-400">
                              {divida.dataPagamento}
                            </p>
                          )}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-bold ${
                            divida.paga ? "text-gray-500" : "text-red-600"
                          }`}
                        >
                          {formatarMoeda(divida.valor)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {divida.paga ? (
                            <span className="text-xs font-bold text-gray-400">
                              Baixada
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => marcarDividaComoPaga(divida.id)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                            >
                              <CheckCircle size={16} />
                              Marcar paga
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

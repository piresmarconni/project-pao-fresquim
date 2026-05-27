"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  Barcode,
  CreditCard,
  FileText,
  Loader2,
  Minus,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";

const hoje = new Date().toISOString().slice(0, 10);

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function VendasPage() {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tipoPagamento, setTipoPagamento] = useState("Dinheiro");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function carregarDados() {
    setIsLoading(true);
    try {
      const [produtosResponse, clientesResponse, vendasResponse] =
        await Promise.all([
          api.get("/produtos"),
          api.get("/clientes/listar"),
          api.get("/vendas"),
        ]);

      setProdutos(produtosResponse.data);
      setClientes(clientesResponse.data);
      setVendas(vendasResponse.data);
    } catch (error) {
      toast.error("Erro ao carregar dados de venda.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados();
  }, []);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return produtos.filter(
      (produto) =>
        produto.nome?.toLowerCase().includes(termo) ||
        produto.codigoBarras?.includes(termo) ||
        produto.categoria?.toLowerCase().includes(termo),
    );
  }, [busca, produtos]);

  const total = useMemo(
    () =>
      carrinho.reduce(
        (soma, item) => soma + Number(item.preco || 0) * item.quantidadeVenda,
        0,
      ),
    [carrinho],
  );

  const clienteSelecionado = clientes.find(
    (cliente) => String(cliente.id) === clienteId,
  );

  const fiadoBloqueado =
    tipoPagamento === "Fiado" &&
    (!clienteSelecionado || clienteSelecionado.bloqueado);

  const adicionarProduto = (produto) => {
    if ((produto.quantidade || 0) <= 0) {
      toast.error("Produto sem estoque.");
      return;
    }

    setCarrinho((itens) => {
      const itemExistente = itens.find((item) => item.id === produto.id);

      if (itemExistente) {
        if (itemExistente.quantidadeVenda >= produto.quantidade) {
          toast.error("Quantidade maior que o estoque disponivel.");
          return itens;
        }

        return itens.map((item) =>
          item.id === produto.id
            ? { ...item, quantidadeVenda: item.quantidadeVenda + 1 }
            : item,
        );
      }

      return [...itens, { ...produto, quantidadeVenda: 1 }];
    });
  };

  const adicionarPorCodigoBarras = (event) => {
    event.preventDefault();

    const codigo = codigoBarras.trim();
    if (!codigo) return;

    const produto = produtos.find((item) => item.codigoBarras === codigo);
    if (!produto) {
      toast.error("Produto não encontrado para este código.");
      return;
    }

    adicionarProduto(produto);
    setCodigoBarras("");
  };

  const alterarQuantidade = (produtoId, novaQuantidade) => {
    setCarrinho((itens) =>
      itens
        .map((item) => {
          if (item.id !== produtoId) return item;

          const quantidadeLimitada = Math.min(
            Math.max(novaQuantidade, 0),
            item.quantidade,
          );

          return { ...item, quantidadeVenda: quantidadeLimitada };
        })
        .filter((item) => item.quantidadeVenda > 0),
    );
  };

  const limparVenda = () => {
    setCarrinho([]);
    setClienteId("");
    setTipoPagamento("Dinheiro");
    setNotaFiscal("");
  };

  const montarPayloadVenda = () => ({
    dataVenda: hoje,
    valorTotal: total,
    produtos: carrinho.map((item) => ({
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      quantidade: item.quantidadeVenda,
      categoria: item.categoria,
      codigoBarras: item.codigoBarras,
    })),
    pagamento: {
      tipo: tipoPagamento,
      valor: total,
    },
    ...(clienteSelecionado ? { cliente: { id: clienteSelecionado.id } } : {}),
  });

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      toast.error("Adicione pelo menos um produto.");
      return;
    }

    if (tipoPagamento === "Fiado" && !clienteSelecionado) {
      toast.error("Venda fiada precisa de um cliente cadastrado.");
      return;
    }

    if (tipoPagamento === "Fiado" && clienteSelecionado.bloqueado) {
      toast.error("Cliente negativado nao pode comprar fiado.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = montarPayloadVenda();
      const vendaResponse = await api.post("/vendas/calcular-total", payload);
      const notaResponse = await api.post("/vendas/nota-fiscal", {
        ...payload,
        valorTotal: vendaResponse.data.valorTotal,
      });

      setNotaFiscal(notaResponse.data);
      toast.success("Venda finalizada com sucesso!");
      await carregarDados();
      setCarrinho([]);
    } catch (error) {
      toast.error("Erro ao finalizar a venda.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vendas</h1>
        <p className="text-gray-500">Registre compras e acompanhe o caixa.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <section className="space-y-6 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 space-y-3">
              <form onSubmit={adicionarPorCodigoBarras} className="relative">
                <Barcode
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Leia ou digite o código de barras e pressione Enter..."
                  className="w-full pl-10 pr-4 py-3 bg-orange-50/60 border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-700"
                  value={codigoBarras}
                  onChange={(event) => setCodigoBarras(event.target.value)}
                />
              </form>

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Buscar por produto, categoria ou codigo..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold">
                  <tr>
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Codigo</th>
                    <th className="px-6 py-4">Preco</th>
                    <th className="px-6 py-4 text-center">Estoque</th>
                    <th className="px-6 py-4 text-right">Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-orange-500">
                          <Loader2 size={32} className="animate-spin mb-2" />
                          <p className="text-gray-500 font-medium text-sm">
                            Carregando produtos...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : produtosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  ) : (
                    produtosFiltrados.map((produto) => (
                      <tr
                        key={produto.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-700">
                            {produto.nome}
                          </p>
                          <p className="text-xs text-gray-400">
                            {produto.categoria || "Sem categoria"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          <div className="flex items-center gap-2">
                            <Barcode size={16} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[9rem] block">{produto.codigoBarras}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {formatarMoeda(produto.preco)}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-600">
                          {produto.quantidade}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => adicionarProduto(produto)}
                            aria-label={`Adicionar ${produto.nome}`}
                            title={`Adicionar ${produto.nome}`}
                            className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl transition-all disabled:bg-gray-200 disabled:text-gray-400"
                            disabled={(produto.quantidade || 0) <= 0}
                          >
                            <Plus size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <ReceiptText size={20} className="text-orange-600" />
              <h2 className="font-bold text-gray-800">Vendas recentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Itens</th>
                    <th className="px-6 py-4">Pagamento</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {vendas.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Nenhuma venda registrada.
                      </td>
                    </tr>
                  ) : (
                    vendas.slice(-6).reverse().map((venda) => (
                      <tr key={venda.id}>
                        <td className="px-6 py-4 text-gray-600">
                          {venda.dataVenda}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {venda.quantidadeProdutos || 0} produto(s)
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {venda.tipoPagamento || "Nao informado"}
                        </td>
                        <td className="px-6 py-4 text-right font-bold">
                          {formatarMoeda(venda.valorTotal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 xl:sticky xl:top-8 min-w-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingCart size={22} className="text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Carrinho</h2>
            </div>

            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Cliente
            </label>
            <div className="relative mb-4">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-medium text-gray-700"
                value={clienteId}
                onChange={(event) => setClienteId(event.target.value)}
              >
                <option value="">Consumidor sem cadastro</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.bloqueado ? "Negativado" : "Positivo"}
                  </option>
                ))}
              </select>
            </div>

            {clienteSelecionado && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
                  clienteSelecionado.bloqueado
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <AlertCircle size={16} />
                {clienteSelecionado.bloqueado
                  ? "Cliente negativado"
                  : "Cliente positivo"}
              </div>
            )}

            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Pagamento
            </label>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-2">
              {[
                { tipo: "Dinheiro", icon: Banknote },
                { tipo: "Débito", icon: CreditCard },
                { tipo: "Crédito", icon: CreditCard },
                { tipo: "Pix", icon: FileText },
                { tipo: "Fiado", icon: ReceiptText },
              ].map(({ tipo, icon: Icon }) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTipoPagamento(tipo)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs font-bold transition-all ${
                    tipoPagamento === tipo
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:border-orange-200"
                  }`}
                >
                  <Icon size={18} />
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-3 max-h-[38vh] overflow-y-auto">
            {carrinho.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <ShoppingCart
                  size={34}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p className="font-medium">Nenhum item adicionado.</p>
              </div>
            ) : (
              carrinho.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-xl p-3 space-y-3"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-700">{item.nome}</p>
                      <p className="text-xs text-gray-400">
                        {formatarMoeda(item.preco)} cada
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(item.id, 0)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg self-start"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          alterarQuantidade(
                            item.id,
                            item.quantidadeVenda - 1,
                          )
                        }
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold">
                        {item.quantidadeVenda}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          alterarQuantidade(
                            item.id,
                            item.quantidadeVenda + 1,
                          )
                        }
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-bold text-gray-800">
                      {formatarMoeda(item.preco * item.quantidadeVenda)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Total</span>
              <strong className="text-3xl text-gray-800">
                {formatarMoeda(total)}
              </strong>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                onClick={finalizarVenda}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
                title={
                  fiadoBloqueado
                    ? "Venda fiada exige cliente positivo"
                    : undefined
                }
                disabled={isSaving || carrinho.length === 0 || fiadoBloqueado}
              >
                {isSaving ? "Finalizando..." : "Finalizar Venda"}
              </button>
              <button
                type="button"
                onClick={limparVenda}
                className="px-4 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {notaFiscal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-orange-50/30">
              <h3 className="text-xl font-bold text-gray-800">Nota Fiscal</h3>
              <button
                type="button"
                onClick={() => setNotaFiscal("")}
                className="text-gray-400 hover:text-gray-600"
              >
                Fechar
              </button>
            </div>
            <pre className="p-6 whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {notaFiscal}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

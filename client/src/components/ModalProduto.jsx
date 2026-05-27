import { useState, useEffect } from "react";
import Modal from "./Modal";

const ESTADO_INICIAL = {
  nome: "",
  categoria: "",
  quantidade: "",
  preco: "",
  codigoBarras: "",
};

export default function ModalProduto({
  isOpen,
  onClose,
  produtoEditando,
  modoVisualizacao = false,
  onSave,
}) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);

  useEffect(() => {
    if (produtoEditando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...ESTADO_INICIAL,
        ...produtoEditando,
        nome: produtoEditando.nome || "",
        categoria: produtoEditando.categoria || "",
        quantidade: String(produtoEditando.quantidade ?? ""),
        preco: String(produtoEditando.preco ?? ""),
        codigoBarras: String(produtoEditando.codigoBarras || ""),
      });
    } else {
      setFormData(ESTADO_INICIAL);
    }
  }, [produtoEditando, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoVisualizacao) return;

    onSave({
      ...formData,
      quantidade: formData.quantidade !== "" ? parseInt(formData.quantidade, 10) : null,
      preco: formData.preco !== "" ? parseFloat(String(formData.preco).replace(",", ".")) : null,
    });
  };

  const tituloModal = modoVisualizacao
    ? "Visualizar Produto"
    : produtoEditando
      ? "Editar Produto"
      : "Cadastrar Novo Produto";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tituloModal}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={modoVisualizacao} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            Nome do Produto
          </label>
          <input
            required
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
            value={formData.nome}
            onChange={(e) => {
              const textoLimpo = e.target.value.replace(
                /[^a-zA-Z0-9À-ÿ\s]/g,
                "",
              );
              setFormData({ ...formData, nome: textoLimpo });
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Categoria
            </label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
              value={formData.categoria}
              onChange={(e) => {
                const apenasLetras = e.target.value.replace(
                  /[^a-zA-ZÀ-ÿ\s]/g,
                  "",
                );
                setFormData({ ...formData, categoria: apenasLetras });
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Quantidade em Estoque
            </label>
            <input
              required
              type="number"
              min="0"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
              value={formData.quantidade}
              onChange={(e) =>
                setFormData({ ...formData, quantidade: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Preço Venda (R$)
            </label>
            <input
              required
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500 text-emerald-600 font-bold"
              value={formData.preco}
              onChange={(e) => {
                const formatoMoeda = e.target.value.replace(/[^0-9.,]/g, "");
                setFormData({ ...formData, preco: formatoMoeda });
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Código de Barras
            </label>
            <input
              required
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
              value={formData.codigoBarras}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, codigoBarras: apenasNumeros });
              }}
            />
          </div>
        </div>

        </fieldset>

        {modoVisualizacao ? (
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 rounded-2xl mt-4 transition-all shadow-lg"
          >
            Fechar
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-orange-100"
          >
            {produtoEditando ? "Salvar Alterações" : "Confirmar Cadastro"}
          </button>
        )}
      </form>
    </Modal>
  );
}

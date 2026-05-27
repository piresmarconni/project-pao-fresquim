import { useState, useEffect } from "react";
import Modal from "./Modal";
import { IMaskInput } from "react-imask";
import toast from "react-hot-toast";

const ENDERECO_INICIAL = {
  rua: "",
  numero: "",
  cep: "",
  bairro: "",
  cidade: "",
  estado: "",
  complemento: "",
};

const ESTADO_INICIAL = {
  nome: "",
  cargo: "",
  cpf: "",
  telefone: "",
  dataAdmissao: "",
  contatoEmergenciaNome: "",
  contatoEmergenciaTelefone: "",
  salario: "",
  status: "Ativo",
  endereco: ENDERECO_INICIAL,
  licencas: [],
};

export default function ModalFuncionario({
  isOpen,
  onClose,
  funcionarioEditando,
  modoVisualizacao = false,
  onSave,
}) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);

  const handleEnderecoChange = (campo, valor) => {
    setFormData({
      ...formData,
      endereco: {
        ...(formData.endereco || {}),
        [campo]: valor,
      },
    });
  };

  const adicionarLicenca = () => {
    setFormData({
      ...formData,
      licencas: [
        ...(formData.licencas || []),
        {
          tipoLicenca: "Atestado",
          dataInicio: "",
          dataFim: "",
          observacao: "",
          arquivoAtestado: "",
          nomeArquivoAtestado: "",
        },
      ],
    });
  };

  const alterarLicenca = (index, campo, valor) => {
    setFormData({
      ...formData,
      licencas: (formData.licencas || []).map((licenca, licencaIndex) =>
        licencaIndex === index ? { ...licenca, [campo]: valor } : licenca,
      ),
    });
  };

  const removerLicenca = (index) => {
    setFormData({
      ...formData,
      licencas: (formData.licencas || []).filter(
        (_, licencaIndex) => licencaIndex !== index,
      ),
    });
  };

  const removerAtestado = (index) => {
    setFormData({
      ...formData,
      licencas: (formData.licencas || []).map((licenca, licencaIndex) =>
        licencaIndex === index
          ? {
              ...licenca,
              arquivoAtestado: "",
              nomeArquivoAtestado: "",
            }
          : licenca,
      ),
    });
  };

  const anexarAtestado = (index, arquivo) => {
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      setFormData((dadosAtuais) => ({
        ...dadosAtuais,
        licencas: (dadosAtuais.licencas || []).map((licenca, licencaIndex) =>
          licencaIndex === index
            ? {
                ...licenca,
                arquivoAtestado: leitor.result,
                nomeArquivoAtestado: arquivo.name,
              }
            : licenca,
        ),
      }));
    };

    leitor.onerror = () => {
      toast.error("Nao foi possivel anexar o atestado.");
    };

    leitor.readAsDataURL(arquivo);
  };

  useEffect(() => {
    if (funcionarioEditando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...funcionarioEditando,
        cpf: String(funcionarioEditando.cpf || ""),
        telefone: String(funcionarioEditando.telefone || ""),
        salario: String(funcionarioEditando.salario || ""),
        status: funcionarioEditando.status || "Ativo",
        dataAdmissao: funcionarioEditando.dataAdmissao || "",
        contatoEmergenciaNome: funcionarioEditando.contatoEmergenciaNome || "",
        contatoEmergenciaTelefone: String(
          funcionarioEditando.contatoEmergenciaTelefone || "",
        ),
        licencas: funcionarioEditando.licencas || [],
        endereco: {
          ...ENDERECO_INICIAL,
          ...(funcionarioEditando.endereco || {}),
        },
      });
    } else {
      setFormData(ESTADO_INICIAL);
    }
  }, [funcionarioEditando, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoVisualizacao) return;

    const cpfSomenteNumeros = formData.cpf.replace(/\D/g, "");
    if (cpfSomenteNumeros.length !== 11) {
      toast.error("Por favor, digite o CPF completo!");
      return;
    }

    onSave({ ...formData, cpf: cpfSomenteNumeros });
  };

  const tituloModal = modoVisualizacao
    ? "Visualizar Funcionário"
    : funcionarioEditando
      ? "Editar Funcionário"
      : "Novo Funcionário";

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
            Nome Completo
          </label>
          <input
            required
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
            value={formData.nome}
            onChange={(e) => {
              const apenasLetras = e.target.value.replace(
                /[^a-zA-ZÀ-ÿ\s]/g,
                "",
              );
              setFormData({ ...formData, nome: apenasLetras });
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Cargo
            </label>
            <input
              required
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
              value={formData.cargo}
              onChange={(e) => {
                const apenasLetras = e.target.value.replace(
                  /[^a-zA-ZÀ-ÿ\s]/g,
                  "",
                );
                setFormData({ ...formData, cargo: apenasLetras });
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Salário
            </label>
            <IMaskInput
              mask={Number}
              scale={2}
              thousandsSeparator="."
              radix=","
              padFractionalZeros={true}
              normalizeZeros={true}
              mapToRadix={["."]}
              prefix="R$ "
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500 text-emerald-600 font-bold"
              value={formData.salario}
              onAccept={(value) => setFormData({ ...formData, salario: value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              CPF
            </label>
            <IMaskInput
              mask="000.000.000-00"
              placeholder="___.___.___-__"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
              value={formData.cpf}
              onAccept={(value) => setFormData({ ...formData, cpf: value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Telefone
            </label>
            <IMaskInput
              mask="(00) 00000-0000"
              placeholder="(__) _____-____"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
              value={formData.telefone}
              onAccept={(value) =>
                setFormData({ ...formData, telefone: value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            Status
          </label>
          <select
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500 font-medium text-gray-700"
            value={formData.status || "Ativo"}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Férias">Férias</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Data de Admissão
            </label>
            <input
              required
              type="date"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
              value={formData.dataAdmissao || ""}
              onChange={(e) =>
                setFormData({ ...formData, dataAdmissao: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Telefone Emergência
            </label>
            <IMaskInput
              mask="(00) 00000-0000"
              placeholder="(__) _____-____"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
              value={formData.contatoEmergenciaTelefone || ""}
              onAccept={(value) =>
                setFormData({
                  ...formData,
                  contatoEmergenciaTelefone: value,
                })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
            Nome do Contato de Emergência
          </label>
          <input
            required
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
            value={formData.contatoEmergenciaNome || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contatoEmergenciaNome: e.target.value,
              })
            }
          />
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Endereço</h4>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  CEP
                </label>
                <IMaskInput
                  mask="00000-000"
                  placeholder="_____-___"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
                  value={formData.endereco?.cep || ""}
                  onAccept={(value) => handleEnderecoChange("cep", value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Estado
                </label>
                <input
                  required
                  type="text"
                  maxLength={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500 uppercase"
                  value={formData.endereco?.estado || ""}
                  onChange={(e) =>
                    handleEnderecoChange(
                      "estado",
                      e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase(),
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_120px] gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Rua
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
                  value={formData.endereco?.rua || ""}
                  onChange={(e) => handleEnderecoChange("rua", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Número
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
                  value={formData.endereco?.numero || ""}
                  onChange={(e) =>
                    handleEnderecoChange("numero", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Bairro
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
                  value={formData.endereco?.bairro || ""}
                  onChange={(e) =>
                    handleEnderecoChange("bairro", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Cidade
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
                  value={formData.endereco?.cidade || ""}
                  onChange={(e) =>
                    handleEnderecoChange("cidade", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Complemento
              </label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
                value={formData.endereco?.complemento || ""}
                onChange={(e) =>
                  handleEnderecoChange("complemento", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-700">
              Licenças e Atestados
            </h4>
            {!modoVisualizacao && (
              <button
                type="button"
                onClick={adicionarLicenca}
                className="text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                Adicionar
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(formData.licencas || []).length === 0 ? (
              <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                Nenhuma licença ou atestado cadastrado.
              </p>
            ) : (
              formData.licencas.map((licenca, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                        Tipo
                      </label>
                      <select
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-orange-500"
                        value={licenca.tipoLicenca || "Atestado"}
                        onChange={(e) =>
                          alterarLicenca(index, "tipoLicenca", e.target.value)
                        }
                      >
                        <option value="Atestado">Atestado</option>
                        <option value="Licença médica">Licença médica</option>
                        <option value="Férias">Férias</option>
                        <option value="Falta justificada">
                          Falta justificada
                        </option>
                      </select>
                    </div>

                    {!modoVisualizacao && (
                      <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => removerLicenca(index)}
                        className="px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        Remover
                      </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                        Início
                      </label>
                      <input
                        type="date"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-orange-500"
                        value={licenca.dataInicio || ""}
                        onChange={(e) =>
                          alterarLicenca(index, "dataInicio", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                        Fim
                      </label>
                      <input
                        type="date"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-orange-500"
                        value={licenca.dataFim || ""}
                        onChange={(e) =>
                          alterarLicenca(index, "dataFim", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Atestado/Arquivo
                    </label>
                    {!modoVisualizacao && (
                        <label className="flex items-center gap-2 w-full bg-white border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:border-orange-400 transition-colors">
                    <span className="text-sm text-gray-500">
                      {licenca.nomeArquivoAtestado ? licenca.nomeArquivoAtestado : "📎 Anexar atestado..."}
                    </span>
                          <input
                              type="file"
                              accept=".pdf,image/*"
                              className="hidden"
                              onChange={(e) => anexarAtestado(index, e.target.files?.[0])}
                          />
                        </label>
                    )}
                    {licenca.nomeArquivoAtestado && (
                      <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs text-gray-500">
                        <span className="truncate">
                          {licenca.nomeArquivoAtestado}
                        </span>
                        <div className="flex items-center gap-3">
                          {licenca.arquivoAtestado?.startsWith("data:") && (
                            <a
                              href={licenca.arquivoAtestado}
                              download={licenca.nomeArquivoAtestado}
                              className="font-bold text-orange-600 hover:text-orange-700"
                            >
                              Baixar
                            </a>
                          )}
                          {!modoVisualizacao && (
                            <button
                              type="button"
                              onClick={() => removerAtestado(index)}
                              className="font-bold text-red-600 hover:text-red-700"
                            >
                              Remover anexo
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Observação
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-orange-500"
                      value={licenca.observacao || ""}
                      onChange={(e) =>
                        alterarLicenca(index, "observacao", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))
            )}
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
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl mt-4 transition-all shadow-lg"
          >
            {funcionarioEditando ? "Salvar Alterações" : "Confirmar Cadastro"}
          </button>
        )}
      </form>
    </Modal>
  );
}

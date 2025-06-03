import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import ProdutoService from '../../../../services/ProdutoService';
import CategoriaService from '../../../../services/CategoriaService';
import './CadastroProdutos.css';

// Hook customizado para redimensionamento automático do textarea
const useAutoSizeTextArea = (textAreaRef, value) => {
  useLayoutEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px';
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
};

const CadastroProdutos = () => {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoriaId: '',
    imagemUrl: '',
    ativo: true
  });

  const textAreaRef = useRef(null);
  const previewTextAreaRef = useRef(null);

  // Hook para redimensionar o textarea da descrição
  useAutoSizeTextArea(textAreaRef, formData.descricao);
  useAutoSizeTextArea(previewTextAreaRef, formData.descricao);

  useEffect(() => {
    carregarCategorias();
    if (activeTab === 'lista') {
      carregarProdutos();
    }
  }, [activeTab]);

  // Lista completa de categorias permitidas incluindo açaí e bebidas
  const allowedCategoryNames = ['Hamburgueria', 'Comida Japonesa', 'Pizzaria', 'Açaí', 'Bebidas'];

  const carregarCategorias = async () => {
    try {
      const response = await CategoriaService.listarCategorias();
      const allCategories = response.content || response || [];
      
      // Filtrar categorias permitidas (incluindo açaí e bebidas)
      const filteredCategories = allCategories.filter(c => 
        allowedCategoryNames.includes(c.nome)
      );
      
      console.log('Categorias disponíveis:', filteredCategories); // Debug
      setCategorias(filteredCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      
      // Fallback: criar categorias padrão se a API falhar
      const categoriasDefault = [
        { id: 1, nome: 'Hamburgueria' },
        { id: 2, nome: 'Comida Japonesa' },
        { id: 3, nome: 'Pizzaria' },
        { id: 4, nome: 'Açaí' },
        { id: 5, nome: 'Bebidas' }
      ];
      setCategorias(categoriasDefault);
    }
  };

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const response = await ProdutoService.listarProdutos();
      setProdutos(response.content || response || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Limitar descrição a 500 caracteres
    if (name === 'descricao' && value.length > 500) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.categoriaId) {
        alert('Por favor, selecione uma categoria válida.');
        setLoading(false);
        return;
      }

      const produtoData = {
        ...formData,
        preco: parseFloat(formData.preco),
        categoriaId: parseInt(formData.categoriaId)
      };

      if (editingProduct) {
        await ProdutoService.atualizarProduto(editingProduct.id, produtoData);
        alert('Produto atualizado com sucesso!');
        setEditingProduct(null);
      } else {
        await ProdutoService.criarProduto(produtoData);
        alert('Produto cadastrado com sucesso!');
      }

      // Resetar formulário
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        categoriaId: '',
        imagemUrl: '',
        ativo: true
      });

      // Recarregar lista se estiver na aba de lista
      if (activeTab === 'lista') {
        carregarProdutos();
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (produto) => {
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toString(),
      categoriaId: produto.categoria?.id?.toString() || '',
      imagemUrl: produto.imagemUrl || '',
      ativo: produto.ativo
    });
    setEditingProduct(produto);
    setActiveTab('cadastro');
  };

  const handleToggleStatus = async (produto) => {
    try {
      // Usa o método específico para ativar/desativar
      if (produto.ativo) {
        await ProdutoService.desativarProduto(produto.id);
      } else {
        await ProdutoService.ativarProduto(produto.id);
      }
      
      // Atualiza a lista de produtos mantendo o estado local
      setProdutos(produtos.map(p => {
        if (p.id === produto.id) {
          return { ...p, ativo: !p.ativo };
        }
        return p;
      }));

      alert(`Produto ${!produto.ativo ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      alert('Erro ao alterar status do produto');
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      nome: '',
      descricao: '',
      preco: '',
      categoriaId: '',
      imagemUrl: '',
      ativo: true
    });
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const remainingChars = 500 - formData.descricao.length;

  return (
    <div className="cadastro-produtos">
      <div className="cadastro-header">
        <h2>Gerenciar Produtos</h2>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'cadastro' ? 'active' : ''}`}
            onClick={() => setActiveTab('cadastro')}
          >
            {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
          </button>
          <button 
            className={`tab ${activeTab === 'lista' ? 'active' : ''}`}
            onClick={() => setActiveTab('lista')}
          >
            Lista de Produtos
          </button>
        </div>
      </div>
      
      {activeTab === 'cadastro' && (
        <div className="cadastro-content">
          <div className="produto-form">
            <h2>{editingProduct ? 'Editar Produto' : 'Informações do Produto'}</h2>
            {editingProduct && (
              <div className="edit-notice">
                <span>Editando: {editingProduct.nome}</span>
                <button onClick={cancelEdit} className="cancel-edit-btn">Cancelar</button>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome do produto"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="textarea-container">
                  <textarea
                    ref={textAreaRef}
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descrição do produto"
                    className="form-textarea auto-resize"
                    maxLength={500}
                    rows={3}
                  />
                  <div className="char-counter">
                    {formData.descricao.length}/500 caracteres
                    {remainingChars < 50 && (
                      <span className="warning"> - {remainingChars} restantes</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-row two-columns">
                <input
                  type="number"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  placeholder="Preço (R$)"
                  className="form-input"
                  step="0.01"
                  min="0"
                  required
                />
                
                <select
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <input
                  type="url"
                  name="imagemUrl"
                  value={formData.imagemUrl}
                  onChange={handleChange}
                  placeholder="Link da imagem"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Produto ativo
                </label>
              </div>
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Salvando...' : (editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto')}
              </button>
            </form>
          </div>
          
          <div className="preview-section">
            <h3>Preview do Produto</h3>
            <div className="product-preview">
              {formData.imagemUrl && (
                <img 
                  src={formData.imagemUrl} 
                  alt="Preview" 
                  className="preview-image"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              
              <div className="preview-info">
                <h4>{formData.nome || 'Nome do produto'}</h4>
                
                <div className="preview-description-container">
                  <textarea
                    ref={previewTextAreaRef}
                    value={formData.descricao || 'Descrição do produto'}
                    className="preview-description auto-resize"
                    readOnly
                    rows={1}
                  />
                </div>
                
                <span className="preview-price">
                  {formData.preco ? formatarMoeda(parseFloat(formData.preco)) : 'R$ 0,00'}
                </span>
                
                <span className="preview-category">
                  {categorias.find(c => c.id.toString() === formData.categoriaId)?.nome || 'Categoria'}
                </span>

                <span className={`preview-status ${formData.ativo ? 'ativo' : 'inativo'}`}>
                  {formData.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lista' && (
        <div className="lista-produtos">
          <div className="lista-header">
            <h3>Produtos Cadastrados</h3>
            <button onClick={carregarProdutos} className="refresh-btn">
              🔄 Atualizar
            </button>
          </div>

          {loading ? (
            <div className="loading">Carregando produtos...</div>
          ) : produtos.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum produto cadastrado ainda.</p>
              <button onClick={() => setActiveTab('cadastro')} className="add-first-btn">
                Cadastrar Primeiro Produto
              </button>
            </div>
          ) : (
            <div className="produtos-grid">
              {produtos.map(produto => (
                <div key={produto.id} className={`produto-card ${!produto.ativo ? 'inativo' : ''}`}>
                  {produto.imagemUrl && (
                    <img 
                      src={produto.imagemUrl} 
                      alt={produto.nome}
                      className="produto-image"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  
                  <div className="produto-info">
                    <h4>{produto.nome}</h4>
                    <p className="produto-descricao">{produto.descricao}</p>
                    <div className="produto-details">
                      <span className="produto-preco">{formatarMoeda(produto.preco)}</span>
                      <span className="produto-categoria">{produto.categoria?.nome}</span>
                    </div>
                    <div className={`produto-status ${produto.ativo ? 'ativo' : 'inativo'}`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>

                  <div className="produto-actions">
                    <button 
                      onClick={() => handleEdit(produto)}
                      className="edit-btn"
                      title="Editar produto"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(produto)}
                      className={`toggle-btn ${produto.ativo ? 'deactivate' : 'activate'}`}
                      title={produto.ativo ? 'Desativar produto' : 'Ativar produto'}
                    >
                      {produto.ativo ? '🔴 Desativar' : '🟢 Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CadastroProdutos;
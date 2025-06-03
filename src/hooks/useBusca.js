import { useState, useEffect, useCallback, useMemo } from 'react';
import buscaService from '../services/BuscaService';
import { getUserLocation, getDefaultLocation } from '../utils/locationUtils';

export const useBusca = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Estado dos filtros com valores padrão seguros
  const [filtros, setFiltros] = useState({
    termo: '',
    categoria: '',
    latitude: null,
    longitude: null,
    raioMaximoKm: 10,
    precoMinimo: null,
    precoMaximo: null,
    avaliacaoMinima: null,
    taxaEntregaMaxima: null,
    tempoEntregaMaximo: null,
    entregaGratis: false,
    ordenarPor: 'distancia',
    direcao: 'asc',
    apenasAbertos: true,
    apenasComPromocao: false
  });

  // Executar busca
  const executarBusca = useCallback(async (page = 0, resetResults = true, buscarProdutos = false) => {
    setLoading(true);
    setError(null);

    try {
      let resultado;
      const opcoes = {
        page,
        size: 20,
        latitude: filtros.latitude,
        longitude: filtros.longitude,
        raioKm: filtros.raioMaximoKm
      };

      if (buscarProdutos) {
        if (filtros.categoria) {
          // Buscar produtos por categoria usando o novo endpoint
          resultado = await buscaService.buscarProdutosPorCategoria(
            filtros.categoria,
            opcoes
          );
        } else if (filtros.termo) {
          // Buscar produtos por termo
          resultado = await buscaService.buscarProdutos(
            filtros.termo,
            {
              ...opcoes,
              categoriaId: filtros.categoria
            }
          );
        } else {
          // Listar todos os produtos
          resultado = await buscaService.listarProdutos(opcoes);
        }
      } else {
        // Busca por lojas/empresas
        if (filtros.categoria) {
          resultado = await buscaService.buscarPorCategoria(filtros.categoria, opcoes);
        } else if (filtros.termo) {
          resultado = await buscaService.buscarGeral(filtros.termo, {
            ...opcoes,
            categoriaId: filtros.categoria
          });
        } else if (filtros.latitude && filtros.longitude) {
          resultado = await buscaService.buscarProximos(
            filtros.latitude,
            filtros.longitude,
            opcoes
          );
        }
      }

      // Atualizar resultados
      if (resetResults || page === 0) {
        setResultados(resultado?.content || resultado || []);
      } else {
        setResultados(prev => [...prev, ...(resultado?.content || resultado || [])]);
      }

      // Atualizar metadados da paginação
      setTotalElements(resultado?.totalElements || resultado?.length || 0);
      setTotalPages(resultado?.totalPages || 1);
      setCurrentPage(page);

    } catch (err) {
      setError(err.message);
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Atualizar filtro específico
  const atualizarFiltro = useCallback((campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  // Limpar filtros mantendo localização
  const limparFiltros = useCallback(() => {
    setFiltros(prev => ({
      ...prev,
      termo: '',
      categoria: '',
      precoMinimo: null,
      precoMaximo: null,
      avaliacaoMinima: null,
      taxaEntregaMaxima: null,
      tempoEntregaMaximo: null,
      entregaGratis: false,
      ordenarPor: 'distancia',
      direcao: 'asc',
      apenasAbertos: true,
      apenasComPromocao: false
    }));
  }, []);

  // Carregar mais resultados (scroll infinito)
  const carregarMais = useCallback(() => {
    if (currentPage < totalPages - 1 && !loading) {
      executarBusca(currentPage + 1, false, true);
    }
  }, [currentPage, totalPages, loading, executarBusca]);

  // Verificar se há mais páginas
  const temMaisPaginas = useMemo(() => {
    return currentPage < totalPages - 1;
  }, [currentPage, totalPages]);

  // Executar busca automaticamente quando filtros relevantes mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filtros.categoria || filtros.termo) {
        executarBusca(0, true, true); // buscarProdutos = true
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [filtros.termo, filtros.categoria, filtros.latitude, filtros.longitude, filtros.raioMaximoKm, executarBusca]);

  return {
    resultados,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    filtros,
    temMaisPaginas,
    executarBusca,
    atualizarFiltro,
    limparFiltros,
    carregarMais,
    setFiltros
  };
};

// Hook para obter localização do usuário
export const useLocalizacao = () => {
  const [localizacao, setLocalizacao] = useState({
    latitude: null,
    longitude: null,
    erro: null,
    loading: false,
    origem: null
  });

  const obterLocalizacao = useCallback(() => {
    setLocalizacao(prev => ({ ...prev, loading: true, erro: null }));

    getUserLocation(
      (latitude, longitude, origem) => {
        setLocalizacao({
          latitude,
          longitude,
          erro: null,
          loading: false,
          origem
        });
      },
      (error) => {
        setLocalizacao(prev => ({
          ...prev,
          erro: error.message,
          loading: false
        }));
      }
    );
  }, []);

  const usarLocalizacaoFallback = useCallback(() => {
    const defaultLoc = getDefaultLocation();
    setLocalizacao({
      latitude: defaultLoc.latitude,
      longitude: defaultLoc.longitude,
      erro: null,
      loading: false,
      origem: 'fallback'
    });
  }, []);

  return {
    ...localizacao,
    obterLocalizacao,
    usarLocalizacaoFallback
  };
};

// Hook para sugestões de autocomplete
export const useSugestoes = (termo) => {
  const [sugestoes, setSugestoes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!termo || termo.length < 2) {
      setSugestoes([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      
      try {
        const resultado = await buscaService.obterSugestoes(termo, 8);
        setSugestoes(resultado);
      } catch (error) {
        console.error('Erro ao obter sugestões:', error);
        setSugestoes([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [termo]);

  return { sugestoes, loading };
};

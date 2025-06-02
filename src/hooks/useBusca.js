// src/hooks/useBusca.js - Versão corrigida e simplificada
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
  const executarBusca = useCallback(async (page = 0, resetResults = true) => {
    // Não executar busca se não houver coordenadas mínimas
    if (!filtros.latitude || !filtros.longitude) {
      console.log('Aguardando coordenadas para executar busca...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let resultado;

      if (filtros.categoria) {
        // Busca por categoria
        const categoriaBackend = buscaService.converterCategoriaParaBackend(filtros.categoria);
        resultado = await buscaService.buscarPorCategoria(categoriaBackend, {
          latitude: filtros.latitude,
          longitude: filtros.longitude,
          raioKm: filtros.raioMaximoKm,
          page,
          size: 20
        });
      } else if (filtros.termo) {
        // Busca por termo
        resultado = await buscaService.buscarGeral(filtros.termo, {
          latitude: filtros.latitude,
          longitude: filtros.longitude,
          raioKm: filtros.raioMaximoKm,
          page,
          size: 20
        });
      } else {
        // Busca por filtros avançados ou próximos
        const filtrosBackend = {
          ...filtros,
          categorias: filtros.categoria ? [buscaService.converterCategoriaParaBackend(filtros.categoria)] : null
        };

        resultado = await buscaService.buscarComFiltros(filtrosBackend, {
          page,
          size: 20
        });
      }

      if (resetResults || page === 0) {
        setResultados(resultado.content || []);
      } else {
        // Adicionar à lista existente (para scroll infinito)
        setResultados(prev => [...prev, ...(resultado.content || [])]);
      }

      setTotalElements(resultado.totalElements || 0);
      setTotalPages(resultado.totalPages || 0);
      setCurrentPage(page);

    } catch (err) {
      setError(err.message);
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Buscar próximos (sem filtros)
  const buscarProximos = useCallback(async () => {
    if (!filtros.latitude || !filtros.longitude) {
      console.log('Coordenadas necessárias para buscar próximos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await buscaService.buscarProximos(
        filtros.latitude,
        filtros.longitude,
        {
          raioKm: filtros.raioMaximoKm,
          limite: 20
        }
      );

      setResultados(resultado);
      setTotalElements(resultado.length);
      setTotalPages(1);
      setCurrentPage(0);

    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar próximos:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros.latitude, filtros.longitude, filtros.raioMaximoKm]);

  // Atualizar filtro específico
  const atualizarFiltro = useCallback((campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFiltros(prev => ({
      termo: '',
      categoria: '',
      latitude: prev.latitude, // Manter coordenadas
      longitude: prev.longitude,
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
    }));
  }, []);

  // Carregar mais resultados (scroll infinito)
  const carregarMais = useCallback(() => {
    if (currentPage < totalPages - 1 && !loading) {
      executarBusca(currentPage + 1, false);
    }
  }, [currentPage, totalPages, loading, executarBusca]);

  // Verificar se há mais páginas
  const temMaisPaginas = useMemo(() => {
    return currentPage < totalPages - 1;
  }, [currentPage, totalPages]);

  // Executar busca automaticamente quando filtros mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filtros.latitude && filtros.longitude) {
        executarBusca(0, true);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [filtros.termo, filtros.categoria, filtros.latitude, filtros.longitude, filtros.raioMaximoKm]);

  return {
    // Estado
    resultados,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    filtros,
    temMaisPaginas,

    // Ações
    executarBusca,
    buscarProximos,
    atualizarFiltro,
    limparFiltros,
    carregarMais,
    setFiltros
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

// Hook para obter localização do usuário - VERSÃO SIMPLIFICADA
export const useLocalizacao = () => {
  // Estado inicial com valores padrão seguros
  const [localizacao, setLocalizacao] = useState({
    latitude: null,
    longitude: null,
    erro: null,
    loading: false,
    origem: null // 'gps' | 'fallback'
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
// src/services/PedidoService.js - SERVIÇO PARA GERENCIAR PEDIDOS
import { api } from '../config/api';
import API_CONFIG from '../config/api';

class PedidoService {
  
  // ==================== MÉTODOS PARA CLIENTES ====================
  
  // Criar novo pedido
  async criarPedido(pedidoData) {
    try {
      // Log authentication status
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Usuário não está autenticado. Faça login novamente.');
      }

      console.log('Enviando pedido para:', API_CONFIG.ENDPOINTS.CLIENTE.PEDIDOS);
      console.log('Dados do pedido:', pedidoData);

      const response = await api.post(API_CONFIG.ENDPOINTS.CLIENTE.PEDIDOS, pedidoData);
      console.log('Resposta do servidor:', response);
      return response;
    } catch (error) {
      console.error('Erro detalhado ao criar pedido:', {
        message: error.message,
        stack: error.stack,
        data: pedidoData
      });

      // Throw a more specific error
      if (!localStorage.getItem('authToken')) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      } else if (error.message.includes('500')) {
        throw new Error('Erro no servidor. Por favor, tente novamente em alguns minutos.');
      } else {
        throw error;
      }
    }
  }

  // Listar pedidos do cliente
  async listarMeusPedidos(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await api.get(API_CONFIG.ENDPOINTS.CLIENTE.PEDIDOS, params);
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      throw error;
    }
  }

  // Buscar pedido por ID (cliente)
  async buscarMeuPedido(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.PEDIDO_POR_ID.replace('{id}', id);
      return await api.get(endpoint);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }

  // Listar pedidos por status (cliente)
  async listarPedidosPorStatus(status, page = 0, size = 20) {
    try {
      const params = { page, size };
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.PEDIDOS_POR_STATUS.replace('{status}', status);
      return await api.get(endpoint, params);
    } catch (error) {
      console.error('Erro ao listar pedidos por status:', error);
      throw error;
    }
  }

  // Cancelar pedido
  async cancelarPedido(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.CANCELAR_PEDIDO.replace('{id}', id);
      return await api.patch(endpoint);
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      throw error;
    }
  }

  // Obter estatísticas de pedidos do cliente
  async obterEstatisticasCliente() {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.CLIENTE.ESTATISTICAS_PEDIDOS);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Rastrear pedido
  async rastrearPedido(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.RASTREAR_PEDIDO.replace('{id}', id);
      return await api.post(endpoint);
    } catch (error) {
      console.error('Erro ao rastrear pedido:', error);
      throw error;
    }
  }

  // Pagar pedido
  async pagarPedido(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.PAGAR_PEDIDO.replace('{id}', id);
      return await api.post(endpoint);
    } catch (error) {
      console.error('Erro ao pagar pedido:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS PARA EMPRESAS ====================
  
  // Listar pedidos da empresa
  async listarPedidosEmpresa(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await api.get(API_CONFIG.ENDPOINTS.EMPRESA.PEDIDOS, params);
    } catch (error) {
      console.error('Erro ao listar pedidos da empresa:', error);
      throw error;
    }
  }

  // Atualizar status do pedido (empresa)
  async atualizarStatusPedido(id, status) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PEDIDO_STATUS.replace('{id}', id);
      // Send status as query parameter
      const params = { status };
      return await api.patch(endpoint, {}, params);
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  // Marcar pedido como entregue
  async marcarComoEntregue(pedidoId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PEDIDO_ENTREGAR.replace('{id}', pedidoId);
      return await api.patch(endpoint);
    } catch (error) {
      console.error('Erro ao marcar pedido como entregue:', error);
      throw error;
    }
  }

    // Marcar pedido como cancelado
  async marcarComoCancelado(pedidoId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PEDIDO_CANCELADO.replace('{id}', pedidoId);
      return await api.patch(endpoint);
    } catch (error) {
      console.error('Erro ao marcar pedido como cancelado:', error);
      throw error;
    }
  }

  // Criar feedback/avaliação
  async criarFeedback(feedbackData) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.FEEDBACK.replace('{pedidoId}', feedbackData.pedidoId);
      const body = {
        nota: feedbackData.nota,
        comentario: feedbackData.comentario || ''
      };
      console.log('Enviando feedback:', {
        endpoint,
        pedidoId: feedbackData.pedidoId,
        nota: feedbackData.nota,
        comentario: feedbackData.comentario
      });
      const response = await api.post(endpoint, body);
      console.log('Resposta do feedback:', response);
      return response;
    } catch (error) {
      console.error('Erro ao criar feedback:', error);
      throw error;
    }
  }

  // Listar feedbacks da empresa
  async listarFeedbacksEmpresa(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await api.get(API_CONFIG.ENDPOINTS.EMPRESA.FEEDBACKS, params);
    } catch (error) {
      console.error('Erro ao listar feedbacks da empresa:', error);
      throw error;
    }
  }

  // Verificar se pedido já foi avaliado
  async verificarFeedbackPedido(pedidoId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.FEEDBACK.replace('{pedidoId}', pedidoId);
      const response = await api.get(endpoint);
      return response && response.id; // retorna true se existe feedback
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false; // pedido não foi avaliado ainda
      }
      console.error('Erro ao verificar feedback do pedido:', error);
      return false;
    }
  }

  // ==================== MÉTODOS UTILITÁRIOS ====================
  
  // Validar dados do pedido
  validarPedido(pedidoData) {
    const erros = [];

    if (!pedidoData.empresaId) {
      erros.push('Empresa é obrigatória');
    }

    if (!pedidoData.itens || pedidoData.itens.length === 0) {
      erros.push('Pedido deve ter pelo menos um item');
    }

    if (pedidoData.itens) {
      pedidoData.itens.forEach((item, index) => {
        if (!item.produtoId) {
          erros.push(`Item ${index + 1}: Produto é obrigatório`);
        }
        if (!item.quantidade || item.quantidade <= 0) {
          erros.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
        }
      });
    }

    // Validate coordinates instead of address
    if (!pedidoData.latitude || !pedidoData.longitude) {
      erros.push('Coordenadas de entrega são obrigatórias');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Calcular total do pedido
  calcularTotalPedido(itens) {
    if (!itens || itens.length === 0) return 0;
    
    return itens.reduce((total, item) => {
      const subtotal = (item.preco || 0) * (item.quantidade || 0);
      return total + subtotal;
    }, 0);
  }

  // Formatar dados do pedido para envio
  formatarPedidoParaEnvio(pedidoData) {
    // Ensure all required fields are present and properly formatted
    const formattedData = {
      empresaId: parseInt(pedidoData.empresaId),
      itens: pedidoData.itens.map(item => ({
        produtoId: parseInt(item.produtoId),
        quantidade: parseInt(item.quantidade),
        observacoes: item.observacoes || ''
      })),
      enderecoEntrega: pedidoData.enderecoEntrega || '',
      latitude: parseFloat(pedidoData.latitude),
      longitude: parseFloat(pedidoData.longitude),
      formaPagamento: (pedidoData.formaPagamento || 'DINHEIRO').toUpperCase(),
      observacoes: pedidoData.observacoes || '',
      troco: pedidoData.troco || null
    };

    // Validate coordinates
    if (isNaN(formattedData.latitude) || isNaN(formattedData.longitude)) {
      throw new Error('Coordenadas de entrega são obrigatórias');
    }

    // Log the formatted data for debugging
    console.log('Pedido formatado:', formattedData);

    return formattedData;
  }

  // Obter status em português
  obterStatusPortugues(status) {
    const statusMap = {
      'PENDENTE': 'Pendente',
      'CONFIRMADO': 'Confirmado',
      'PREPARANDO': 'Preparando',
      'PRONTO': 'Pronto',
      'SAIU_ENTREGA': 'Saiu para entrega',
      'ENTREGUE': 'Entregue',
      'CANCELADO': 'Cancelado'
    };
    
    return statusMap[status] || status;
  }

  // Obter cor do status
  obterCorStatus(status) {
    const coresMap = {
      'PENDENTE': '#ffc107',      // Amarelo
      'CONFIRMADO': '#17a2b8',    // Azul
      'PREPARANDO': '#fd7e14',    // Laranja
      'PRONTO': '#20c997',        // Verde claro
      'SAIU_ENTREGA': '#6f42c1',  // Roxo
      'ENTREGUE': '#28a745',      // Verde
      'CANCELADO': '#dc3545'      // Vermelho
    };
    
    return coresMap[status] || '#6c757d';
  }

  // Verificar se pedido pode ser cancelado
  podeCancelar(status) {
    const statusCancelaveis = ['PENDENTE', 'CONFIRMADO'];
    return statusCancelaveis.includes(status);
  }

  // Verificar se pedido pode ser rastreado
  podeRastrear(status) {
    const statusRastreaveis = ['CONFIRMADO', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA'];
    return statusRastreaveis.includes(status);
  }

  // Formatação de valores
  formatarPreco(preco) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco || 0);
  }

  formatarData(data) {
    if (!data) return '';
    
    const date = new Date(data);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatarTempo(minutos) {
    if (!minutos) return '';
    
    if (minutos < 60) {
      return `${minutos} min`;
    }
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (minutosRestantes === 0) {
      return `${horas}h`;
    }
    
    return `${horas}h ${minutosRestantes}min`;
  }
}

export default new PedidoService();

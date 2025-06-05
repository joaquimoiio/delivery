import { api } from '../config/api';
import API_CONFIG from '../config/api';

class PedidoService {

  async criarPedido(pedidoData) {
    try {
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

      if (!localStorage.getItem('authToken')) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      } else if (error.message.includes('500')) {
        throw new Error('Erro no servidor. Por favor, tente novamente em alguns minutos.');
      } else {
        throw error;
      }
    }
  }

  async listarMeusPedidos(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await api.get(API_CONFIG.ENDPOINTS.CLIENTE.PEDIDOS, params);
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      throw error;
    }
  }

  async buscarMeuPedido(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.PEDIDO_POR_ID.replace('{id}', id);
      return await api.get(endpoint);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  }

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

  async cancelarPedido(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.CANCELAR_PEDIDO.replace('{id}', id);
      return await api.patch(endpoint);
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      throw error;
    }
  }

  async obterEstatisticasCliente() {
    try {
      return await api.get(API_CONFIG.ENDPOINTS.CLIENTE.ESTATISTICAS_PEDIDOS);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  async rastrearPedido(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.RASTREAR_PEDIDO.replace('{id}', id);
      return await api.post(endpoint);
    } catch (error) {
      console.error('Erro ao rastrear pedido:', error);
      throw error;
    }
  }

  async pagarPedido(id) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.PAGAR_PEDIDO.replace('{id}', id);
      return await api.post(endpoint);
    } catch (error) {
      console.error('Erro ao pagar pedido:', error);
      throw error;
    }
  }

  async listarPedidosEmpresa(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await api.get(API_CONFIG.ENDPOINTS.EMPRESA.PEDIDOS, params);
    } catch (error) {
      console.error('Erro ao listar pedidos da empresa:', error);
      throw error;
    }
  }

  async atualizarStatusPedido(id, status) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PEDIDO_STATUS.replace('{id}', id);
      const params = { status };
      return await api.patch(endpoint, {}, params);
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  async marcarComoEntregue(pedidoId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PEDIDO_ENTREGAR.replace('{id}', pedidoId);
      return await api.patch(endpoint);
    } catch (error) {
      console.error('Erro ao marcar pedido como entregue:', error);
      throw error;
    }
  }

  async marcarComoCancelado(pedidoId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EMPRESA.PEDIDO_CANCELADO.replace('{id}', pedidoId);
      return await api.patch(endpoint);
    } catch (error) {
      console.error('Erro ao marcar pedido como cancelado:', error);
      throw error;
    }
  }

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

  async listarFeedbacksEmpresa(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await api.get(API_CONFIG.ENDPOINTS.EMPRESA.FEEDBACKS, params);
    } catch (error) {
      console.error('Erro ao listar feedbacks da empresa:', error);
      throw error;
    }
  }

  async verificarFeedbackPedido(pedidoId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CLIENTE.FEEDBACK.replace('{pedidoId}', pedidoId);
      const response = await api.get(endpoint);
      return response && response.id;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      console.error('Erro ao verificar feedback do pedido:', error);
      return false;
    }
  }

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

    if (!pedidoData.latitude || !pedidoData.longitude) {
      erros.push('Coordenadas de entrega são obrigatórias');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  calcularTotalPedido(itens) {
    if (!itens || itens.length === 0) return 0;
    
    return itens.reduce((total, item) => {
      const subtotal = (item.preco || 0) * (item.quantidade || 0);
      return total + subtotal;
    }, 0);
  }

  formatarPedidoParaEnvio(pedidoData) {
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

    if (isNaN(formattedData.latitude) || isNaN(formattedData.longitude)) {
      throw new Error('Coordenadas de entrega são obrigatórias');
    }

    console.log('Pedido formatado:', formattedData);

    return formattedData;
  }

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

  obterCorStatus(status) {
    const coresMap = {
      'PENDENTE': '#ffc107',      
      'CONFIRMADO': '#17a2b8',    
      'PREPARANDO': '#fd7e14',    
      'PRONTO': '#20c997',        
      'SAIU_ENTREGA': '#6f42c1',  
      'ENTREGUE': '#28a745',      
      'CANCELADO': '#dc3545'      
    };
    
    return coresMap[status] || '#6c757d';
  }

  podeCancelar(status) {
    const statusCancelaveis = ['PENDENTE', 'CONFIRMADO'];
    return statusCancelaveis.includes(status);
  }

  podeRastrear(status) {
    const statusRastreaveis = ['CONFIRMADO', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA'];
    return statusRastreaveis.includes(status);
  }

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

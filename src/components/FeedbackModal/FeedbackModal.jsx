// src/components/FeedbackModal/FeedbackModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './FeedbackModal.css';

const FeedbackModal = ({ pedido, isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({
    nota: 0,
    comentario: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (nota) => {
    setFeedback(prev => ({ ...prev, nota }));
  };

  const handleComentarioChange = (e) => {
    setFeedback(prev => ({ ...prev, comentario: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (feedback.nota === 0) {
      alert('Por favor, selecione uma nota de 1 a 5 estrelas');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        pedidoId: pedido.id,
        nota: feedback.nota,
        comentario: feedback.comentario.trim()
      };

      await onSubmit(feedbackData);
      
      // Reset form
      setFeedback({ nota: 0, comentario: '' });
      onClose();
      
      alert('Feedback enviado com sucesso! Obrigado pela sua avaliação.');
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      alert('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFeedback({ nota: 0, comentario: '' });
    onClose();
  };

  if (!isOpen || !pedido) return null;

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <h2>Avalie seu pedido</h2>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <div className="feedback-modal-content">
          <div className="pedido-info">
            <h3>Pedido #{pedido.id}</h3>
            <p className="empresa-name">{pedido.nomeEmpresa}</p>
            <p className="pedido-total">Total: {formatPrice(pedido.total)}</p>
            <p className="pedido-data">
              Entregue em: {formatDate(pedido.dataEntrega || pedido.dataUltimaAtualizacao)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="rating-section">
              <label>Como foi sua experiência?</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${feedback.nota >= star ? 'active' : ''}`}
                    onClick={() => handleStarClick(star)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <div className="rating-text">
                {feedback.nota > 0 && (
                  <span className="rating-label">
                    {getRatingLabel(feedback.nota)}
                  </span>
                )}
              </div>
            </div>

            <div className="comment-section">
              <label htmlFor="comentario">
                Conte-nos mais sobre sua experiência (opcional)
              </label>
              <textarea
                id="comentario"
                value={feedback.comentario}
                onChange={handleComentarioChange}
                placeholder="Deixe seu comentário sobre o pedido, entrega, qualidade dos produtos..."
                maxLength={500}
                rows={4}
                className="comment-textarea"
              />
              <div className="char-counter">
                {feedback.comentario.length}/500 caracteres
              </div>
            </div>

            <div className="feedback-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || feedback.nota === 0}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Funções auxiliares
const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Data não disponível';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getRatingLabel = (nota) => {
  switch (nota) {
    case 1: return 'Muito ruim';
    case 2: return 'Ruim';
    case 3: return 'Regular';
    case 4: return 'Bom';
    case 5: return 'Excelente';
    default: return '';
  }
};

export default FeedbackModal;
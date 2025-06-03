import React, { useState } from 'react';
import './FeedbackModal.css';

const FeedbackModal = ({ pedido, onSubmit, onClose }) => {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        pedidoId: pedido.id,
        nota,
        comentario
      });
      onClose();
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      alert('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderEstrelas = () => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <button
          key={i}
          type="button"
          className={`estrela ${i <= nota ? 'selecionada' : ''}`}
          onClick={() => setNota(i)}
          title={`${i} ${i === 1 ? 'estrela' : 'estrelas'}`}
        >
          ⭐
        </button>
      );
    }
    return estrelas;
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <button className="close-btn" onClick={onClose} title="Fechar">
          ✕
        </button>

        <h2>Avalie seu Pedido</h2>
        <p className="pedido-info">
          Pedido #{pedido.id} • {pedido.empresa?.nomeFantasia}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="avaliacao-section">
            <label>Sua avaliação:</label>
            <div className="estrelas-container">
              {renderEstrelas()}
            </div>
            <span className="nota-texto">
              {nota} {nota === 1 ? 'estrela' : 'estrelas'}
            </span>
          </div>

          <div className="comentario-section">
            <label htmlFor="comentario">Comentário (opcional):</label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conte-nos mais sobre sua experiência..."
              maxLength={500}
              rows={4}
            />
            <div className="caracteres-restantes">
              {500 - comentario.length} caracteres restantes
            </div>
          </div>

          <div className="botoes">
            <button 
              type="button" 
              className="cancelar-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="enviar-btn"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;

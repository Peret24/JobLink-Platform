import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container mt-5 mb-5 text-center">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          {/* Грустный пингвин */}
          <div className="mb-4 fade-in">
            <img 
              src="/pingo sad.png" 
              alt="404 — страница не найдена" 
              className="img-fluid rounded shadow-sm" 
              style={{ maxHeight: '300px' }} 
            />
          </div>

          <h2 className="h3 mb-3 fw-bold text-dark">Страница не найдена :(</h2>

          <p className="lead text-muted mb-4">
            Страницы нет.<br />
            Как и работы после «курсов мечты».<br />
            Зато на главной — реальные вакансии. 😅
          </p>

          <div className="d-grid gap-2 d-md-flex justify-content-md-center mb-5">
            <Link to="/" className="btn btn-primary btn-lg px-5 impatient-btn rounded-pill">
              <i className="bi bi-house-door me-2"></i> На главную
            </Link>
            <Link to="/faq" className="btn btn-outline-secondary btn-lg px-5 rounded-pill">
              <i className="bi bi-question-circle me-2"></i> FAQ
            </Link>
          </div>

          <p className="text-muted small">
            P.S. Если вы уверены, что ссылка правильная — сообщите нам. 😉
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
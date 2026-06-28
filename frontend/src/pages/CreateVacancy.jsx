import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateVacancy() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    company: '',
    salary: '',
    city: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/vacancies', form);
      navigate('/vacancies'); // Перенаправление на список вакансий после успеха
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании вакансии');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
            <h2 className="h4 fw-bold mb-1">Размещение вакансии</h2>
            <p className="text-muted small mb-0">Заполните форму, чтобы найти подходящего сотрудника</p>
          </div>
          
          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Название вакансии */}
              <div className="mb-3">
                <label className="form-label fw-bold">Название вакансии *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-briefcase"></i></span>
                  <input 
                    type="text" 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    className="form-control" 
                    placeholder="Например: Frontend-разработчик (React)" 
                    required 
                  />
                </div>
              </div>

              {/* Компания и Город в одну строку */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Компания *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-building"></i></span>
                    <input 
                      type="text" 
                      name="company" 
                      value={form.company} 
                      onChange={handleChange} 
                      className="form-control" 
                      placeholder="Название организации" 
                      required 
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Город</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-geo-alt"></i></span>
                    <input 
                      type="text" 
                      name="city" 
                      value={form.city} 
                      onChange={handleChange} 
                      className="form-control" 
                      placeholder="Москва, Санкт-Петербург..." 
                    />
                  </div>
                </div>
              </div>

              {/* Зарплата */}
              <div className="mb-3">
                <label className="form-label fw-bold">Уровень дохода</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-currency-exchange"></i></span>
                  <input 
                    type="text" 
                    name="salary" 
                    value={form.salary} 
                    onChange={handleChange} 
                    className="form-control" 
                    placeholder="Например: от 150 000 ₽" 
                  />
                </div>
                <div className="form-text text-muted">Указание зарплаты повышает отклик на 40%</div>
              </div>

              {/* Описание */}
              <div className="mb-4">
                <label className="form-label fw-bold">Описание вакансии *</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  className="form-control" 
                  rows="6" 
                  placeholder="Опишите требования к кандидату, обязанности и условия работы..." 
                  required
                ></textarea>
              </div>

              {/* Кнопки действий */}
              <div className="d-flex gap-2 justify-content-end">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="btn btn-outline-secondary px-4"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn btn-primary px-5 fw-bold"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Публикация...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i> Опубликовать вакансию
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateVacancy;
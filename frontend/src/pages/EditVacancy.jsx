import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

function EditVacancy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    company: '',
    salary: '',
    city: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Загружаем текущие данные вакансии
    api.get(`/vacancies/${id}`) // Убедись, что на бэкенде есть роут GET /api/vacancies/:id
      .then(res => setForm(res.data))
      .catch(() => navigate('/vacancies'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/vacancies/${id}`, form);
      navigate('/vacancies');
    } catch (err) {
      setError('Ошибка при обновлении вакансии');
    }
  };

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="mb-4">Редактирование вакансии</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Название вакансии *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="form-control" 
                  required 
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Компания *</label>
                  <input 
                    type="text" 
                    name="company" 
                    value={form.company} 
                    onChange={handleChange} 
                    className="form-control" 
                    required 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Город</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={form.city} 
                    onChange={handleChange} 
                    className="form-control" 
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Зарплата</label>
                <input 
                  type="text" 
                  name="salary" 
                  value={form.salary} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="например, от 100 000 ₽"
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Описание *</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  className="form-control" 
                  rows="5" 
                  required
                ></textarea>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary px-4">
                  Сохранить изменения
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/vacancies')} 
                  className="btn btn-outline-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditVacancy;
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';


function Vacancies() {
  const [vacancies, setVacancies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    api.get('/vacancies').then((res) => setVacancies(res.data)).catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить вакансию?')) return;
    try {
      await api.delete(`/vacancies/${id}`);
      setVacancies(prev => prev.filter(v => v._id !== id));
      if (selectedVacancy?._id === id) setSelectedVacancy(null);
    } catch (err) { alert('Ошибка удаления'); }
  };

  const filtered = vacancies.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.company.toLowerCase().includes(search.toLowerCase()) ||
    (v.city && v.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden bg-white">
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
          <input type="text" className="form-control border-start-0 ps-0" placeholder="Поиск вакансий..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="col-12 d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0 fw-bold">Все вакансии</h2>
        <span className="badge bg-primary rounded-pill fs-6">{filtered.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="col-12"><div className="alert alert-info text-center py-4 rounded-3 border-0 shadow-sm">Вакансии не найдены</div></div>
      ) : (
        filtered.map((v) => (
          <div key={v._id} className="col-12 mb-3">
            <div className="card job-card border-0 bg-white h-100 rounded-3 shadow-sm position-relative" style={{cursor: 'pointer', transition: 'transform 0.2s'}}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                 onClick={() => setSelectedVacancy(v)}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1 pe-3">
                    <h5 className="card-title fw-bold mb-1 text-primary">{v.title}</h5>
                    <p className="text-muted small mb-2">
                      <i className="bi bi-building me-1"></i>{v.company} • 
                      <i className="bi bi-geo-alt ms-2 me-1"></i>{v.city || 'Удалённо'}
                    </p>
                    <p className="card-text text-secondary mb-3 line-clamp-2">{v.description}</p>
                    <span className="salary-badge rounded-pill bg-light text-primary border px-3 py-1 fw-bold">
                      {v.salary || 'Зарплата не указана'}
                    </span>
                  </div>
                  
                  {isLoggedIn && user.role === 'employer' && v.createdBy?._id === user.id && (
                    <div className="d-flex flex-column gap-2 ms-3" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/vacancies/${v._id}/edit`} className="btn btn-sm btn-outline-primary rounded-circle" title="Редактировать"><i className="bi bi-pencil"></i></Link>
                      <button onClick={() => handleDelete(v._id)} className="btn btn-sm btn-outline-danger rounded-circle" title="Удалить"><i className="bi bi-trash"></i></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* КАСТОМНАЯ МОДАЛКА С ВЫСОКИМ Z-INDEX */}
      {selectedVacancy && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setSelectedVacancy(null)}>
          <div className="bg-white rounded-4 shadow-lg w-100 mx-3" style={{maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'}} onClick={e => e.stopPropagation()}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-start">
              <div>
                <h3 className="fw-bold mb-1 text-primary">{selectedVacancy.title}</h3>
                <p className="text-muted mb-0"><i className="bi bi-building me-2"></i>{selectedVacancy.company} • {selectedVacancy.city || 'Удалённо'}</p>
              </div>
              <button onClick={() => setSelectedVacancy(null)} className="btn btn-close"></button>
            </div>
            
            <div className="p-4">
              <div className="d-flex gap-2 mb-4">
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-bold fs-6">
                  {selectedVacancy.salary || 'По договоренности'}
                </span>
                <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                  <i className="bi bi-calendar me-1"></i>{new Date(selectedVacancy.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h5 className="fw-bold mb-3">Описание вакансии</h5>
              <div className="bg-light p-4 rounded-3 text-break" style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>
                {selectedVacancy.description}
              </div>

              <div className="mt-4 pt-3 border-top text-muted small">
                Работодатель: <strong>{selectedVacancy.createdBy?.name || 'Аноним'}</strong> ({selectedVacancy.createdBy?.email})
              </div>
            </div>

            <div className="p-4 border-top bg-light rounded-bottom-4 d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedVacancy(null)}>Закрыть</button>
              <button className="btn btn-primary rounded-pill px-4 fw-bold"><i className="bi bi-send me-2"></i>Откликнуться</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vacancies;
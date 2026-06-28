import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import html2pdf from 'html2pdf.js';

function Resume() {
  const resumeRef = useRef(null);
  const [form, setForm] = useState({
    fullName: '', age: '', city: '', phone: '', email: '',
    skills: '', education: '', experience: '', about: '', isVisible: false
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/resume').then((res) => {
      setForm(res.data || { ...form, isVisible: false });
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resume', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Ошибка сохранения');
    }
  };

  // АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ PDF БЕЗ ОКНА ПЕЧАТИ
  const handleExportPDF = () => {
    if (!resumeRef.current) return;

    const opt = {
      margin:       10,
      filename:     `${form.fullName || 'Резюме'}_JobLink.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Временно скрываем элементы управления перед генерацией
    const buttons = document.querySelectorAll('.no-print');
    buttons.forEach(el => el.style.display = 'none');

    html2pdf().set(opt).from(resumeRef.current).save().then(() => {
      // Возвращаем кнопки после сохранения
      buttons.forEach(el => el.style.display = '');
    });
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        
        {/* Панель действий (не попадает в PDF) */}
        <div className="d-flex justify-content-between align-items-center mb-4 no-print">
          <h2 className="h4 fw-bold mb-0">Моё резюме</h2>
          <button 
            onClick={handleExportPDF} 
            className="btn btn-primary rounded-pill d-flex align-items-center gap-2 shadow-sm"
            disabled={!form.fullName}
          >
            <i className="bi bi-file-earmark-pdf-fill"></i> Скачать PDF
          </button>
        </div>

        {/* Область, которая пойдет в PDF */}
        <div ref={resumeRef} className="card shadow-sm border-0 rounded-3 bg-white p-5">
          
          {saved && (
            <div className="alert alert-success d-flex align-items-center mb-4 rounded-3 no-print">
              <i className="bi bi-check-circle-fill me-2"></i> Резюме успешно сохранено!
            </div>
          )}

          {/* Переключатель видимости (не попадает в PDF) */}
          <div className="alert alert-light border mb-4 d-flex align-items-center justify-content-between rounded-3 no-print">
            <div>
              <h6 className="mb-1 fw-bold"><i className="bi bi-eye me-2"></i>Видимость профиля</h6>
              <small className="text-muted">Работодатели смогут найти вас через поиск</small>
            </div>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" type="checkbox" name="isVisible"
                id="visibilitySwitch" checked={form.isVisible} onChange={handleChange}
                style={{width: '3em', height: '1.5em'}}
              />
            </div>
          </div>

          {/* Заголовок резюме */}
          <div className="text-center mb-4 border-bottom pb-3">
            <h1 className="fw-bold text-dark mb-2">{form.fullName || 'ФИО не указано'}</h1>
            <p className="text-muted mb-1 fs-6">
              {form.city && <span><i className="bi bi-geo-alt me-1"></i>{form.city} | </span>}
              {form.phone && <span><i className="bi bi-telephone me-1"></i>{form.phone} | </span>}
              {form.email && <span><i className="bi bi-envelope me-1"></i>{form.email}</span>}
            </p>
            {form.age && <p className="small text-muted mt-1">Возраст: {form.age} лет</p>}
          </div>

          <form onSubmit={handleSubmit}>
            {/* О себе */}
            <div className="mb-4">
              <h5 className="fw-bold text-primary mb-2 border-start border-4 border-primary ps-2">О СЕБЕ</h5>
              <textarea 
                name="about" value={form.about || ''} onChange={handleChange} 
                className="form-control border-0 bg-light p-3 rounded-3 no-print" rows="3" placeholder="Расскажите о своих целях..." 
              />
              {form.about && <div className="p-2 text-break">{form.about}</div>}
            </div>

            {/* Навыки */}
            <div className="mb-4">
              <h5 className="fw-bold text-primary mb-2 border-start border-4 border-primary ps-2">КЛЮЧЕВЫЕ НАВЫКИ</h5>
              <textarea 
                name="skills" value={form.skills || ''} onChange={handleChange} 
                className="form-control border-0 bg-light p-3 rounded-3 no-print" rows="2" placeholder="React, Node.js, Figma..." 
              />
              {form.skills && <div className="p-2 text-break">{form.skills}</div>}
            </div>

            {/* Опыт работы */}
            <div className="mb-4">
              <h5 className="fw-bold text-primary mb-2 border-start border-4 border-primary ps-2">ОПЫТ РАБОТЫ</h5>
              <textarea 
                name="experience" value={form.experience || ''} onChange={handleChange} 
                className="form-control border-0 bg-light p-3 rounded-3 no-print" rows="4" placeholder="Компания, должность, обязанности..." 
              />
              {form.experience && <div className="p-2 text-break" style={{whiteSpace: 'pre-wrap'}}>{form.experience}</div>}
            </div>

            {/* Образование */}
            <div className="mb-4">
              <h5 className="fw-bold text-primary mb-2 border-start border-4 border-primary ps-2">ОБРАЗОВАНИЕ</h5>
              <textarea 
                name="education" value={form.education || ''} onChange={handleChange} 
                className="form-control border-0 bg-light p-3 rounded-3 no-print" rows="2" placeholder="Вуз, факультет, год окончания..." 
              />
              {form.education && <div className="p-2 text-break">{form.education}</div>}
            </div>

            {/* Кнопка сохранения (не попадает в PDF) */}
            <button type="submit" className="btn btn-outline-primary w-100 py-2 fw-bold rounded-pill no-print mt-4">
              <i className="bi bi-save me-2"></i> Сохранить изменения
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Resume;
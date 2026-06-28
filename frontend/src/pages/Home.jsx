import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [vacancies, setVacancies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  
  // Получаем роль пользователя
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!localStorage.getItem('token');
  
  // Логика определения режима поиска:
  // Если работодатель -> может выбирать. Если соискатель -> только вакансии.
  const defaultMode = user.role === 'employer' ? 'vacancies' : 'vacancies';
  const [searchMode, setSearchMode] = useState(defaultMode);
  
  const [hasSearched, setHasSearched] = useState(false);
  
  // Состояние фильтров
  const [filters, setFilters] = useState({
    keywords: '', inTitle: false, inCompany: false, inDesc: false,
    excludeWords: '', specialization: '', industry: '', region: '',
    district: '', metro: '', salaryOnly: false, paymentFreq: '',
    education: '', experience: '', employmentType: [], workSchedule: [], workFormat: [],
    candCity: '', candSkills: '', candPosition: '', candEducation: '',
    candExperience: '', candAgeFrom: '', candAgeTo: '', candSalaryExpect: '',
    candEmployment: [], candWorkFormat: []
  });

  useEffect(() => {
    loadInitialVacancies();
  }, []);

  const loadInitialVacancies = () => {
    api.get('/vacancies').then((res) => {
      setVacancies(res.data.slice(0, 6));
    }).catch(() => {});
  };

  const performSearch = async (query, mode = searchMode, activeFilters = filters) => {
    setSearch(query);
    setSearchMode(mode);
    setHasSearched(true);

    if (mode === 'candidates') {
      try {
        const res = await api.get(`/resumes/search?q=${query}`);
        let data = res.data;
        if (activeFilters.candCity) data = data.filter(c => c.city && c.city.toLowerCase().includes(activeFilters.candCity.toLowerCase()));
        if (activeFilters.candSkills) data = data.filter(c => c.skills && c.skills.toLowerCase().includes(activeFilters.candSkills.toLowerCase()));
        setCandidates(data);
        setVacancies([]);
      } catch (err) { console.error(err); }
    } else {
      try {
        const res = await api.get('/vacancies');
        let all = res.data;
        let filtered = all.filter(v => 
          v.title.toLowerCase().includes(query.toLowerCase()) || 
          v.company.toLowerCase().includes(query.toLowerCase()) ||
          (v.city && v.city.toLowerCase().includes(query.toLowerCase()))
        );
        if (activeFilters.region) filtered = filtered.filter(v => v.city && v.city.toLowerCase().includes(activeFilters.region.toLowerCase()));
        setVacancies(filtered);
        setCandidates([]);
      } catch (err) { console.error(err); }
    }
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    if (!e.target.value) { setHasSearched(false); loadInitialVacancies(); }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) performSearch(search);
  };

  const handleTagClick = (tag) => performSearch(tag, 'vacancies');
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (['employmentType', 'workSchedule', 'workFormat', 'candEmployment', 'candWorkFormat'].includes(name)) {
        const currentList = filters[name] || [];
        const newList = checked ? [...currentList, value] : currentList.filter(item => item !== value);
        setFilters({...filters, [name]: newList});
      } else {
        setFilters({...filters, [name]: checked});
      }
    } else {
      setFilters({...filters, [name]: value});
    }
  };
  
  const applyFilters = () => {
    performSearch(search || '', searchMode, filters);
    document.querySelector('.btn-close')?.click();
  };

  const resetFilters = () => {
    setFilters({
      keywords: '', inTitle: false, inCompany: false, inDesc: false,
      excludeWords: '', specialization: '', industry: '', region: '',
      district: '', metro: '', salaryOnly: false, paymentFreq: '',
      education: '', experience: '', employmentType: [], workSchedule: [], workFormat: [],
      candCity: '', candSkills: '', candPosition: '', candEducation: '',
      candExperience: '', candAgeFrom: '', candAgeTo: '', candSalaryExpect: '',
      candEmployment: [], candWorkFormat: []
    });
  };

  return (
    <>
      {/* ПОИСК НА ВСЮ ШИРИНУ */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-3">
              <div className="d-flex gap-2 align-items-center flex-wrap flex-md-nowrap">
                
                {/* ВЫПАДАЮЩИЙ СПИСОК РЕЖИМОВ (ТОЛЬКО ДЛЯ РАБОТОДАТЕЛЯ) */}
                {user.role === 'employer' && (
                  <div className="dropdown">
                    <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{minWidth: '180px'}}>
                      {searchMode === 'vacancies' ? '🔍 Ищу вакансии' : '👥 Ищу сотрудников'}
                    </button>
                    <ul className="dropdown-menu shadow border-0 rounded-3">
                      <li><button className={`dropdown-item ${searchMode === 'vacancies' ? 'active' : ''}`} onClick={() => { setSearchMode('vacancies'); setHasSearched(false); loadInitialVacancies(); }}>🔍 Ищу вакансии</button></li>
                      <li><button className={`dropdown-item ${searchMode === 'candidates' ? 'active' : ''}`} onClick={() => setSearchMode('candidates')}>👥 Ищу сотрудников</button></li>
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSearchSubmit} className="input-group flex-grow-1">
                  <input 
                    type="text" 
                    className="form-control border-0 ps-3" 
                    placeholder={searchMode === 'vacancies' ? "Название вакансии, компания..." : "Должность, навыки, имя..."} 
                    value={search} 
                    onChange={handleInputChange} 
                  />
                  <button className="btn btn-primary px-4" type="submit">Найти</button>
                </form>

                <button className="btn btn-outline-secondary d-flex align-items-center gap-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#filterPanel">
                  <i className="bi bi-sliders"></i> <span className="d-none d-sm-inline">Фильтры</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ПАНЕЛЬ ФИЛЬТРОВ (OFFCANVAS) */}
      <div className="offcanvas offcanvas-end w-75" tabIndex="-1" id="filterPanel" style={{maxWidth: '800px'}}>
        <div className="offcanvas-header border-bottom bg-light">
          <h5 className="offcanvas-title fw-bold">{searchMode === 'vacancies' ? 'Расширенный поиск вакансий' : 'Поиск сотрудников'}</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body bg-white">
          
          {searchMode === 'vacancies' ? (
            /* --- ФИЛЬТРЫ ВАКАНСИЙ --- */
            <div className="row g-4">
              <div className="col-md-6 border-end pe-md-4">
                <h6 className="fw-bold mb-3 text-primary">Ключевые слова</h6>
                <input type="text" name="keywords" className="form-control mb-2" placeholder="например, директор по продажам" value={filters.keywords} onChange={handleFilterChange} />
                <div className="form-check"><input className="form-check-input" type="checkbox" name="inTitle" checked={filters.inTitle} onChange={handleFilterChange} /><label className="form-check-label small">в названии вакансии</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" name="inCompany" checked={filters.inCompany} onChange={handleFilterChange} /><label className="form-check-label small">в названии компании</label></div>
                <div className="form-check mb-3"><input className="form-check-input" type="checkbox" name="inDesc" checked={filters.inDesc} onChange={handleFilterChange} /><label className="form-check-label small">в описании вакансии</label></div>
                
                <h6 className="fw-bold mb-2 text-primary">Исключить слова</h6>
                <input type="text" name="excludeWords" className="form-control mb-3" placeholder="слова через запятую" value={filters.excludeWords} onChange={handleFilterChange} />
                
                <h6 className="fw-bold mb-2 text-primary">Специализация</h6>
                <select name="specialization" className="form-select mb-3" value={filters.specialization} onChange={handleFilterChange}>
                  <option value="">Любая</option>
                  <option value="it">IT / Программирование</option>
                  <option value="marketing">Маркетинг</option>
                  <option value="sales">Продажи</option>
                </select>

                <h6 className="fw-bold mb-2 text-primary">Отрасль компании</h6>
                <select name="industry" className="form-select mb-3" value={filters.industry} onChange={handleFilterChange}>
                  <option value="">Любая</option>
                  <option value="retail">Ритейл</option>
                  <option value="finance">Финансы</option>
                </select>

                <h6 className="fw-bold mb-2 text-primary">Регион</h6>
                <input type="text" name="region" className="form-control mb-2" placeholder="Москва" value={filters.region} onChange={handleFilterChange} />
                
                <h6 className="fw-bold mb-2 text-primary">Район / Метро</h6>
                <input type="text" name="district" className="form-control mb-2" placeholder="Район" value={filters.district} onChange={handleFilterChange} />
                <input type="text" name="metro" className="form-control" placeholder="Метро" value={filters.metro} onChange={handleFilterChange} />
              </div>

              <div className="col-md-6 ps-md-4">
                <h6 className="fw-bold mb-3 text-primary">Уровень дохода</h6>
                <div className="form-check mb-3"><input className="form-check-input" type="checkbox" name="salaryOnly" checked={filters.salaryOnly} onChange={handleFilterChange} /><label className="form-check-label small">Показывать только с указанной зарплатой</label></div>

                <h6 className="fw-bold mb-2 text-primary">Частота выплат</h6>
                <div className="mb-3">
                  {['daily', 'weekly', 'twice_month', 'monthly', 'project'].map(val => (
                    <div key={val} className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="paymentFreq" id={`pf_${val}`} value={val} checked={filters.paymentFreq === val} onChange={handleFilterChange} />
                      <label className="form-check-label small" htmlFor={`pf_${val}`}>
                        {val === 'daily' ? 'Ежедневно' : val === 'weekly' ? 'Раз в неделю' : val === 'twice_month' ? 'Два раза в месяц' : val === 'monthly' ? 'Раз в месяц' : 'За проект'}
                      </label>
                    </div>
                  ))}
                </div>

                <h6 className="fw-bold mb-2 text-primary">Образование</h6>
                <div className="mb-3">
                  {['any', 'mid', 'high'].map(val => (
                    <div key={val} className="form-check">
                      <input className="form-check-input" type="radio" name="education" id={`edu_${val}`} value={val} checked={filters.education === val} onChange={handleFilterChange} />
                      <label className="form-check-label small" htmlFor={`edu_${val}`}>
                        {val === 'any' ? 'Не требуется' : val === 'mid' ? 'Среднее проф.' : 'Высшее'}
                      </label>
                    </div>
                  ))}
                </div>

                <h6 className="fw-bold mb-2 text-primary">Требуемый опыт</h6>
                <select name="experience" className="form-select mb-3" value={filters.experience} onChange={handleFilterChange}>
                  <option value="">Не имеет значения</option>
                  <option value="no">Нет опыта</option>
                  <option value="1-3">От 1 года до 3 лет</option>
                  <option value="3-6">От 3 до 6 лет</option>
                  <option value="6+">Более 6 лет</option>
                </select>

                <h6 className="fw-bold mb-2 text-primary">Тип занятости</h6>
                <div className="mb-3">
                  {[['full', 'Полная'], ['part', 'Частичная'], ['temp', 'Подработка'], ['shift', 'Вахта'], ['gph', 'ГПХ'], ['intern', 'Стажировка']].map(([val, label]) => (
                    <div key={val} className="form-check">
                      <input className="form-check-input" type="checkbox" name="employmentType" value={val} checked={(filters.employmentType||[]).includes(val)} onChange={handleFilterChange} />
                      <label className="form-check-label small">{label}</label>
                    </div>
                  ))}
                </div>

                <h6 className="fw-bold mb-2 text-primary">График работы</h6>
                <div className="mb-3">
                  <div className="form-check"><input className="form-check-input" type="checkbox" name="workSchedule" value="day" checked={(filters.workSchedule||[]).includes('day')} onChange={handleFilterChange} /><label className="form-check-label small">Рабочие часы в день</label></div>
                  <div className="form-check"><input className="form-check-input" type="checkbox" name="workSchedule" value="night" checked={(filters.workSchedule||[]).includes('night')} onChange={handleFilterChange} /><label className="form-check-label small">Вечерние/ночные смены</label></div>
                </div>

                <h6 className="fw-bold mb-2 text-primary">Формат работы</h6>
                <div className="mb-3">
                  {[['office', 'На месте'], ['remote', 'Удалённо'], ['hybrid', 'Гибрид'], ['travel', 'Разъездной']].map(([val, label]) => (
                    <div key={val} className="form-check">
                      <input className="form-check-input" type="checkbox" name="workFormat" value={val} checked={(filters.workFormat||[]).includes(val)} onChange={handleFilterChange} />
                      <label className="form-check-label small">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* --- ФИЛЬТРЫ СОТРУДНИКОВ --- */
            <div className="row g-4">
              <div className="col-md-6 border-end pe-md-4">
                <h6 className="fw-bold mb-3 text-primary">Профессиональные навыки</h6>
                <input type="text" name="candSkills" className="form-control mb-2" placeholder="React, Python, Figma..." value={filters.candSkills} onChange={handleFilterChange} />
                <small className="text-muted d-block mb-3">Перечислите ключевые технологии через запятую</small>

                <h6 className="fw-bold mb-2 text-primary">Желаемая должность</h6>
                <input type="text" name="candPosition" className="form-control mb-3" placeholder="Frontend-разработчик" value={filters.candPosition} onChange={handleFilterChange} />

                <h6 className="fw-bold mb-2 text-primary">Образование</h6>
                <select name="candEducation" className="form-select mb-3" value={filters.candEducation} onChange={handleFilterChange}>
                  <option value="">Любое</option>
                  <option value="high">Высшее</option>
                  <option value="mid">Среднее профессиональное</option>
                  <option value="courses">Курсы / Самообразование</option>
                </select>

                <h6 className="fw-bold mb-2 text-primary">Опыт работы</h6>
                <select name="candExperience" className="form-select mb-3" value={filters.candExperience} onChange={handleFilterChange}>
                  <option value="">Не имеет значения</option>
                  <option value="no">Нет опыта</option>
                  <option value="1-3">От 1 года до 3 лет</option>
                  <option value="3-6">От 3 до 6 лет</option>
                  <option value="6+">Более 6 лет</option>
                </select>

                <h6 className="fw-bold mb-2 text-primary">Возраст</h6>
                <div className="d-flex gap-2 mb-3">
                  <input type="number" name="candAgeFrom" className="form-control" placeholder="От" value={filters.candAgeFrom} onChange={handleFilterChange} />
                  <input type="number" name="candAgeTo" className="form-control" placeholder="До" value={filters.candAgeTo} onChange={handleFilterChange} />
                </div>
              </div>

              <div className="col-md-6 ps-md-4">
                <h6 className="fw-bold mb-3 text-primary">География</h6>
                <input type="text" name="candCity" className="form-control mb-3" placeholder="Город проживания" value={filters.candCity} onChange={handleFilterChange} />

                <h6 className="fw-bold mb-2 text-primary">Ожидаемый доход</h6>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">от</span>
                  <input type="number" name="candSalaryExpect" className="form-control" placeholder="100000" value={filters.candSalaryExpect} onChange={handleFilterChange} />
                  <span className="input-group-text bg-light">₽</span>
                </div>

                <h6 className="fw-bold mb-2 text-primary">Тип занятости</h6>
                <div className="mb-3">
                  {[['full','Полная занятость'],['part','Частичная'],['project','Проектная'],['intern','Стажировка']].map(([v,l])=>(
                    <div key={v} className="form-check">
                      <input className="form-check-input" type="checkbox" name="candEmployment" value={v} checked={(filters.candEmployment||[]).includes(v)} onChange={handleFilterChange}/>
                      <label className="form-check-label small">{l}</label>
                    </div>
                  ))}
                </div>

                <h6 className="fw-bold mb-2 text-primary">Формат работы</h6>
                <div className="mb-3">
                  {[['office','Офис'],['remote','Удалённо'],['hybrid','Гибрид']].map(([v,l])=>(
                    <div key={v} className="form-check">
                      <input className="form-check-input" type="checkbox" name="candWorkFormat" value={v} checked={(filters.candWorkFormat||[]).includes(v)} onChange={handleFilterChange}/>
                      <label className="form-check-label small">{l}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
        <div className="offcanvas-footer p-3 border-top bg-light d-flex justify-content-between">
          <button onClick={resetFilters} className="btn btn-outline-secondary">Сбросить</button>
          <button onClick={applyFilters} className="btn btn-primary px-5 fw-bold rounded-pill">Применить фильтры</button>
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ (3 колонки) */}
      <div className="row g-4">
        <div className="col-lg-3 mb-4">
          <h5 className="mb-3 fw-bold">По направлениям</h5>
          <ul className="list-group shadow-sm rounded-3 bg-white">
            <li className="list-group-item d-flex justify-content-between align-items-center action-item" onClick={() => handleTagClick('IT')} style={{cursor: 'pointer'}}>IT / Программирование <span className="badge bg-primary rounded-pill">124</span></li>
            <li className="list-group-item d-flex justify-content-between align-items-center action-item" onClick={() => handleTagClick('Маркетинг')} style={{cursor: 'pointer'}}>Маркетинг <span className="badge bg-primary rounded-pill">89</span></li>
            <li className="list-group-item d-flex justify-content-between align-items-center action-item" onClick={() => handleTagClick('Продажи')} style={{cursor: 'pointer'}}>Продажи <span className="badge bg-primary rounded-pill">210</span></li>
            <li className="list-group-item d-flex justify-content-between align-items-center action-item" onClick={() => handleTagClick('Дизайн')} style={{cursor: 'pointer'}}>Дизайн <span className="badge bg-primary rounded-pill">56</span></li>
          </ul>
        </div>

        <div className="col-lg-6 mb-4">
          {searchMode === 'candidates' && hasSearched && (
            <div className="mb-4">
              <h5 className="mb-3 fw-bold">🔍 Найденные сотрудники ({candidates.length})</h5>
              {candidates.length === 0 ? <div className="alert alert-light text-center">Никого не найдено.</div> : candidates.map((c) => (
                <div key={c._id} className="card job-card mb-3 border-0 bg-white rounded-3 shadow-sm">
                  <div className="card-body">
                    <h6 className="fw-bold mb-1">{c.fullName}</h6>
                    <p className="text-muted small mb-2"><i className="bi bi-geo-alt me-1"></i>{c.city} • {c.experience} опыта</p>
                    <p className="small text-secondary mb-2"><strong>Навыки:</strong> {c.skills}</p>
                    <span className="badge bg-success rounded-pill">Открыт к предложениям</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchMode === 'vacancies' && (
            <>
              <h5 className="mb-3 fw-bold">{hasSearched ? `🔍 Результаты (${vacancies.length})` : '🔥 Свежие вакансии'}</h5>
              {vacancies.length === 0 ? (
                 <div className="alert alert-info text-center border-0 shadow-sm py-4">
                   {hasSearched ? 'Вакансии не найдены.' : 'Пока нет вакансий.'}
                   {!hasSearched && isLoggedIn && user.role === 'employer' && <Link to="/create-vacancy" className="btn btn-primary mt-3 rounded-pill">Создать первую</Link>}
                 </div>
              ) : (
                vacancies.map((v) => (
                  <div key={v._id} className="card job-card mb-3 border-0 bg-white rounded-3 shadow-sm position-relative overflow-hidden">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="pe-3">
                          <h6 className="fw-bold mb-1 fs-5 text-dark">{v.title}</h6>
                          <p className="text-muted small mb-2 d-flex align-items-center gap-2">
                            <span><i className="bi bi-building me-1"></i>{v.company}</span>
                            <span className="text-muted">•</span>
                            <span><i className="bi bi-geo-alt me-1"></i>{v.city || 'Удалённо'}</span>
                          </p>
                          <p className="small text-secondary mb-3 line-clamp-2" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{v.description}</p>
                          <span className="badge bg-light text-primary border rounded-pill px-3 py-2 fw-bold">{v.salary || 'Зарплата не указана'}</span>
                        </div>
                        {v.createdBy?.name && (
                          <span className="verified-badge rounded-pill bg-success bg-opacity-10 text-success px-2 py-1 d-flex align-items-center gap-1 fw-bold" style={{fontSize: '0.8rem'}}>
                            <i className="bi bi-patch-check-fill"></i> Проверено
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {!hasSearched && <div className="text-center mt-4"><Link to="/vacancies" className="btn btn-outline-primary px-4 rounded-pill">Все вакансии</Link></div>}
              {hasSearched && <div className="text-center mt-4"><button onClick={() => { setHasSearched(false); setSearch(''); loadInitialVacancies(); }} className="btn btn-link text-decoration-none">Сбросить поиск</button></div>}
            </>
          )}
        </div>

        <div className="col-lg-3 mb-4">
          <h5 className="mb-3 fw-bold">Крупные компании</h5>
          <ul className="list-group shadow-sm rounded-3 bg-white">
            <li className="list-group-item d-flex align-items-center border-0 py-3 action-item" onClick={() => handleTagClick('Яндекс')} style={{cursor: 'pointer'}}><img src="/icons8-yandex.png" alt="Y" className="me-3 rounded" width="32" height="32" style={{objectFit: 'contain'}} /> <span className="fw-medium">Яндекс</span></li>
            <li className="list-group-item d-flex align-items-center border-0 py-3 action-item" onClick={() => handleTagClick('Сбер')} style={{cursor: 'pointer'}}><img src="/icons8-sber.png" alt="S" className="me-3 rounded" width="32" height="32" style={{objectFit: 'contain'}} /> <span className="fw-medium">Сбер</span></li>
            <li className="list-group-item d-flex align-items-center border-0 py-3 action-item" onClick={() => handleTagClick('Т-Банк')} style={{cursor: 'pointer'}}><img src="/free-png.ru-125.png" alt="T" className="me-3 rounded" width="32" height="32" style={{objectFit: 'contain'}} /> <span className="fw-medium">Т-Банк</span></li>
            <li className="list-group-item d-flex align-items-center border-0 py-3 action-item" onClick={() => handleTagClick('VK')} style={{cursor: 'pointer'}}><img src="/vk-logo.png" alt="V" className="me-3 rounded" width="32" height="32" style={{objectFit: 'contain'}} /> <span className="fw-medium">VK</span></li>
            <li className="list-group-item d-flex align-items-center border-0 py-3 action-item" onClick={() => handleTagClick('Wildberries')} style={{cursor: 'pointer'}}><img src="/wildberries-sign-logo.png" alt="W" className="me-3 rounded" width="32" height="32" style={{objectFit: 'contain'}} /> <span className="fw-medium">Wildberries</span></li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Home;
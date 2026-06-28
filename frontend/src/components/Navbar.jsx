import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top py-2">
      <div className="container">
        {/* ИСПРАВЛЕННЫЙ ЛОГОТИП: жесткие стили для размера */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src="/logo.png" 
            alt="JobLink" 
            style={{ height: '45px', width: 'auto', maxWidth: '150px', objectFit: 'contain' }} 
          />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link fw-medium" to="/">Главная</Link></li>
            <li className="nav-item"><Link className="nav-link fw-medium" to="/vacancies">Вакансии</Link></li>
            <li className="nav-item"><Link className="nav-link fw-medium" to="/faq">FAQ</Link></li>
          </ul>

          <ul className="navbar-nav ms-auto align-items-center">
            {token ? (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center shadow-sm" style={{width: '36px', height: '36px'}}>
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
                  <li><Link className="dropdown-item py-2" to="/profile"><i className="bi bi-person me-2 text-primary"></i>Профиль</Link></li>
                  <li><Link className="dropdown-item py-2" to="/resume"><i className="bi bi-file-text me-2 text-primary"></i>Моё резюме</Link></li>
                  {user.role === 'employer' && (
                    <li><Link className="dropdown-item py-2" to="/create-vacancy"><i className="bi bi-plus-circle me-2 text-success"></i>Добавить вакансию</Link></li>
                  )}
                  <li><hr className="dropdown-divider my-1"/></li>
                  <li><button className="dropdown-item py-2 text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Выйти</button></li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link fw-medium" to="/login">Войти</Link></li>
                <li className="nav-item ms-2"><Link className="btn btn-primary rounded-pill px-3" to="/register">Регистрация</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
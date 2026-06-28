import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Resume from './pages/Resume';
import Vacancies from './pages/Vacancies';
import CreateVacancy from './pages/CreateVacancy';
import EditVacancy from './pages/EditVacancy';
import Faq from './pages/Faq';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const token = localStorage.getItem('token');

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      
      {/* ДОБАВЛЕН КЛАСС container ДЛЯ ЦЕНТРИРОВАНИЯ И ОТСТУПОВ */}
      <main className="container py-4 flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/create-vacancy" element={<ProtectedRoute><CreateVacancy /></ProtectedRoute>} />
          <Route path="/vacancies/:id/edit" element={<ProtectedRoute><EditVacancy /></ProtectedRoute>} />
          <Route path="/faq" element={<Faq />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <footer className="bg-white border-top py-4 mt-auto position-relative">
        <div className="container">
          <div className="row text-center text-muted small">
            <div className="col-md-4 mb-2">
              <strong className="d-block mb-2 text-dark">О нас</strong>
              JobLink — платформа для поиска работы и подбора персонала.
            </div>
            <div className="col-md-4 mb-2">
              <strong className="d-block mb-2 text-dark">Контакты</strong>
              example@gmail.com | +7 (495) 123-45-67
            </div>
            <div className="col-md-4 mb-2">
              <strong className="d-block mb-2 text-dark">Поддержка</strong>
              <a href="/faq" className="text-decoration-none text-muted">FAQ</a> | 
              <a href="#" className="text-decoration-none text-muted ms-2">Связаться</a>
            </div>
          </div>
          <div className="text-center text-muted small mt-3">
            © 2026 JobLink. Все права защищены.
          </div>
        </div>
        {/* Пингвины */}
        <div className="position-absolute" style={{ bottom: '100%', left: '5%', width: '60px', zIndex: 10 }}>
          <img src="/free-icon-penguin-826912.png" alt="Penguin" className="img-fluid" />
        </div>
        <div className="position-absolute" style={{ bottom: '100%', right: '5%', width: '60px', zIndex: 10 }}>
          <img src="/free-icon-penguin-2569877.png" alt="Penguin" className="img-fluid" />
        </div>
      </footer>
    </div>
  );
}

export default App;
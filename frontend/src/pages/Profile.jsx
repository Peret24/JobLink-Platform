function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="card shadow-sm border-0 rounded-3 bg-white">
          <div className="card-body p-4 text-center">
            <div className="mx-auto mb-3 bg-light rounded-circle d-flex justify-content-center align-items-center p-3" style={{width: '100px', height: '100px'}}>
              {/* Путь исправлен на корень public */}
              <img src="/free-icon-user-icon-4360835.png" alt="User" className="img-fluid" style={{maxWidth: '60%'}} />
            </div>
            
            <h2 className="h4 fw-bold mb-1 text-dark">{user.name || 'Пользователь'}</h2>
            <p className="text-muted mb-4">{user.email}</p>
            
            <div className="d-grid gap-2 col-8 mx-auto">
              <div className="alert alert-light border rounded-3 text-start bg-white">
                <small className="text-muted d-block mb-1">Ваша роль:</small>
                <span className="fw-bold text-primary">
                  {user.role === 'employer' ? 'Работодатель' : 'Соискатель'}
                </span>
              </div>
              
              {user.role === 'employer' && (
                <div className="alert alert-light border rounded-3 text-start bg-white">
                  <small className="text-muted d-block mb-1">Статус:</small>
                  <span className="fw-bold text-success"><i className="bi bi-check-circle-fill me-1"></i>Верифицирован</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
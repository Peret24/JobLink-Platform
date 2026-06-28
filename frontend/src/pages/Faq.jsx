function Faq() {
  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="text-center mb-4">Часто задаваемые вопросы</h1>
          <div className="accordion" id="faqAccordion">
            
            <div className="accordion-item">
              <h2 className="accordion-header" id="heading1">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1">
                  Как зарегистрироваться?
                </button>
              </h2>
              <div id="collapse1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Нажмите кнопку "Регистрация" в правом верхнем углу. Выберите роль: Соискатель или Работодатель.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="heading2">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2">
                  Бесплатно ли размещение резюме?
                </button>
              </h2>
              <div id="collapse2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Да, создание и публикация резюме полностью бесплатны.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="heading3">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3">
                  Как добавить вакансию?
                </button>
              </h2>
              <div id="collapse3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Зарегистрируйтесь как работодатель, перейдите в профиль и нажмите "Добавить вакансию".
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Faq;
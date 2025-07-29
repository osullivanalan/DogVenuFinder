function Header() {
  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <i className="fas fa-dog"></i>
            Dog Friendly
          </h1>
          <div className="legend">
            <div className="legend-content">
              <div className="legend-item">
                <div className="legend-marker cafe"></div>
                <span>Cafe</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker restaurant"></div>
                <span>Eat</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker pub"></div>
                <span>Pub</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker park"></div>
                <span>Park</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker outdoor-only">T</div>
                <span>Out</span>
              </div>
            </div>
          </div>
        </div>
      </header>


    </>
  );
}

export default Header;
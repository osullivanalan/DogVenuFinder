function Header({ onMyLocationClick }) {
  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <i className="fas fa-dog"></i>
            Dog-Friendly Ireland
          </h1>
          <div className="header-controls">
            <button id="location-btn" className="btn btn--secondary btn--sm" onClick={onMyLocationClick}>
              <i className="fas fa-crosshairs"></i>
              My Location
            </button>
          </div>
        </div>
      </header>

      <div className="legend">
        <div className="legend-content">
          <div className="legend-item">
            <div className="legend-marker cafe"></div>
            <span>Cafes</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker restaurant"></div>
            <span>Restaurants</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker pub"></div>
            <span>Pubs</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker outdoor-only">T</div>
            <span>Terrace Only</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
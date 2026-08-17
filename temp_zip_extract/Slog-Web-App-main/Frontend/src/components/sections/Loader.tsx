import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="page-loader">
      <div className="loader-content">
        <span className="truck">🚚</span>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Loader;

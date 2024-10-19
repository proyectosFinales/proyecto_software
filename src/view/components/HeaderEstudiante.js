import React, { useState } from 'react';
import styles from './Header.module.css';
import SidebarEstudiante from './SidebarCoordinador';
import SettingsEstudiante from './SettingsCoordinador';

const HeaderEstudiante = ({title}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);
  return (
    <div>
    <div className={styles.header}>
      <button className={styles.menuIcon} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        &#9776;
      </button>
      <button className={styles.settingsIcon} onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}>
          <i className="fas fa-cog"></i>
        </button>
      <h1>{title}</h1>
    </div>
    <div>
    <SidebarEstudiante show={isMenuOpen} />
    <SettingsEstudiante show={isMenuOpenSettings} />
    </div>
    </div>
  );
};

export default HeaderEstudiante;
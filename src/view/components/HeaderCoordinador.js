import React, { useState } from 'react';
import styles from './Header.module.css';
import SidebarCoordinador from './SidebarCoordinador';
import SettingsCoordinador from './SettingsCoordinador';

const HeaderCoordinador = ({title}) => {
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
    <SidebarCoordinador show={isMenuOpen} />
    <SettingsCoordinador show={isMenuOpenSettings} />
    </div>
    </div>
  );
};

export default HeaderCoordinador;
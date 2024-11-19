import React, { useState } from 'react';
import styles from './Header.module.css';
import SidebarProfesor from './SidebarProfesor';
import SettingsProfesor from './SettingsProfesor';

const HeaderProfesor = ({title}) => {
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
    <SidebarProfesor show={isMenuOpen} />
    <SettingsProfesor show={isMenuOpenSettings} />
    </div>
    </div>
  );
};

export default HeaderProfesor;
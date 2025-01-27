import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SettingsProfesor from '../components/SettingsProfesor';
import Header from '../components/HeaderProfesor';

const Machotes = () => {

  const menuItems = [
    { to: "/actaDefensa", icon: "fa-solid fa-person-chalkboard", text: "Acta de defensa pública" },
    { to: "/constancia", icon: "fa-solid fa-file-signature", text: "Constancia de defensa pública" },
    { to: "/actaEntrega", icon: "fa-solid fa-file-invoice", text: "Acta de entrega del informe final" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Seleccione una plantilla" />

      <main className="flex-grow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              to={item.to} 
              className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <i className={`${item.icon} text-azul text-5xl mb-4`}></i>
              <p className="text-center text-gray-700 font-semibold text-lg">{item.text}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Machotes;

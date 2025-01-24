import React from 'react';
import Header from '../components/Header';
import Assignations from '../components/Assignations';

function Asignacion() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex justify-center items-center p-6">
        <div className="bg-white shadow-md rounded p-6 w-full max-w-3xl">
          <h2 className="text-xl font-bold mb-4">Asignaciones</h2>
          <Assignations />
        </div>
      </main>
      <footer className="text-center py-4 border-t">
        <p className="text-sm text-gray-600">Instituto Tecnológico de Costa Rica 2024</p>
      </footer>
    </div>
  );
}

export default Asignacion;

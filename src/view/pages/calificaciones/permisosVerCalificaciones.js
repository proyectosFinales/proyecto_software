import React, { useState } from 'react';
import { Search, Download, Filter, RefreshCw } from 'lucide-react';
import HeaderCoordinador from '../../components/HeaderCoordinador';
import Footer from '../../components/Footer';
import { successToast, errorToast } from '../../components/toast';

const PermisosVerCalificaciones = () => {
  // Sample data - replace with real data later
  const [professors, setProfessors] = useState([
    { id: 1, name: 'Dr. Juan Pérez', department: 'Computación', canViewReviews: true, lastUpdated: '2024-03-15' },
    { id: 2, name: 'Dra. María González', department: 'Matemáticas', canViewReviews: false, lastUpdated: '2024-03-14' },
    { id: 3, name: 'Dr. Carlos Rodríguez', department: 'Ingeniería', canViewReviews: true, lastUpdated: '2024-03-13' },
    { id: 4, name: 'Dra. Ana Martínez', department: 'Computación', canViewReviews: false, lastUpdated: '2024-03-12' },
    { id: 5, name: 'Dr. Roberto Sánchez', department: 'Matemáticas', canViewReviews: true, lastUpdated: '2024-03-11' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const handleTogglePermission = (professorId) => {
    setProfessors(professors.map(prof => {
      if (prof.id === professorId) {
        const newValue = !prof.canViewReviews;
        // Show success toast
        successToast(`Permisos actualizados para ${prof.name}`);
        return { ...prof, canViewReviews: newValue, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return prof;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderCoordinador title="Gestión de Permisos" />
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Permisos de Visualización de Calificaciones
            </h1>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center px-3 py-2 bg-white rounded-lg shadow hover:bg-gray-50 text-sm">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <button className="flex items-center px-3 py-2 bg-white rounded-lg shadow hover:bg-gray-50 text-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar profesor..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">Todos los departamentos</option>
                <option value="computacion">Computación</option>
                <option value="matematicas">Matemáticas</option>
                <option value="ingenieria">Ingeniería</option>
              </select>
            </div>
          </div>

          {/* Professors Table - Mobile View */}
          <div className="block sm:hidden">
            <div className="space-y-4">
              {professors.map((professor) => (
                <div key={professor.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{professor.name}</h3>
                      <p className="text-sm text-gray-500">{professor.department}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      professor.canViewReviews 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {professor.canViewReviews ? 'Acceso Permitido' : 'Sin Acceso'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Actualizado: {professor.lastUpdated}
                    </span>
                    <button
                      onClick={() => handleTogglePermission(professor.id)}
                      className={`px-3 py-1 rounded-md text-white text-sm ${
                        professor.canViewReviews
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {professor.canViewReviews ? 'Revocar' : 'Dar Acceso'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professors Table - Desktop View */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profesor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Actualización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {professors.map((professor) => (
                    <tr key={professor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{professor.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{professor.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          professor.canViewReviews 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {professor.canViewReviews ? 'Acceso Permitido' : 'Sin Acceso'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {professor.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleTogglePermission(professor.id)}
                          className={`px-4 py-2 rounded-md text-white ${
                            professor.canViewReviews
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {professor.canViewReviews ? 'Revocar Acceso' : 'Dar Acceso'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PermisosVerCalificaciones;

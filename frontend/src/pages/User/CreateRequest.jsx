import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { requestService } from '../../services/request.service';

const CreateRequest = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        amount: Number(data.amount)
      };

      await requestService.create(payload);
      navigate('/user');
    } catch (error) {
      console.error(error);
      setServerError('Hubo un error al crear la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Solicitud</h2>

        {serverError && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Campo: TIPO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud</label>
            <select
              {...register('type', { required: 'Selecciona un tipo' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Seleccionar --</option>
              <option value="VACACIONES">Vacaciones</option>
              <option value="LICENCIA">Licencia Médica</option>
              <option value="GENERAL">Asuntos Generales</option>
              <option value="GASTOS">Reembolso de Gastos</option>
            </select>
            {errors.type && <span className="text-red-500 text-xs">{errors.type.message}</span>}
          </div>

          {/* Campo: MONTO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto (o Días)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { 
                required: 'Ingresa un monto o valor (puede ser 0)',
                min: { value: 0, message: 'El valor no puede ser negativo' }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.amount && <span className="text-red-500 text-xs">{errors.amount.message}</span>}
          </div>

          {/* Campo: DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Motivo</label>
            <textarea
              rows="4"
              placeholder="Describe brevemente tu solicitud..."
              {...register('description', { required: 'La descripción es obligatoria' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Solicitud'}
            </button>
            
            <Link 
              to="/user" 
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 text-center transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
import { useState, useEffect } from 'react';
import { serviciosService } from '../services';
import Swal from 'sweetalert2';

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const data = await serviciosService.getAll();
      setServicios(data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitar = (servicio) => {
    Swal.fire({
      title: `Solicitar: ${servicio.nombre}`,
      html: `
        <div class="text-start">
          <p>${servicio.descripcion}</p>
          <p><strong>Precio:</strong> $${parseFloat(servicio.precio).toFixed(2)}</p>
          <hr>
          <form id="solicitudForm">
            <div class="mb-3">
              <label class="form-label">Nombre</label>
              <input type="text" class="form-control" id="nombre" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Correo</label>
              <input type="email" class="form-control" id="correo" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Teléfono</label>
              <input type="tel" class="form-control" id="telefono" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Mensaje</label>
              <textarea class="form-control" id="mensaje" rows="3"></textarea>
            </div>
          </form>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const telefono = document.getElementById('telefono').value;
        const mensaje = document.getElementById('mensaje').value;

        if (!nombre || !correo || !telefono) {
          Swal.showValidationMessage('Por favor completa todos los campos');
          return false;
        }

        return { nombre, correo, telefono, mensaje };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: '¡Solicitud enviada!',
          text: 'Nos pondremos en contacto contigo pronto',
          timer: 2000
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 pt-44 md:pt-60">
      <div className="text-center mb-5">
        <h1><i className="fas fa-tools"></i> Servicios Técnicos</h1>
        <p className="lead text-muted">Soluciones profesionales para todas tus necesidades tecnológicas</p>
      </div>

      <div className="row g-4">
        {servicios.map(servicio => (
          <div key={servicio.id} className="col-md-6">
            <div className="card h-100 shadow-sm hover-card">
              <div className="card-body p-4">
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-primary text-white rounded-circle p-3 me-3">
                    <i className="fas fa-wrench fa-2x"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h4 className="card-title mb-2">{servicio.nombre}</h4>
                    <p className="card-text text-muted">{servicio.descripcion}</p>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">Precio:</span>
                    <h3 className="text-primary mb-0">${parseFloat(servicio.precio).toFixed(2)}</h3>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSolicitar(servicio)}
                  >
                    <i className="fas fa-paper-plane"></i> Solicitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-5">
        <div className="col-md-12">
          <div className="card bg-light">
            <div className="card-body text-center p-5">
              <h3>¿Necesitas un servicio personalizado?</h3>
              <p className="text-muted mb-4">Contáctanos y cuéntanos qué necesitas. Ofrecemos soluciones a medida.</p>
              <button className="btn btn-primary btn-lg">
                <i className="fas fa-envelope"></i> Contactar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Servicios;

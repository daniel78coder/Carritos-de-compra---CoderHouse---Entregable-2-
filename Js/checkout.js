document.addEventListener("DOMContentLoaded", () => {
  const botonFinalizar = document.getElementById("finalizar-compra");

  if (botonFinalizar) {
    botonFinalizar.addEventListener("click", async () => {
      // Verificar que hay productos en el carrito
      if (carrito.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Carrito vacío",
          text: "Agregá productos al carrito antes de finalizar la compra"
        });
        return;
      }

      // Verificar que el usuario esté logueado
      const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
      if (!usuarioActivo) {
        Swal.fire({
          icon: "warning",
          title: "Iniciar sesión",
          text: "Tenés que iniciar sesión para finalizar la compra"
        });
        return;
      }

      try {
        // Primer paso: datos básicos
        const { value: datos } = await Swal.fire({
          title: "Datos de entrega",
          html:
            '<input id="swal-nombre" class="swal2-input" placeholder="Nombre completo">' +
            '<input id="swal-direccion" class="swal2-input" placeholder="Dirección de entrega">' +
            '<input id="swal-telefono" class="swal2-input" placeholder="Teléfono (solo números)" type="tel">' +
            '<input id="swal-email" class="swal2-input" placeholder="Email" type="email">' +
            '<select id="swal-pago" class="swal2-input">' +
            '  <option disabled selected>Seleccionar forma de pago</option>' +
            '  <option value="efectivo">Efectivo</option>' +
            '  <option value="transferencia">Transferencia</option>' +
            '</select>',
          focusConfirm: false,
          preConfirm: () => {
            const nombre = document.getElementById("swal-nombre").value.trim();
            const direccion = document.getElementById("swal-direccion").value.trim();
            const telefono = document.getElementById("swal-telefono").value.trim();
            const email = document.getElementById("swal-email").value.trim();
            const pago = document.getElementById("swal-pago").value;

            // Validaciones
            if (!nombre || !direccion || !telefono || !email || pago === "Seleccionar forma de pago") {
              Swal.showValidationMessage("Completá todos los campos");
              return false;
            }

            // Validar teléfono (solo números)
            if (!/^\d+$/.test(telefono)) { /* esto hace la validacion de telefono */
              Swal.showValidationMessage("El teléfono debe contener solo números");
              return false;
            }

            // Validar email básico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; /* esto hace la validacion de email */
            if (!emailRegex.test(email)) {
              Swal.showValidationMessage("Ingresá un email válido");
              return false;
            }

            return { nombre, direccion, telefono, email, pago };
          }
        });

        if (!datos) return;

        let datosPago = {};

        if (datos.pago === "transferencia") {
          const { value: banco } = await Swal.fire({
            title: "Datos bancarios",
            html:
              '<select id="banco" class="swal2-input">' +
              '  <option disabled selected>Seleccionar banco</option>' +
              '  <option>Banco Nación</option>' +
              '  <option>Santander</option>' +
              '  <option>Galicia</option>' +
              '</select>' +
              '<input id="cbu-alias" class="swal2-input" placeholder="CBU o Alias">',
            focusConfirm: false,
            preConfirm: () => {
              const banco = document.getElementById("banco").value;
              const cbuAlias = document.getElementById("cbu-alias").value.trim();

              if (banco === "Seleccionar banco" || !cbuAlias) {
                Swal.showValidationMessage("Completá todos los campos");
                return false;
              }

              return { banco, cbuAlias };
            }
          });

          if (!banco) return;
          datosPago = banco;
        }

        // Calcular totales
        const totalProductos = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

        // Crear resumen completo de la compra
        const resumen = {
          usuario: usuarioActivo.usuario,
          datosPersonales: datos,
          datosPago: datosPago,
          productos: carrito.map(item => ({
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
          })),
          totales: {
            cantidadItems: totalItems,
            montoTotal: totalProductos
          },
          fecha: new Date().toLocaleString('es-AR')
        };

        // Mostrar recibo
        let htmlResumen = `
          <div style="text-align: left; max-height: 400px; overflow-y: auto;">
            <h3>🧾 COMPROBANTE DE COMPRA</h3>
            <hr>
            <p><strong>📅 Fecha:</strong> ${resumen.fecha}</p>
            <p><strong>👤 Usuario:</strong> ${resumen.usuario}</p>
            <hr>
            <h4>📋 Datos de Entrega:</h4>
            <p><strong>Nombre:</strong> ${datos.nombre}</p>
            <p><strong>Dirección:</strong> ${datos.direccion}</p>
            <p><strong>Teléfono:</strong> ${datos.telefono}</p>
            <p><strong>Email:</strong> ${datos.email}</p>
            <p><strong>Método de Pago:</strong> ${datos.pago.charAt(0).toUpperCase() + datos.pago.slice(1)}</p>
        `;

        if (datos.pago === "transferencia") {
          htmlResumen += `
            <p><strong>Banco:</strong> ${datosPago.banco}</p>
            <p><strong>CBU/Alias:</strong> ${datosPago.cbuAlias}</p>
          `;
        }

        htmlResumen += `
            <hr>
            <h4>🛒 Productos:</h4>
        `;

        resumen.productos.forEach(prod => {
          htmlResumen += `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>${prod.nombre} x${prod.cantidad}</span>
              <span>$${prod.subtotal}</span>
            </div>
          `;
        });

        htmlResumen += `
            <hr>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
              <span>TOTAL (${totalItems} items):</span>
              <span>$${totalProductos}</span>
            </div>
            <hr>
            <p style="text-align: center; margin-top: 15px;"><em>¡Gracias por tu compra! 🎉</em></p>
          </div>
        `;

        await Swal.fire({
          title: "¡Compra Realizada con Éxito!",
          html: htmlResumen,
          confirmButtonText: "Finalizar",
          width: 600
        });

        // Limpiar carrito después que la compra sea exitosa
        carrito = [];
        actualizarCarrito();
        guardarCarrito();

        // Guardar historial de compras 
        let historial = JSON.parse(localStorage.getItem("historialCompras")) || [];
        historial.push(resumen);
        localStorage.setItem("historialCompras", JSON.stringify(historial));

        Toastify({
          text: "¡Compra finalizada con éxito! 🎉",
          duration: 4000,
          gravity: "top",
          position: "center",
          style: { background: "#28a745" }
        }).showToast();

      } catch (error) {
        console.error("Error en checkout:", error);
        Swal.fire({
          icon: "error",
          title: "Error al procesar la compra",
          text: "Ocurrió un error inesperado. Intentá nuevamente."
        });
      }
    });
  }
});
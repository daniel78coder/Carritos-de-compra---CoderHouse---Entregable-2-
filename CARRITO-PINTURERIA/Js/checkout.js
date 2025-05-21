document.addEventListener("DOMContentLoaded", () => {
  const botonFinalizar = document.getElementById("finalizar-compra");

  if (botonFinalizar) {
    botonFinalizar.addEventListener("click", async () => {
      try {
        const { value: datos } = await Swal.fire({
          title: "Datos de entrega",
          html:
            '<input id="swal-nombre" class="swal2-input" placeholder="Nombre completo">' +
            '<input id="swal-direccion" class="swal2-input" placeholder="Dirección de entrega">' +
            '<input id="swal-telefono" class="swal2-input" placeholder="Teléfono">' +
            '<select id="swal-pago" class="swal2-input">' +
            '  <option disabled selected>Seleccionar forma de pago</option>' +
            '  <option>Efectivo</option>' +
            '  <option>Transferencia</option>' +
            '  <option>Tarjeta de Crédito</option>' +
            '</select>',
          focusConfirm: false,
          preConfirm: () => {
            const nombre = document.getElementById("swal-nombre").value;
            const direccion = document.getElementById("swal-direccion").value;
            const telefono = document.getElementById("swal-telefono").value;
            const pago = document.getElementById("swal-pago").value;

            if (!nombre || !direccion || !telefono || pago === "Seleccionar forma de pago") {
              Swal.showValidationMessage("Completá todos los campos");
              return false;
            }

            return { nombre, direccion, telefono, pago };
          }
        });

        if (datos) {
          // Simulo un envío de datos con fetch 
          const respuesta = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
          });

          if (!respuesta.ok) {
            throw new Error("No se pudo enviar la compra");
          }

          Toastify({
            text: "Compra enviada con éxito 🎉",
            duration: 4000,
            gravity: "top",
            position: "center",
            style: {
              background: "#28a745",
            }
          }).showToast();

          Swal.fire({
            icon: "success",
            title: "¡Gracias por tu compra!",
            html: `
              <p><strong>Nombre:</strong> ${datos.nombre}</p>
              <p><strong>Dirección:</strong> ${datos.direccion}</p>
              <p><strong>Teléfono:</strong> ${datos.telefono}</p>
              <p><strong>Pago:</strong> ${datos.pago}</p>
            `,
            confirmButtonText: "Aceptar"
          });

          // Limpio el carrito
          carrito = [];
          actualizarCarrito();
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al procesar la compra",
          text: error.message
        });
      }
    });
  }
});

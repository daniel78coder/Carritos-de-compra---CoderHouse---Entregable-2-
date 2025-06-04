let productos = [];
let carrito = [];

const contenedorProductos = document.querySelector(".grid-productos");
const contenedorCarrito = document.getElementById("items-carrito");
const totalPrecio = document.getElementById("total-precio");
const contadorCarrito = document.getElementById("contador-carrito");

// Cargar productos desde JSON local
async function cargarProductos() {
    try {
        const response = await fetch("./productos.json");
        if (!response.ok) {
            throw new Error("No se pudo cargar el archivo de productos");
        }
        productos = await response.json();
        renderProductos();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los productos"
        });
    }
}

// Cargar carrito localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

// Guardar en localStorage
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function renderProductos() {
    contenedorProductos.innerHTML = "";
    productos.forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}">
            <h3>${prod.nombre}</h3>
            <p>$${prod.precio}</p>
            <button class="agregar" data-id="${prod.id}">Agregar</button>
        `;
        contenedorProductos.appendChild(div);
    });

    document.querySelectorAll(".agregar").forEach(btn => {
        btn.addEventListener("click", e => {
            const id = parseInt(e.target.dataset.id);
            agregarAlCarrito(id);
        });
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarrito();
    guardarCarrito();

    Toastify({
        text: `${producto.nombre} agregado al carrito`,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#198754"
        }
    }).showToast();
}

function actualizarCarrito() {
    contenedorCarrito.innerHTML = "";
    let total = 0;
    let totalItems = 0;

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = "<p>El carrito está vacío</p>";
    } else {
        // vaciar carrito
        const btnVaciar = document.createElement("button");
        btnVaciar.textContent = "Vaciar Carrito";
        btnVaciar.classList.add("btn-vaciar");
        btnVaciar.onclick = vaciarCarrito;
        contenedorCarrito.appendChild(btnVaciar);

        carrito.forEach((item, index) => {
            const div = document.createElement("div");
            div.classList.add("item-carrito");
            const subtotal = item.precio * item.cantidad;
            div.innerHTML = `
                <div class="item-info">
                    <span class="nombre-producto">${item.nombre}</span>
                    <span class="precio-unitario">$${item.precio} c/u</span>
                </div>
                <div class="cantidad-controls">
                    <button onclick="disminuirCantidad(${index})" class="btn-cantidad">-</button>
                    <span class="cantidad">${item.cantidad}</span>
                    <button onclick="aumentarCantidad(${index})" class="btn-cantidad">+</button>
                </div>
                <div class="item-total">
                    <span class="subtotal">$${subtotal}</span>
                    <button onclick="quitarItem(${index})" class="btn-eliminar">❌</button>
                </div>
            `;
            contenedorCarrito.appendChild(div);
            total += subtotal;
            totalItems += item.cantidad;
        });
    }

    totalPrecio.textContent = total;
    contadorCarrito.textContent = totalItems;
}

function aumentarCantidad(index) {
    carrito[index].cantidad += 1;
    actualizarCarrito();
    guardarCarrito();
}

function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
    } else {
        carrito.splice(index, 1);
    }
    actualizarCarrito();
    guardarCarrito();
}

function quitarItem(index) {
    const nombreProducto = carrito[index].nombre;
    carrito.splice(index, 1);
    actualizarCarrito();
    guardarCarrito();

    Toastify({
        text: `${nombreProducto} eliminado del carrito`,
        duration: 2000,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#dc3545"
        }
    }).showToast();
}

function vaciarCarrito() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Se eliminarán todos los productos del carrito",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            actualizarCarrito();
            guardarCarrito();

            Toastify({
                text: "Carrito vaciado",
                duration: 2000,
                gravity: "bottom",
                position: "right",
                style: {
                    background: "#ffc107"
                }
            }).showToast();
        }
    });
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    cargarCarrito();
    mostrarUsuarioActivo();
});

document.getElementById("btn-login").addEventListener("click", () => {
    Swal.fire({
        title: 'Iniciar sesión o registrarse',
        html:
            '<input id="login-user" class="swal2-input" placeholder="Usuario">' +
            '<input id="login-pass" type="password" class="swal2-input" placeholder="Contraseña">',
        confirmButtonText: 'Ingresar',
        preConfirm: () => {
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value.trim();
            if (!user || !pass) {
                Swal.showValidationMessage('Completá todos los campos');
                return false;
            }

            try {
                let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
                let existente = usuarios.find(u => u.usuario === user);

                if (existente) {
                    if (existente.contraseña === pass) {
                        localStorage.setItem("usuarioActivo", JSON.stringify(existente));
                        return true;
                    } else {
                        Swal.showValidationMessage('Contraseña incorrecta');
                        return false;
                    }
                } else {
                    let nuevoUsuario = { usuario: user, contraseña: pass };
                    usuarios.push(nuevoUsuario);
                    localStorage.setItem("usuarios", JSON.stringify(usuarios));
                    localStorage.setItem("usuarioActivo", JSON.stringify(nuevoUsuario));
                    return true;
                }
            } catch (error) {
                console.error("Error login:", error);
                Swal.showValidationMessage("Error inesperado");
                return false;
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            mostrarUsuarioActivo();
            Toastify({
                text: "Sesión iniciada correctamente",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#28a745"
            }).showToast();
        }
    });
});

function mostrarUsuarioActivo() {
    const activo = JSON.parse(localStorage.getItem("usuarioActivo"));
    const nombreSpan = document.getElementById("nombre-usuario");
    if (activo) {
        nombreSpan.textContent = `👤 ${activo.usuario}`;
        document.getElementById("btn-login").style.display = "none";
    }
}
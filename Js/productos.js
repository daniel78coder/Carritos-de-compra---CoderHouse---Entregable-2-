const productos = [
    { id: 1, nombre: "Barniz Brillante", precio: 15000, imagen: "./imagenes/Barniz Brillante p-Maderas.png" },
    { id: 2, nombre: "Latex Color Azul", precio: 31800, imagen: "./imagenes/Latex Color Azul electricox 10 lts.png" },
    { id: 3, nombre: "Pincel Cerdas Finas medio", precio: 2800, imagen: "./imagenes/Pincel Cerdas Finas medio.png" },
    { id: 4, nombre: "Barniz para Maderas", precio: 18000, imagen: "./imagenes/Barniz P-Maderas.png" },
    { id: 5, nombre: "Enduido Plastico", precio: 11800, imagen: "./imagenes/Enduido Plastico.png" },
    { id: 6, nombre: "Latex Color Verde", precio: 38800, imagen: "./imagenes/Latex Color Verde Mate x 10 lts.png" },
    { id: 7, nombre: "Lijas Anti Empaste", precio: 1500, imagen: "./imagenes/Lijas Anti Empaste.png" },
    { id: 8, nombre: "Lijas Madera y Pared", precio: 1800, imagen: "./imagenes/Lijas Madera y Pared.png" },
    { id: 9, nombre: "Pincel Neon", precio: 2800, imagen: "./imagenes/Pincel Neon.png" },
    { id: 10, nombre: "Rodillo Antigota Pelo Medio", precio: 4800, imagen: "./imagenes/Rodillo Antigota Pelo Medio.png" },
    { id: 11, nombre: "Rodillo Antigota", precio: 4800, imagen: "./imagenes/Rodillo Antigota.png" },
];

let carrito = [];

const contenedorProductos = document.querySelector(".grid-productos");
const contenedorCarrito = document.getElementById("items-carrito");
const totalPrecio = document.getElementById("total-precio");
const contadorCarrito = document.getElementById("contador-carrito");

function renderProductos() {
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
    carrito.push(producto);
    actualizarCarrito();

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

    carrito.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("item-carrito");
        div.innerHTML = `
            <span>${item.nombre} - $${item.precio}</span>
            <button onclick="quitarItem(${index})">❌</button>
        `;
        contenedorCarrito.appendChild(div);
        total += item.precio;
    });

    totalPrecio.textContent = total;
    contadorCarrito.textContent = carrito.length;
}

function quitarItem(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

renderProductos();

// Login / Registro de Usuario
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

window.addEventListener("DOMContentLoaded", mostrarUsuarioActivo);

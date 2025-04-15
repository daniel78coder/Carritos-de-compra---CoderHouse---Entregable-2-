// Proyecto pintureria 
//  tendria que gregar mas colores y averiguar marcas depende de como lo vea el profe

// Productos de la pintureria
const productos = [
    { id: 1, nombre: 'Látex Interior Beige', precio: 15000, litros: 20, marca: 'Alba', color: '#F5F5DC'},
    { id: 2, nombre: 'Látex Blanco', precio: 8500, litros: 10, marca: 'Sherwin', color: '#FFFFFF' },
    { id: 3, nombre: 'Pintura Cielo', precio: 4200, litros: 4, marca: 'Alba', color: '#87CEEB' },
    { id: 4, nombre: 'Esmalte Negro', precio: 3200, litros: 1, marca: 'Tersuave', color: '#000000' }
];

let miCarrito = JSON.parse(localStorage.getItem('carrito')) ?? [];

// Barra de buscar
const buscarProducto = (texto) => {
    const resultado = productos.filter(prod => 
        prod.nombre.toLowerCase().includes(texto.toLowerCase()) || 
        prod.marca.toLowerCase().includes(texto.toLowerCase())
    );
    mostrarResultados(resultado);
}

// Función para mostrar resultados de buscar
function mostrarResultados(productos) {
    const contenedor = document.querySelector('.grid-productos');
    contenedor.innerHTML = '';

    if(productos.length === 0) {
        contenedor.innerHTML = '<p class="no-resultados">No encontramos productos con ese nombre</p>';
        return;
    }

    productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'producto-card';

        const colorMuestra = document.createElement('div');
        colorMuestra.className = 'color-muestra';
        colorMuestra.style.backgroundColor = prod.color;

        const titulo = document.createElement('h3');
        titulo.textContent = prod.nombre;

        const marca = document.createElement('p');
        marca.className = 'marca';
        marca.textContent = prod.marca;

        const litros = document.createElement('p');
        litros.textContent = `${prod.litros}L`;

        const precio = document.createElement('p');
        precio.className = 'precio';
        precio.textContent = `$${prod.precio}`;

        const boton = document.createElement('button');
        boton.textContent = 'Agregar';
        boton.addEventListener('click', () => agregarAlCarrito(prod.id)); 

        card.appendChild(colorMuestra);
        card.appendChild(titulo);
        card.appendChild(marca);
        card.appendChild(litros);
        card.appendChild(precio);
        card.appendChild(boton);

        contenedor.appendChild(card);
    });
}

// Guardar en storage
const guardarEnStorage = () => {
    // valido que el carrito no esté vacio
    if (Array.isArray(miCarrito)) {
        localStorage.setItem('carrito', JSON.stringify(miCarrito));
    }
}

function agregarAlCarrito(id) {
    const productoEncontrado = productos.find(p => p.id === id);
    if (!productoEncontrado) return; // Esto es Por las dudas

    miCarrito.push(productoEncontrado);
    guardarEnStorage();
    actualizarCarrito();
    mostrarNotificacion(`¡Agregaste ${productoEncontrado.marca} ${productoEncontrado.nombre}!`);
}

// Actualizar vista del carrito
function actualizarCarrito() {
    const itemsCarrito =document.getElementById('items-carrito');
    const contador = document.getElementById('contador-carrito');
    const total = document.getElementById('total-precio');
    
    itemsCarrito.innerHTML = '';
    let suma = 0;

    // Agrupar productos iguales
    const productosAgrupados = miCarrito.reduce((acc, item) => {
        if(!acc[item.id]) {
            acc[item.id] = {...item, cantidad: 1};
        }else {
            acc[item.id].cantidad++;
        }
        return acc;
    }, {});

    Object.values(productosAgrupados).forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-carrito';
        div.innerHTML = `
            <p>${item.marca} - ${item.nombre} (${item.cantidad})</p>
            <p>$${item.precio * item.cantidad}</p>
            <button onclick="sacarDelCarrito(${item.id})">Quitar</button>
        `;

        itemsCarrito.appendChild(div);
        suma += item.precio * item.cantidad;
    });

    contador.textContent = miCarrito.length; total.textContent = suma.toLocaleString();
}

// Sacar del carrito 
function sacarDelCarrito(id) {
    const quitar = miCarrito.findIndex(item => item.id === id);
    if( quitar !== -1) {
        miCarrito.splice(quitar, 1);
        guardarEnStorage();
        actualizarCarrito();
    }
}

// Agregué un timeout más largo porque 2s era muy poquito
function mostrarNotificacion(mensaje) {
    const avisar = document.createElement('div');
    avisar.className = 'notificacion';
    avisar.textContent = mensaje;
    document.body.appendChild(avisar);
    setTimeout(() => avisar.remove(), 3000);
}

// aca finalizo la compra
document.getElementById('finalizar-compra').addEventListener('click', () => {
    if (miCarrito.length === 0) {
        mostrarNotificacion('¡El carrito está vacío!');
        return;
    }
    
    const total = miCarrito.reduce((sum, item) => sum + item.precio, 0);
    mostrarNotificacion(`¡Gracias por tu compra! Gastaste: $${total}`);
    miCarrito = [];
    guardarEnStorage();
    actualizarCarrito();
    
});
// actualizar carrito
actualizarCarrito();
mostrarResultados(productos);

// Sidebar ochish/yopish funksiyasi
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
}



// Savatni saqlash uchun massiv
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Savatga mahsulot qo‘shish funksiyasi
function addToCart(name, price) {
    let item = cart.find(product => product.name === name);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    
    // Mahsulotlarni LocalStorage ga saqlaymiz
    localStorage.setItem('cart', JSON.stringify(cart));

    updateCart();
}

// Savatni yangilash funksiyasi
function updateCart() {
    let cartList = document.getElementById('cart-items');
    let totalPrice = document.getElementById('total-price');

    if (!cartList || !totalPrice) return; // Agar savat sahifasida bo‘lmasa, chiqib ketadi

    cartList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        let li = document.createElement('li');
        li.textContent = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;

        // O‘chirish tugmasi
        let removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.style.marginLeft = '10px';
        removeBtn.onclick = function () {
            removeFromCart(item.name);
        };

        li.appendChild(removeBtn);
        cartList.appendChild(li);
        total += item.price * item.quantity;
    });

    totalPrice.textContent = total.toFixed(2);
}

// Savatdan mahsulot o‘chirish funksiyasi
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// Buyurtma berish funksiyasi
function placeOrder() {
    if (cart.length === 0) {
        alert("❌ Siz hali mahsulot tanlamadingiz!");
        return;
    }

    // Mijoz ma’lumotlarini olish
    let customerName = document.getElementById('customer-name')?.value.trim();
    let customerAddress = document.getElementById('customer-address')?.value.trim();
    let customerPhone = document.getElementById('customer-phone')?.value.trim();

    if (!customerName || !customerAddress || !customerPhone) {
        alert("❌ Iltimos, barcha ma’lumotlarni to‘ldiring!");
        return;
    }

    let orderDetails = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
    let customerInfo = { name: customerName, address: customerAddress, phone: customerPhone };

    alert(`✅ Buyurtma tasdiqlandi!\n\n📌 Buyurtma: ${orderDetails}\n🚚 Yetkazib berish manzili: ${customerAddress}`);

    // Telegramga xabar yuborish
    notifyAdmin(orderDetails, customerInfo);

    // Buyurtma jo‘natilgandan keyin savatni tozalash
    cart = [];
    localStorage.removeItem('cart');
    updateCart();

    // Formani tozalash
    document.getElementById('delivery-form')?.reset();
}

// Telegramga buyurtma yuborish funksiyasi
function notifyAdmin(orderDetails, customerInfo) {
    let botToken = "7843109136:AAHNj6_O_dTwwQYJrcYFrv97fHg4uU3GEso";
    let chatId = "732429407";
    let message = `📢 Yangi buyurtma!\n\n📌 **Buyurtma:**\n${orderDetails}\n\n🚚 **Yetkazib berish ma’lumotlari:**\n👤 Ism: ${customerInfo.name}\n📍 Manzil: ${customerInfo.address}\n📞 Telefon: ${customerInfo.phone}`;

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown"
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log("✅ Xabar yuborildi!");
        } else {
            console.error("⚠️ Xatolik yuz berdi:", data);
        }
    })
    .catch(error => console.error("❌ Serverga ulanib bo‘lmadi:", error));
}

// Sahifa yuklanganda savatni yangilash
document.addEventListener('DOMContentLoaded', updateCart);

// Alışveriş listesi elemanlarını ve formu seçiyoruz
// document.querySelector() ile ilgili sınıflara sahip ilk HTML elemanını seçer
const shoppingList = document.querySelector(".shopping-list");
const shoppingForm = document.querySelector(".shopping-form");
// document.querySelectorAll() ile ilgili sınıflara sahip tüm butonları seçer
const filterButtons = document.querySelectorAll(".filter-buttons button");
const clearBtn = document.querySelector(".clear");

// Sayfa yüklendiğinde yapılacak işlemler
// document.addEventListener() ile sayfa yüklendiğinde çalışacak fonksiyon tanımlanır
document.addEventListener("DOMContentLoaded", function(){
    // localStorage'dan öğeleri yükler
    loadItems();
    
    // Form gönderildiğinde öğeyi ekler
    shoppingForm.addEventListener("submit", handleFormSubmit);

    // Filtre butonlarına tıklama işlemlerini dinler
    for(let button of filterButtons){
        button.addEventListener("click", handleFilterSelection);
    }

    // Temizle butonuna tıklandığında tüm öğeleri sil
    clearBtn.addEventListener("click", clearItems);
});

// Listeyi temizler ve localStorage'daki verileri siler
function clearItems() {
    shoppingList.innerHTML = ""; // Listeyi temizler (tüm HTML öğelerini kaldırır)
    localStorage.clear("shoppingItems"); // localStorage'daki veriyi siler
}

// Listeyi localStorage'a kaydeder
function saveToList(){
    // shoppingList içindeki tüm 'li' öğelerini seçer
    const listItem = shoppingList.querySelectorAll("li");
    const liste = []; // Yeni bir liste oluşturur

    // Her bir 'li' elemanını döner
    for(let li of listItem){
        const id = li.getAttribute("item-id"); // Öğenin id'sini alır
        const name = li.querySelector(".item-name").textContent; // Öğenin ismini alır
        const completed = li.hasAttribute("item-completed"); // Öğenin tamamlanıp tamamlanmadığını kontrol eder

        // Öğeyi listeye ekler
        liste.push({id, name, completed});
    }

    // Listeyi JSON formatında localStorage'a kaydeder
    localStorage.setItem("shoppingItem", JSON.stringify(liste));
}

// localStorage'dan liste öğelerini yükler
function loadItems() {
    // localStorage'dan öğeleri alır ya da boş bir dizi döner
    const items = JSON.parse(localStorage.getItem("shoppingItem")) || [];
    shoppingList.innerHTML = ""; // Listeyi temizler

    // Her bir öğeyi listeye ekler
    for (let item of items) {
        const li = createItem(item); // Yeni öğe oluşturur
        shoppingList.appendChild(li); // Listeye ekler
    }
}

// Yeni bir öğe ekler
function addItem(input){
    const newItem = createItem({
        id: generateID(), // Yeni bir benzersiz id oluşturur
        name: input.value, // Formdan girilen değeri alır
        completed: false // Öğenin tamamlanmadığını varsayar
    });

    shoppingList.appendChild(newItem); // Yeni öğeyi listeye ekler
    input.value = ""; // Formu temizler
    updateFilteredItems(); // Filtrelenmiş öğeleri günceller
    saveToList(); // Güncel listeyi kaydeder
}

// Benzersiz id üretmek için kullanılır
function generateID(){
    return Date.now().toString(); // O anki zamanı id olarak kullanır (milisaniye cinsinden)
}

// Form gönderildiğinde çağrılır
function handleFormSubmit(e){
    e.preventDefault(); // Formun normal gönderilme işlemini durdurur

    const input = document.getElementById("item_name"); // Formdaki giriş elemanını seçer

    // Eğer giriş boşsa uyarı verir
    if(input.value.trim().length === 0){
        alert("Geçerli Bir Değer Giriniz");
        return;
    }

    addItem(input); // Yeni öğeyi ekler
}

// Öğeyi tamamlandı/aktif durumuna geçiren işlev
function toggleCompleted(e){
    const li = e.target.parentElement; // Tıklanan checkbox'ın ebeveyni olan 'li'yi alır
    li.toggleAttribute("item-completed", e.target.checked); // Öğeyi tamamlanmış ya da tamamlanmamış olarak işaretler
    updateFilteredItems(); // Filtrelenmiş öğeleri günceller
    saveToList(); // Listeyi kaydeder
}

// Bir öğeyi listeden siler
function removeItem(e){
    const li = e.target.parentElement; // Tıklanan sil butonunun ebeveyni olan 'li'yi alır
    shoppingList.removeChild(li); // 'li'yi listeden kaldırır
    saveToList(); // Listeyi kaydeder
}

// Düzenleme moduna geçmek için kullanılır
function openEditMode(e){
    const li = e.target.parentElement; // Tıklanan öğenin ebeveyni olan 'li'yi alır

    // Eğer öğe tamamlanmadıysa düzenlemeye izin verir
    if(li.hasAttribute("item-completed") == false){
        e.target.contentEditable = true; // Öğeyi düzenlenebilir yapar
    }
}

// Düzenleme modunu kapatır
function closeEditMode(e){
    e.target.contentEditable = false; // Öğeyi düzenlenemez hale getirir
    saveToList(); // Listeyi kaydeder
}

// Enter tuşuna basıldığında düzenlemeyi kapatır
function cancelEnter(e){
    if(e.key == "Enter"){
        e.preventDefault(); // Sayfanın yeniden yüklenmesini engeller
        closeEditMode(e); // Düzenlemeyi kapatır
    }
}

// Yeni bir 'li' öğesi oluşturur
function createItem(item) {
    // Checkbox oluşturma
    const input = document.createElement("input");
    input.type = "checkbox"; // Checkbox türünde bir input oluşturur
    input.classList.add("form-check-input"); // Bootstrap sınıfı ekler
    input.checked = item.completed; // Eğer tamamlanmışsa checkbox işaretlenir
    input.addEventListener("change", toggleCompleted); // Tamamlanma durumunu dinler

    // İsim (item) oluşturma
    const div = document.createElement("div");
    div.textContent = item.name;  // Öğenin adını gösterir
    div.classList.add("item-name"); // CSS sınıfı ekler
    div.addEventListener("click", openEditMode); // Tıklanıldığında düzenleme moduna geçer
    div.addEventListener("blur", closeEditMode); // Düzenleme bittiğinde kapatır
    div.addEventListener("keydown", cancelEnter); // Enter tuşuna basıldığında düzenlemeyi kapatır

    // Silme ikonu oluşturma
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fs-3 bi bi-x text-danger delete-icon"; // Bootstrap ikonunu kullanır
    deleteIcon.addEventListener("click", removeItem); // Silme ikonuna tıklanınca öğeyi siler

    // 'li' oluşturma ve öğeleri ekleme
    const li = document.createElement("li");
    li.setAttribute("item-id", item.id); // Benzersiz id'yi ayarlar
    li.className = "border-rounded p-2 mb-1 d-flex justify-content-between align-items-center"; // Bootstrap sınıflarıyla stil ekler
    li.toggleAttribute("item-completed", item.completed); // Tamamlanmışsa işaretler

    // 'li' içine checkbox, isim ve silme ikonu ekler
    li.appendChild(input);
    li.appendChild(div);  
    li.appendChild(deleteIcon);

    return li; // Yeni öğeyi döner
}

// Filtreleme işlemleri için butona tıklamayı ele alır
function handleFilterSelection(e){
    const filterBtn = e.target; // Tıklanan butonu seçer

    // Tüm butonları varsayılan hale getirir (btn-secondary)
    for (let button of filterButtons) {
        button.classList.add("btn-secondary");
        button.classList.remove("btn-primary");
    }

    // Tıklanan butonu aktif hale getirir (btn-primary)
    filterBtn.classList.add("btn-primary");
    filterBtn.classList.remove("btn-secondary");

    // Filtreyi uygular
    filterItems(filterBtn.getAttribute("item-filter"));
}

// Liste öğelerini filtreler
function filterItems(filterType){
    const li_items = shoppingList.querySelectorAll("li"); // Tüm 'li' öğelerini seçer

    // Her bir liste öğesini döner
    for (let li of li_items) {
        li.classList.remove("d-flex"); // Görünürlük sınıfını kaldırır
        li.classList.remove("d-none"); // Gizleme sınıfını kaldırır

        const completed = li.hasAttribute("item-completed"); // Tamamlanma durumunu kontrol eder

        // Tamamlanmış olanları gösterir
        if(filterType == "completed"){
            li.classList.toggle(completed ? "d-flex" : "d-none");
        } 
        // Tamamlanmamış olanları gösterir
        else if(filterType == "incomplete"){
            li.classList.toggle(completed ? "d-none" : "d-flex");
        } 
        // Tüm öğeleri gösterir
        else {
            li.classList.toggle("d-flex");
        }
    }
}

// Filtrelenmiş öğeleri günceller
function updateFilteredItems(){
    const activeFilter = document.querySelector(".btn-primary[item-filter]"); // Aktif filtreyi bulur
    filterItems(activeFilter.getAttribute("item-filter")); // Seçilen filtreye göre öğeleri filtreler
}

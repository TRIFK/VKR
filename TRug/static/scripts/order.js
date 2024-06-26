document.addEventListener('DOMContentLoaded', function() {
    const addOrderButton = document.getElementById('add-order-button');
    const addOrderModal = document.getElementById('add-order-modal');
    const addOrderForm = document.getElementById('add-order-form');
    const productFields = document.getElementById('product-fields');
    const addProductButton = document.getElementById('add-product');
    const EditOrderModal = document.getElementById('edit-order-modal');
    const EditOrderForm = document.getElementById('edit-order-form');
    const closeModalButtons = document.querySelectorAll('.close');
    const editOrderModal = document.getElementById('edit-order-modal');
    const editOrderForm = document.getElementById('edit-order-form');
    const editOrderProducts = document.getElementById('edit-order-products');
    const addEditProductButton = document.getElementById('add-edit-product');
    const saveEditOrderButton = document.getElementById('save-edit-order');
    const cancelEditOrderButton = document.getElementById('cancel-edit-order');
    const shareOrderButton = document.getElementById('share-order-button');

        //Открытие окна добавления заказа
     addOrderButton.addEventListener('click', function() {
        addOrderModal.style.display = 'block';
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            addOrderModal.style.display = 'none';
        });
    });


    // Проверяем, что данные загружены
    if (!Array.isArray(productsData) || productsData.length === 0) {
        console.error('Ошибка: данные о продуктах не загружены или пустой массив.');
    }

    addProductButton.addEventListener('click', function() {
        const newProductField = document.createElement('div');
        newProductField.classList.add('product-field');

        const selectElement = document.createElement('select');
        selectElement.name = 'products_product';
        selectElement.required = true;

        // Добавляем опции в селект из переменной productsData
        if (typeof productsData !== 'undefined' && Array.isArray(productsData)) {
            productsData.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                selectElement.appendChild(option);
            });
        } else {
            console.error('Ошибка: данные о продуктах не загружены.');
            return; // Прекращаем выполнение функции, если данные о продуктах не загружены
        }

        const quantityLabel = document.createElement('label');
        quantityLabel.setAttribute('for', 'product-quantity');
        quantityLabel.textContent = 'Количество:';

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.name = 'product_quantities';
        quantityInput.min = '1';
        quantityInput.required = true;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.classList.add('remove-product');
        removeButton.textContent = 'Удалить';

        newProductField.appendChild(selectElement);
        newProductField.appendChild(quantityLabel);
        newProductField.appendChild(quantityInput);
        newProductField.appendChild(removeButton);
        productFields.appendChild(newProductField);

        // Добавление обработчика события для кнопки "Удалить" на новый элемент
        removeButton.addEventListener('click', function() {
            newProductField.remove();
        });
    });

    // Удаление продукта из формы заказа - делегирование событий
    document.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('remove-product')) {
            event.target.closest('.product-field').remove();
        }
    });

    addOrderForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const data = {};
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        data["customer"] = document.getElementById('customer').value;
        data["date_ordered"] = document.getElementById('date_ordered').value;

        const productFields = document.querySelectorAll('.product-field');
        const selectedProducts = [];

        productFields.forEach(field => {
            const productId = field.querySelector('select').value;
            const quantity = parseInt(field.querySelector('input[type="number"]').value);
            if (!isNaN(quantity) && quantity > 0) {
        selectedProducts.push({ 'ID': productId, 'quantity': quantity });
    } else {
        console.error(`Ошибка: Некорректное количество для продукта ${productId}`);
        // Можно добавить пользовательское уведомление о некорректном количестве
    }
        });

        data["selected_products"] = selectedProducts;
        fetch(addOrderForm.getAttribute('data-create-order-url'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showPopup('Заказ успешно добавлен!');
                addOrderForm.reset();
                addOrderModal.style.display = 'none';
                location.reload();
            } else {
                console.error(data.error);
                showPopup(`Ошибка: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Ошибка при добавлении заказа:', error);
            showPopup(`Ошибка: ${error.message}`);
        });
    });

     function updateOrdersTable() {
        fetch('/orders/')
        .then(response => response.text())
        .then(html => {
            const orderTableBody = document.getElementById('order-table-body');
            orderTableBody.innerHTML = html; // Заменяем содержимое tbody на новые данные
        })
        .catch(error => console.error('Ошибка при обновлении таблицы заказов:', error));
    }
    function showPopup(message) {
        let popupStatus = document.getElementById('popup-status');
        if (!popupStatus) {
            popupStatus = document.createElement('div');
            popupStatus.id = 'popup-status';
            popupStatus.classList.add('popup');
            document.body.appendChild(popupStatus);
        }

        popupStatus.textContent = message;
        popupStatus.style.display = 'block';
        popupStatus.style.opacity = 1;

        setTimeout(() => {
            popupStatus.style.opacity = 0;
            setTimeout(() => {
                popupStatus.style.display = 'none';
            }, 500);
        }, 2000);
    }
});


//Передать в отгрузку
function shareSelectedOrder() {
    var checkbox = document.querySelector('input[name="selected_order"]:checked');
    if (!checkbox) {
        showAlert("Выберите заказ для отгрузки");
        return;
    }

    var order_id = checkbox.value;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(`/shareOrder/${order_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            },
        })
    .then(response => response.text())
    .catch(error => console.error('Ошибка при предачи заказа в отгрузку:', error));
}

// Обработчик удаления заказа
function deleteSelectedOrders() {
    var checkboxes = document.querySelectorAll('input[name="selected_order"]:checked');

    if (checkboxes.length === 0) {
        showAlert("Выберите заказы для удаления");
        return;
    }

    if (!confirm("Вы уверены, что хотите удалить выбранные заказы?")) {
        return;
    }

    var orderIds = Array.from(checkboxes).map(function(checkbox) {
        return checkbox.value;
    });

    deleteOrdersFromDatabase(orderIds);
}

function deleteOrdersFromDatabase(orderIds) {
    var data = {
        order_id: orderIds
    };

    var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data)
    };

    fetch('/delete_orders/', requestOptions)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Произошла ошибка при удалении заказов');
            }
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                handleSuccessfulDelete(orderIds);
            } else {
                showAlert('Произошла ошибка при удалении заказов: ' + data.message);
            }
        })
        .catch(function(error) {
            console.error('Ошибка:', error);
            showAlert('Произошла ошибка при удалении заказов');
        });
}

function handleSuccessfulDelete(orderIds) {
    showAlert('Выбранные заказы успешно удалены');

    orderIds.forEach(function(id) {
        var row = document.querySelector('input[value="' + id + '"]').closest('tr');
        if (row) {
            row.remove();
        } else {
            console.error('Не удалось найти строку для заказа с ID: ' + id);
        }
    });
}

function showAlert(message) {
    var popup = document.getElementById('popup');
    var popupMessage = document.getElementById('popup-message');

    popupMessage.textContent = message;
    popup.style.display = 'block';

    setTimeout(function() {
        popup.style.display = 'none';
    }, 3000);
}


   let orderIdToEdit = null;

   // Функция для редактирования выбранного заказа
// Функция для открытия модального окна редактирования
function editSelectedOrder() {
    var checkbox = document.querySelector('input[name="selected_order"]:checked');
    if (!checkbox) {
        showAlert("Выберите заказ для редактирования");
        return;
    }

    var orderId = checkbox.value;
    // Получаем данные о заказе из строки таблицы
    var row = checkbox.closest('tr');
    var product = row.cells[2].textContent.trim();
    var dateOrdered = row.cells[5].textContent.trim();

    // Заполняем форму данными о заказе
    document.getElementById('edit-order-id').value = orderId;
    document.getElementById('edit-order-summary').value = product;
    document.getElementById('edit-order-date').value = dateOrdered;

    // Заполняем продукты (здесь предполагается, что данные о продуктах можно получить аналогичным образом)
    var productsContainer = document.getElementById('edit-order-products');
    productsContainer.innerHTML = ''; // Очищаем контейнер

    // Получаем все продукты и их количество
    var productElements = row.querySelectorAll('.text2 p');
    for (var i = 0; i < productElements.length; i += 2) {
        var productName = productElements[i].textContent.trim();
        var quantity = productElements[i + 1].textContent.trim();
        var product = productsData.find(p => p.name === productInput);
        if (product) {
            var productInput = document.createElement('div');
            productInput.classList.add('product-field');
            productInput.innerHTML = `
                <select name="products_product" required>
                    ${productsData.map(p => `<option value="${p.id}" ${p.name === productName ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
                <label for="product_quantities">Количество:</label>
                <input type="number" name="product_quantities" value="${quantity}" min="1" required>
                <button type="button" class="remove-product">Удалить</button>
            `;
            productsContainer.appendChild(productInput);

            // Добавляем слушатель события для удаления продукта
            productInput.querySelector('.remove-product').addEventListener('click', function() {
                productInput.remove();
            });
        }
    }

    document.getElementById('edit-order-modal').style.display = 'block';
}

// Функция для закрытия модального окна редактирования
function closeEditOrderModal() {
    document.getElementById('edit-order-modal').style.display = 'none';
}

// Функция для отправки формы редактирования заказа
function submitEditOrderForm() {
    var form = document.getElementById('edit-order-form');
    var formData = new FormData(form);
    var orderId = document.getElementById('edit-order-id').value;
    var data = {
        order_id: orderId,
        summary: formData.get('summary'),
        date_ordered: formData.get('date_ordered'),
        products: []
    };

    form.querySelectorAll('#edit-order-products .product-field').forEach(function(productInput) {
        var productId = productInput.querySelector('select').value;
        var quantity = productInput.querySelector('input[name="product_quantities"]').value;
        data.products.push({
            id: productId,
            quantity: quantity
        });
    });

    var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data)
    };

    fetch('/edit_order/', requestOptions)
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Произошла ошибка при редактировании заказа. Статус: ' + response.status);
        }
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            handleSuccessfulEdit(data.order);
        } else {
            showAlert('Произошла ошибка при редактировании заказа: ' + data.message);
        }
    })
    .catch(function(error) {
        console.error('Ошибка при выполнении запроса:', error.message);
        showAlert('Произошла ошибка при редактировании заказа');
    });
}

// Функция для добавления новых полей продуктов
document.getElementById('elementId').addEventListener('click', function(event) {
    var productFields = document.createElement('div');
    productFields.classList.add('product-field');
    productFields.innerHTML = `
        <select name="products_product" required>
            ${productsData.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
        <label for="product_quantities">Количество:</label>
        <input type="number" name="product_quantities" min="1" required>
        <button type="button" class="remove-product">Удалить</button>
    `;
    document.getElementById('edit-order-products').appendChild(productFields);

    // Добавляем слушатель события для удаления продукта
    productFields.querySelector('.remove-product').addEventListener('click', function() {
        // Находим родительский элемент и удаляем его
        productFields.remove();
    });
});

// Функция для успешного редактирования заказа
function handleSuccessfulEdit(order) {
    showAlert('Заказ успешно отредактирован');

    // Обновляем строку таблицы новыми данными
    var row = document.querySelector('input[value="' + order.id + '"]').closest('tr');
    row.cells[2].textContent = order.summary;
    row.cells[5].textContent = order.date_ordered;

    // Обновляем продукты
    var productsContainer = row.querySelector('.text2');
    productsContainer.innerHTML = '';
    order.products.forEach(function(product) {
        productsContainer.innerHTML += `<p>${product.name}</p><p>${product.quantity}</p>`;
    });

    closeEditOrderModal();
}


document.addEventListener('DOMContentLoaded', function() {
    const completeShipmentButton = document.getElementById('complete-shipment-button');

    completeShipmentButton.addEventListener('click', function() {

        var checkbox = document.querySelector('input[name="selected_shipment"]:checked');

        var shipment_id = checkbox.value;

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        var data = {
            shipment_id: shipment_id
        }

        fetch('/complete_shipment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Произошла ошибка при подтверждении заказов');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                console.error(data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка при добавлении заказа:', error);
            showPopup(`Ошибка: ${error.message}`);
        });
    });
});
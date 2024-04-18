I only realized towards the end of the exam that I needed to integrate it with the STYLiSH project I had previously worked on. Additionally, my AWS account was suspended, resulting in the loss of the previous database. Consequently, I didn't have enough time to modify and redesign my database schema.

Although my socket.io functionality is still operational, it now requires the use of the new API I have written to add orders.

### Checkout API

* **End Point:** `/checkout`

* **Method:** `POST`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body Example**

```
{
    "total": 28304,
    "list": [
        {
            "id": 8,
            "price": 1721,
            "color": {
                "code": "#EEEE00",
                "name": "Yellow"
            },
            "size": "S",
            "qty": 8
        },
        {
            "id": 9,
            "price": 660,
            "color": {
                "code": "#EEEE00",
                "name": "Yellow"
            },
            "size": "M",
            "qty": 2
        },
        {
            "id": 3,
            "price": 1888,
            "color": {
                "code": "#00EE00",
                "name": "Green"
            },
            "size": "L",
            "qty": 7
        }
    ]
}
```

* **Success Response: 200**

```
{
    "message": "Order created"
}
```
const handleUserSignUp = async () => {
    const provider = document.getElementById('provider').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const requestBody = {
        provider,
        email,
        password
    };

    try {
        const response = await fetch('http://localhost:3000/api/1.0/user/signin', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if(response.status === 200) {
            const responseBody = await response.json();
            const userData = responseBody.data.user;
            const access_token = responseBody.data.access_token;
            console.log(`access_token: ${access_token}`);
            localStorage.setItem('access_token', access_token);
            console.log(localStorage.getItem('access_token'));
            const alertMessage = JSON.stringify(userData);
            alert(alertMessage);
            window.location.href = 'http://localhost:3000/admin/checkout.html';
        } else {
            const errorBody = await response.json();
            alert(errorBody.error);
        }
    } catch(err) {
        console.error('Network error:', err);
    }
}
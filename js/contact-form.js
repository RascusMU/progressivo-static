document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form[action*="web3forms"]');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.innerText;

            button.disabled = true;
            button.innerText = 'Odesílám...';

            // Optional: You could intercept the submit here to use fetch()
            // for a purely AJAX experience, but the default POST behavior
            // works fine with Web3Forms (redirects to success page).

            // If we wanted to keep it simple, we just let it submit.
            // But let's add a timeout to restore the button just in case the user navigates back
            setTimeout(() => {
                button.disabled = false;
                button.innerText = originalText;
            }, 5000);
        });
    });
});

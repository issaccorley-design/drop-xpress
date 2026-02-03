// summit.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('summitForm');
  const successMsg = document.getElementById('successMsg');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!form) {
    console.error('Summit form not found');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable button + show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Collect form data
    const formData = {
      name: document.getElementById('name')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      role: document.getElementById('role')?.value || '',
      message: document.getElementById('message')?.value.trim() || '',
      submittedAt: new Date().toISOString(),
      // Optional: you could add source / referrer / utm params here
      // source: document.referrer || window.location.href,
    };

    // Basic client-side validation (beyond HTML required)
    if (!formData.name || !formData.email || !formData.role || !formData.message) {
      alert('Please fill in all fields.');
      resetButton();
      return;
    }

    try {

       const response = await fetch('https://formspree.io/f/mojwbvoz', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData),
       });

      if (response.ok || response.type === 'opaque') {  // opaque = no-cors success
        successMsg.style.display = 'block';
        form.reset();
        // Optional: scroll to message
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server responded with error');
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      alert('Something went wrong. Please try again or email us directly.');
    } finally {
      resetButton();
    }

    function resetButton() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
    }
  });
});
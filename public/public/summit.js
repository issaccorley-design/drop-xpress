// summit.js – matched to new HTML + improved UX

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('summitForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('successMsg');
  const errorMsg = document.getElementById('errorMsg');

  if (!form || !submitBtn) return;

  // Optional: pre-fill email if logged in
  const user = getUser(); // from script.js
  if (user) {
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = user.email;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset messages
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    // Collect data
    const formData = {
      name: document.getElementById('name')?.value.trim(),
      email: document.getElementById('email')?.value.trim(),
      role: document.getElementById('role')?.value,
      message: document.getElementById('message')?.value.trim(),
      submittedAt: new Date().toISOString(),
      source: window.location.href
    };

    // Client-side validation
    if (!formData.name || !formData.email || !formData.role || !formData.message || formData.message.length < 100) {
      errorMsg.textContent = "Please complete all fields (message must be at least 100 characters).";
      errorMsg.style.display = 'block';
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const response = await fetch('https://formspree.io/f/mojwbvoz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        successMsg.style.display = 'block';
        form.style.opacity = '0.4';
        form.style.pointerEvents = 'none';
        // Optional: store last submission time to prevent spam
        localStorage.setItem('lastSummitRequest', Date.now());
      } else {
        throw new Error('Server responded with error');
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Submission failed. Please try again or email support@huntx.co.";
      errorMsg.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SUBMIT REQUEST';
    }
  });
});
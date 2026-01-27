document.getElementById("summitForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const request = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    role: document.getElementById("role").value,
    message: document.getElementById("message").value,
    date: new Date().toISOString()
  };

  let requests = JSON.parse(localStorage.getItem("summitRequests")) || [];
  requests.push(request);
  localStorage.setItem("summitRequests", JSON.stringify(requests));

  document.getElementById("summitForm").reset();
  document.getElementById("successMsg").style.display = "block";
});

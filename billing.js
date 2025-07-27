let serial = 1;

function addRow() {
  const tbody = document.getElementById("tableBody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="p-2 text-center">${serial++}</td>
    <td class="p-2"><input type="text" class="border rounded p-1 w-full" placeholder="Item name" /></td>
    <td class="p-2"><input type="number" class="price border rounded p-1 w-full" oninput="updateTotal(this)" /></td>
    <td class="p-2"><input type="number" class="qty border rounded p-1 w-full" oninput="updateTotal(this)" /></td>
    <td class="p-2 total text-center">0</td>
    <td class="p-2 text-center"><button onclick="removeRow(this)" class="text-red-500 font-bold">✖</button></td>
  `;
  tbody.appendChild(row);
  updateGrandTotal();
}

function removeRow(btn) {
  const row = btn.closest("tr");
  row.remove();
  updateGrandTotal();
}

function updateTotal(el) {
  const row = el.closest("tr");
  const price = row.querySelector(".price").value || 0;
  const qty = row.querySelector(".qty").value || 0;
  const total = row.querySelector(".total");
  total.textContent = (price * qty).toFixed(2);
  updateGrandTotal();
}

function updateGrandTotal() {
  const rows = document.querySelectorAll("#tableBody tr");
  let total = 0;
  rows.forEach(row => {
    const val = parseFloat(row.querySelector(".total").textContent);
    total += isNaN(val) ? 0 : val;
  });

  const discount = parseFloat(document.getElementById("discount").value) || 0;
  const grandTotal = total - discount;
  document.getElementById("grandTotal").value = grandTotal.toFixed(2);
}

// Set current time on load
document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  document.getElementById("purchaseTime").value = now.toLocaleString();
  addRow(); // Add one initial row
});

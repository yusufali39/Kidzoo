/* Complete script: copy & paste into your page (replace your existing script).
   This is a drop-in replacement that keeps cart, storage and WhatsApp features,
   and generates a single-column (not table) professional invoice with tall/mono fonts,
   bold/sharp rendering, and print/PDF support.
   Requires jQuery to be loaded on the page.
*/

$(document).ready(function () {
  // Load saved state from localStorage
  var items = JSON.parse(localStorage.getItem("items")) || [];
  var customerName = localStorage.getItem("customerName") || "";
  var customerNumber = localStorage.getItem("customerNumber") || "";
  var prevDues = parseFloat(localStorage.getItem("prevDues")) || 0;
  var amountPaid = parseFloat(localStorage.getItem("amountPaid")) || 0;

  var addStamp = false;

  // UI bindings
  $("#stamp-button").on("click", function() {
    addStamp = true;
    alert("Stamp will be added to the invoice.");
  });

  $("#customer-name").val(customerName);
  $("#customer-number").val(customerNumber);
  $("#prev-dues").val(prevDues);
  $("#amount-paid").val(amountPaid);

  renderCart();
  updateTotalCost();
  updateTotalQty();
  updateTotalAmt();

  $("#clear-button").on("click", function(event) {
    event.preventDefault();
    clearAllInputs();
  });

  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);
  $("#generate-whatsapp").on("click", generateWhatsAppBill);

  $(".item-button").on("click", function (event) {
    event.preventDefault();
    var selectedItem = $(this).text();
    $("#item-name").val(selectedItem);
  });

  // Keep localStorage updated as user edits
  $("#customer-name").on("input", function () {
    customerName = $(this).val();
    localStorage.setItem("customerName", customerName);
  });
  $("#customer-number").on("input", function () {
    customerNumber = $(this).val();
    localStorage.setItem("customerNumber", customerNumber);
  });

  $("#prev-dues").on("input", function () {
    prevDues = parseFloat($(this).val()) || 0;
    localStorage.setItem("prevDues", prevDues);
    updateTotalAmt();
  });

  $("#amount-paid").on("input", function () {
    amountPaid = parseFloat($(this).val()) || 0;
    localStorage.setItem("amountPaid", amountPaid);
    updateCurrentDue();
  });

  // Add item to cart
  function addItemToCart(event) {
    event.preventDefault();

    var itemName = $("#item-name").val();
    var itemPrice = $("#item-price").val();
    var itemQty = parseInt($("#item-qty").val()) || 1;

    if (
        (customerName && customerName.trim() !== "") &&
        itemName && itemName.trim() !== "" &&
        itemPrice && itemPrice.trim() !== ""
    ) {
        var item = {
            name: itemName,
            price: parseFloat(itemPrice),
            qty: itemQty
        };

        items.push(item);
        localStorage.setItem("items", JSON.stringify(items));
        renderCart();
        updateTotalCost();
        updateTotalQty();
        updateTotalAmt();

        // Clear input fields
        $("#item-name").val("");
        $("#item-price").val("");
        $("#item-qty").val("");
        $("#item-name").focus();
    } else {
        alert("Customer name, item name, and item price are required.");
    }
  }

  // Remove item
  function removeItemFromCart() {
    var row = $(this).closest("tr");
    var index = row.index();

    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      row.remove();
      localStorage.setItem("items", JSON.stringify(items));
      renderCart();
      updateTotalCost();
      updateTotalQty();
      updateTotalAmt();
    }
  }

  // Render small cart preview (table kept for editor simplicity)
  function renderCart() {
    $("#cart-table tbody").empty();
    items.forEach(function (item, index) {
        $("#cart-table tbody").append(
            `<tr>
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>₹${(item.price * item.qty).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td>
            </tr>`
        );
    });
  }

  // Totals
  function updateTotalCost() {
    var totalCost = getTotalCost();
    $("#total-cost").text("Amount: ₹" + totalCost.toFixed(2));
  }

  function updateTotalQty() {
    var totalQty = getTotalQty();
    $("#total-qty").text("Total Qty: " + totalQty);
  }

  function updateTotalAmt() {
    var totalAmt = getTotalCost() + (prevDues || 0);
    $("#total-amount").text("TOTAL :  ₹" + totalAmt.toFixed(2));
    updateCurrentDue();
  }

  function updateCurrentDue() {
    var totalAmt = parseFloat($("#total-amount").text().split("₹")[1]) || 0;
    var currentDue = totalAmt - (amountPaid || 0);
    $("#current-due").text("Current Due: ₹" + currentDue.toFixed(2));
  }

  // Helpers
  function getTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += Number(item.qty) || 0;
    });
    return totalQty;
  }

  function getTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += (Number(item.price) || 0) * (Number(item.qty) || 0);
    });
    return totalCost;
  }

  function getCurrentDate() {
    var currentDate = new Date();
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    var yyyy = currentDate.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  }

  function clearAllInputs() {
    localStorage.clear();
    items = [];
    customerName = "";
    customerNumber = "";
    prevDues = 0;
    amountPaid = 0;

    $("#customer-name, #customer-number, #prev-dues, #amount-paid, #item-name, #item-price, #item-qty").val("");
    $("#cart-table tbody").empty();
    $("#total-cost").text("Amount:  ₹0.00");
    $("#total-amount").text("TOTAL :  ₹0.00");
    $("#current-due").text("Current Due: ₹0.00");
    $("#total-qty").text("Total Qty: 0");

    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("customerName", customerName);
    localStorage.setItem("customerNumber", customerNumber);
    localStorage.setItem("prevDues", prevDues);
    localStorage.setItem("amountPaid", amountPaid);
  }

  // Escape HTML for safety inside invoice popup
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Generate invoice — single-column, not table-divided
  function generateInvoice() {
    var totalCost = getTotalCost();
    var totalAmt = totalCost + (prevDues || 0);
    var currentDue = totalAmt - (amountPaid || 0);
    var totalQty = getTotalQty();

    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var timeStr = hours + ":" + minutes + " " + ampm;

    // Build invoice HTML: single column, each item as a single block line
    var invoice = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <!-- Google fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap" rel="stylesheet">
  <style>
    :root { --receipt-font: 'Share Tech Mono', 'VT323', monospace; }
    html,body { margin:0; padding:0; background:#fff; color:#000; }
    body, .container, p, h1, h2, h3, h4 { font-family: var(--receipt-font) !important; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; text-rendering:optimizeLegibility; }
    .container { width:100mm; margin:0 auto; padding:8px 10px; box-sizing:border-box; }
    .shop-title { font-size:20px; text-align:center; text-transform:uppercase; letter-spacing:1.6px; font-weight:700; margin:0; }
    .shop-sub { font-size:12.5px; text-align:center; margin:2px 0 6px 0; letter-spacing:0.8px; }
    hr.sep { border:none; border-top:1px dotted #000; margin:6px 0; }
    .meta { font-size:13px; margin:4px 0; display:flex; justify-content:space-between; align-items:center; }
    .meta .left, .meta .right { width:48%; }
    .items { margin-top:4px; }
    .item { margin:6px 0; }
    .item-top { display:flex; justify-content:space-between; align-items:baseline; }
    .item-left { font-size:15px; letter-spacing:0.9px; text-transform:uppercase; }
    .item-right { font-size:15px; font-weight:700; }
    .item-meta { font-size:12.5px; color:#000; margin-top:2px; letter-spacing:0.8px; }
    .totals { margin-top:6px; }
    .tot-line { display:flex; justify-content:space-between; margin:4px 0; font-size:15px; letter-spacing:0.9px; }
    .tot-line .label { text-transform:uppercase; }
    .thank { text-align:center; margin-top:8px; font-size:13px; letter-spacing:1px; cursor:pointer; }
    .stamp { text-align:center; margin-top:8px; }
    /* Improve print rendering */
    @media print {
      @page { size: 100mm auto; margin:0; }
      body { margin:0; }
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js" defer></script>
</head>
<body>
  <div class="container">
    <h1 id="savePdfButton" class="shop-title">${escapeHtml((customerName && customerName.trim() !== "") ? customerName.toUpperCase() : "SHOP NAME")}</h1>
    <div class="shop-sub">${escapeHtml((customerNumber && customerNumber.trim() !== "") ? ("Tel: " + customerNumber) : "Address / Phone")}</div>
    <hr class="sep" />

    <div class="meta">
      <div class="left"><strong>BILL TO:</strong> ${escapeHtml(customerName || "")}</div>
      <div class="right" style="text-align:right;"><strong>NO:</strong> ${escapeHtml(customerNumber || "")}</div>
    </div>

    <div class="meta">
      <div class="left"><strong>DATE:</strong> ${getCurrentDate()}</div>
      <div class="right" style="text-align:right;"><strong>TIME:</strong> ${timeStr}</div>
    </div>

    <hr class="sep" />

    <div class="items">`;

    // Items: single-column blocks
    items.forEach(function(item, index) {
      var amt = (Number(item.price) * Number(item.qty)).toFixed(2);
      invoice += `
      <div class="item">
        <div class="item-top">
          <div class="item-left">${index + 1}) ${escapeHtml(item.name)}</div>
          <div class="item-right">₹${amt}</div>
        </div>
        <div class="item-meta">QTY: ${item.qty} &nbsp;&nbsp; RATE: ₹${Number(item.price).toFixed(2)} &nbsp;&nbsp; AMNT: ₹${amt}</div>
      </div>`;
    });

    invoice += `
    </div> <!-- items -->

    <div class="totals">
      <div class="tot-line"><div class="label">Tot-Qty</div><div class="value">${totalQty}</div></div>
      <div class="tot-line"><div class="label">Total</div><div class="value">₹ ${totalCost.toFixed(2)}</div></div>
      <div class="tot-line"><div class="label">Dues</div><div class="value">₹ ${ (prevDues || 0).toFixed(2) }</div></div>
      <div class="tot-line"><div class="label">Total Amt</div><div class="value">₹ ${ totalAmt.toFixed(2) }</div></div>
      <div class="tot-line"><div class="label">Cash Paid</div><div class="value">₹ ${ (amountPaid || 0).toFixed(2) }</div></div>
      <div class="tot-line"><div class="label">Curr Dues</div><div class="value">₹ ${ currentDue.toFixed(2) }</div></div>
    </div>

    <hr class="sep" />
    <div id="print-button" class="thank">THANKS FOR VISIT</div>
    ${addStamp ? `<div class="stamp"><img src="Logopit_1750148360789.png" alt="Stamp" style="width:120px; transform: rotate(-6deg);"></div>` : ""}
  </div>

  <script>
    // Print when THANKS clicked
    document.getElementById('print-button').addEventListener('click', function() {
      window.print();
    });

    // Save as PDF (hooked to top title)
    function saveAsPDF() {
      const element = document.body;
      html2pdf(element, {
        margin: 2,
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      });
    }

    var saveBtn = document.getElementById('savePdfButton');
    if (saveBtn) saveBtn.addEventListener('click', saveAsPDF);
  </script>
</body>
</html>
`;

    // Open popup and write invoice
    var popup = window.open("", "_blank");
    popup.document.open();
    popup.document.write(invoice);
    popup.document.close();
  }

  // WhatsApp bill
  function generateWhatsAppBill() {
    if (!customerNumber) {
      alert("Please provide a customer number to send the bill via WhatsApp.");
      return;
    }

    // Country code (change if needed)
    const countryCode = "91";
    const formattedNumber = `${countryCode}${customerNumber}`;

    var totalCost = getTotalCost();
    var totalAmt = totalCost + (prevDues || 0);
    var currentDue = totalAmt - (amountPaid || 0);
    var totalQty = getTotalQty();

    const whatsappMessage = `Hi ${customerName},\n\nYour Invoice:\nTotal Qty: ${totalQty}\nTotal Amount: ₹${totalAmt.toFixed(2)}\nCurrent Due: ₹${currentDue.toFixed(2)}\n\nThank you for shopping with us!`;

    const businessUrl = `whatsapp-business://send?phone=${formattedNumber}&text=${encodeURIComponent(whatsappMessage)}`;
    const universalUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(whatsappMessage)}`;

    const newWindow = window.open(businessUrl, "_blank");

    setTimeout(() => {
      if (newWindow && !newWindow.closed) {
        newWindow.close();
        window.open(universalUrl, "_blank");
      }
    }, 500);
  }

}); // end document ready
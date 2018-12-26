var background = chrome.extension.getBackgroundPage();

function update_prices() {
  // MINE - don't update/refrash table cuz of fuzzy search
  if ($("#coinInput").is(":focus")) {
      return;
  }
  // MINE

  var final_text = process_alert_map();
  if (final_text != "") {
    table_header = "<table class='table table-striped'><thead><tr><th>Condition</th><th>Current</th><th></th></tr></thead><tbody>";
    table_footer = "</tbody></table>";
    final_text = table_header + final_text + table_footer;

    document.getElementById("content").innerHTML = final_text;
    add_button_listeners();
  } else {
    document.getElementById("content").innerHTML = "No alerts!";
  }
}

function add_button_listeners() {
  for (var i = 0; i < JSON.parse(localStorage.alert_map || "{}").length; i++) {
    (function (i) {
      let button_id = 'alert_button_' + i;
      let button = document.getElementById(button_id);
      let view_button = document.getElementById('view_' + button_id);
      if (button) {
        button.addEventListener('click', function () {
          remove_alert(i);
        });
        view_button.addEventListener('click', function () {
          window.open(view_button.getAttribute('href'));
        });
      }
    })(i);
  }
}

function remove_alert(index) {
  if (localStorage.alert_map) {
    var array = JSON.parse(localStorage.alert_map);
    array.splice(index, 1);
    localStorage.alert_map = JSON.stringify(array);
  }
  update_prices();
}

function save_form_data() {
  let form = document.forms.alert;
  let coin = form.coin.value.toUpperCase();
  let price = form.price.value;
  //let buy = form.buy.checked;
  let buy = false;

// MINE
var binanceCoins = jQuery.parseJSON(localStorage.prices);
for (var j = 0; j < binanceCoins.length; j++) {
    var binanceCoin = binanceCoins[j];
    if (binanceCoin.symbol === coin) {
        buy = binanceCoin.price > price;
    }
};
// MINE

  if (coin === "" || price === "") {
    return;
  }

  var data = { coin: coin, price: price, buy: buy };
  if (!localStorage.alert_map) {
    localStorage.alert_map = JSON.stringify([data]);
  } else {
    // MINE - sort alphabetically
    var currencies = JSON.parse(localStorage.alert_map);
    currencies.push(data)
    currencies.sort(function(a, b) {
        var textA = a.coin.toUpperCase();
        var textB = b.coin.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    localStorage.alert_map = JSON.stringify(currencies);
    // MINE
  }
  update_prices();
  background.process_alert_map();
}

function process_alert_map() {
  var currencies = JSON.parse(localStorage.alert_map || "{}");
  var final_text = "";
  for (var i = 0; i < currencies.length; i++) {
    var currency = currencies[i];
    var current_price = "not_found";
    var stored_prices = JSON.parse(localStorage.prices);
    for (var j = 0; j < stored_prices.length; j++) {
      var stored_price = stored_prices[j];
      if (stored_price.symbol == currency.coin) {
        current_price = stored_price.price;
        break;
      }
    }
    button_id = 'alert_button_' + i;
    let sign = currency.buy ? '&lt;' : '&gt;';
    final_text += '<tr><td>' + currency.coin + sign + currency.price + '</td><td>' + current_price + '</td>';
    final_text += '<td><a id="' + button_id + '"><span class="glyphicon glyphicon-remove"></span></a></td>';
    final_text += '<td><a id="view_' + button_id + '" href="https://www.binance.com/trade.html?symbol=';
    final_text += currency.coin + '"><span class="glyphicon glyphicon-link"></span></a></td></tr>';
  }
  return final_text;
}

document.addEventListener('DOMContentLoaded', function () {
  alert_button = document.getElementById("alert_button");
  alert_button.addEventListener('click', function () {
    save_form_data();
  });
  update_prices();
});


// MINE
document.addEventListener('DOMContentLoaded', function () {
  export_button = document.getElementById("export_button");
  export_button.addEventListener('click', function () {
      // Copy to clipboard
      var mydata = document.createElement("input");
      document.body.appendChild(mydata);
      mydata.setAttribute("id", "mydata_id");
      document.getElementById("mydata_id").value=localStorage.alert_map;
      mydata.select();
      document.execCommand("copy");
      document.body.removeChild(mydata);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  import_button = document.getElementById("import_button");
  import_button.addEventListener('click', function (e) {
      localStorage.alert_map = $('#coinInput').val();
      update_prices();
  });
});

// fuzzy search
document.addEventListener('DOMContentLoaded', function () {
  search = document.getElementById("coinInput");
  search.addEventListener('keyup', function (e) {
      $("tbody tr").hide();
      var term = $(this).val().toUpperCase();
      $("tbody tr td:contains('" + term + "')").parent().show();
  });
});
// MINE


chrome.runtime.onMessage.addListener(handleBackgroundMessages);
function handleBackgroundMessages(message) {
  if (message.update === true) {
    update_prices();
  }
}

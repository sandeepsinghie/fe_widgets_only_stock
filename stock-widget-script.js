const stockWidget = {
  token:'',
  // init:function(token){
  //  stockWidget.token = token;
  // },
  apiEndPoint: window && window.location && window.location.host 
    === 'www.financialexpress.com'
    ? 'https://api-market.financialexpress.com/finance-api'
    : 'https://devapi-market.financialexpress.com/finance-api',
  apiRequest: async ({ url, method, data, headers }) => {
    try {
      const options = {
        method,
        headers: {
          Authorization: stockWidget.token,
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error:", error);
    }
  },
  renderIndicesList: async (widgetId, url) => {
    try {
      const responseData = await stockWidget.apiRequest({
        url,
        method: "GET",
        data: null,
      });

      const dropdownContent = document.getElementById(widgetId);
      if (dropdownContent) {
        dropdownContent.innerHTML = "";
      }
      const ul = document.createElement("ul");
      responseData &&
        responseData.data[0] &&
        responseData.data[0].indices.forEach((item, index) => {
          const li = document.createElement("li");
          li.textContent = item.name;
          li.setAttribute("data-code", item.security_code);
          ul.appendChild(li);
          if (index === 0) {
            li.classList.add("active"); // Add 'active' class to the first li element
          }
        });
      dropdownContent && dropdownContent.appendChild(ul);
      const headers = responseData && responseData.indices;
    } catch (error) {
      console.error("Error:", error);
    }
  },
  
  tableRenderData: async (widgetId, url) => {
    try {
      const tableD = $(`#${widgetId}`);
      let loadingIcon = document.createElement("div");
      let headers;
      loadingIcon.id = "loadingIcon";
      loadingIcon.className = "loading";
      tableD.append(loadingIcon);
      $(loadingIcon).show();
      let dataTable;
      // Destroy existing DataTable instance if it exists
      if ($.fn.DataTable.isDataTable(tableD)) {
        dataTable = tableD.DataTable();
        dataTable.clear(); // Clear existing data
      }
  
      const responseData = await stockWidget.apiRequest({
        url,
        method: "GET",
        data: null,
      });
  
      let tableData;
      if (responseData.data && responseData.data[0].indices) {
        // Handle "Top Performing Indices" response
        tableData = responseData.data[0].indices.map((index) => {
          const name = index.name;
          const ltp = index.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 });
          const chg = index.change.toLocaleString(undefined, { minimumFractionDigits: 2 });
          const chgPercent = index["change%"].toLocaleString(undefined, { minimumFractionDigits: 2 });
          const volume = index.adRatio.toLocaleString(undefined, { minimumFractionDigits: 2 });
  
          const chgClass = chg < 0 ? "red" : "green";
          const chgPercentClass = chgPercent < 0 ? "red" : "green";
          const exchange =
            stockWidget.exchangeValue() === "nse" ? "nse" : "bse";
          const url = `https://www.financialexpress.com/market/indian-indices-${exchange}-${index.urlName}-companies-list/`;
  
          return [
            `<a href="${url}">${name}</a>`,
            ltp,
            `<span class="${chgClass}">${chg}</span>`,
            `<span class="${chgPercentClass}">${chgPercent}</span>`,
            volume,
          ];
        });
  
        // Set headers for "Top Performing Indices"
        if (!$(".stock-widget-main").hasClass("mobileDevice")) {
          headers = ["Name", "LTP", "Chg", "%Chg", "adRatio"];
        } else {
          headers = ["Name", "LTP", "Chg"];
          tableData = responseData.data[0].indices.map((index) => {
            const name = index.name;
            const ltp = index.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 });
            const chg = index.change.toLocaleString(undefined, { minimumFractionDigits: 2 });
            const chgPercent = index["change%"].toLocaleString(undefined, { minimumFractionDigits: 2 });
            const volume = index.adRatio.toLocaleString(undefined, { minimumFractionDigits: 2 });
  
            const chgClass = chg < 0 ? "red" : "green";
            const chgPercentClass =
              chgPercent < 0 ? "red" : "green";
              
            const exchange =
            stockWidget.exchangeValue() === "nse" ? "nse" : "bse";
          const url = `https://www.financialexpress.com/market/indian-indices-${exchange}-${index.urlName}-companies-list/`;

            return [
              `<a href="${url}">${name}</a>`,
              `${ltp}<span>AD Ratio: ${volume}</span>`,
              `<span class="${chgClass}">${chg}<br>
            <b class="${chgPercentClass}">${chgPercent}%</b>`,
            ];
          });
        }
      } else {
        // Handle other API responses
        if (!$(".stock-widget-main").hasClass("mobileDevice")) {
          headers = ["Name", "LTP", "Chg", "%Chg", "Volume"];
          tableData = responseData.values.map((value) => {
            const [name, ltp, chg, chgPercent, volume] = value;
            const chgClass = chg.change < 0 ? "red" : "green";
            const chgPercentClass =
              chgPercent.changePercent < 0 ? "red" : "green";
              const lastIndexValue = value[value.length - 1];
            return [
              `<a href="${name.link}">${name.label}</a>`,
              ltp.toLocaleString(undefined, { minimumFractionDigits: 2 }),
              `<span class="${chgClass}">${chg.change.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>`,
              `<span class="${chgPercentClass}">${chgPercent.changePercent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>`,
              lastIndexValue,
            ];
          });
        } else {
          headers = ["Name", "LTP", "Chg"];
          tableData = responseData.values.map((value) => {
            const [name, ltp, chg, chgPercent, volume] = value;
            const chgClass = chg.change < 0 ? "red" : "green";
            const chgPercentClass =
              chgPercent.changePercent < 0 ? "red" : "green";
              const lastIndexValueMob = value[value.length - 1];
            return [
              `<a href="${name.link}">${name.label}</a>`,
              `${ltp.toLocaleString(undefined, { minimumFractionDigits: 2 })}<span>Vol: ${lastIndexValueMob}</span>`,
              `<span class="${chgClass}">${chg.change.toLocaleString(undefined, { minimumFractionDigits: 2 })}<br>
            <b class="${chgPercentClass}">${chgPercent.changePercent.toLocaleString(undefined, { minimumFractionDigits: 2 })}%</b>`,
            ];
          });
        }
      }
  
      if (dataTable) {
        // Redraw the table header with updated headers
        const tableHeaders = `<thead><tr>${headers
          .map((header) => `<th>${header}</th>`)
          .join("")}</tr></thead>`;
        tableD.find("thead").remove();
        tableD.prepend(tableHeaders);
  
        dataTable.rows.add(tableData); // Add new data
        dataTable.draw(); // Redraw the table with updated data
      } else {
        const tableHeaders = `<thead><tr>${headers
          .map((header) => `<th>${header}</th>`)
          .join("")}</tr></thead>`;
  
        $(`#${widgetId}`).append(tableHeaders);
        $(`#${widgetId}`).DataTable({
          searching: false,
          paging: false,
          info: false,
          ordering: false,
          data: tableData,
          columns: headers.map((header) => ({ title: header })),
        });
      }
  
      $(loadingIcon).hide();
      $(loadingIcon).remove();
      stockWidget.generateURL();
    } catch (error) {
      console.error("Error:", error);
      $(loadingIcon).hide();
      $(loadingIcon).remove();
    }
  },  
  getApiEndPoint: function () {
    return this.apiEndPoint;
  },
  exchangeValue: () => {
    const activeElement = document.querySelector(".stock-button.active");
    if (activeElement) {
      if (activeElement.querySelector(".txt").innerText == "NSE") {
        return "nse";
      } else {
        return "bse";
      }
    } else {
      return null;
    }
  },
  handleWidgetMenuClick: (event) => {
    event.preventDefault();
    const clickedAnchor = event.target;
    const dataName = clickedAnchor.getAttribute("data-name");
    const anchors = document.querySelectorAll(".widget-menu ul li a");
    anchors.forEach((anchor) => {
      anchor.classList.remove("active");
    });
    clickedAnchor.classList.add("active");

    const activeStockBtn = document.querySelector(".stock-button.active");
    const stockBtnText = activeStockBtn
      .querySelector(".txt")
      .textContent.toLowerCase();

    if (dataName === "gainer" || dataName === "loser") {
      $("#stockW-dropdown ul li.active").removeClass("active");
      $("#stockW-dropdown ul li:first-child").addClass("active");

      const dropdownValue = stockBtnText === "nse" ? "Nifty 50" : "BSE Sensex";
      $(".dropdown-btn .textD").text(dropdownValue);
    } else if (dataName === "high" || dataName === "low") {
      const dropdownValue = stockBtnText === "nse" ? "Nifty 500" : "BSE 500";
      $("#stockW-dropdown ul li.active").removeClass("active");
      $(`#stockW-dropdown ul li:contains('${dropdownValue}')`).addClass(
        "active"
      );
      $(".dropdown-btn .textD").text(dropdownValue);
    }
    stockWidget.apiHandler(dataName);
  },
  apiHandler: (dataName) => {
    let apiUrl = "";
    const getValueXChange = stockWidget.exchangeValue();
    const exValue = stockWidget.exchangeValue();
    let secureCode = stockWidget.securityCode();

    // Disable dropdown if the selected dataName is buyers, sellers, price, or volume
    const disableDropdown = [
      "indices",
      "buyers",
      "sellers",
      "price",
      "volume",
    ].includes(dataName);
    $(".widget-dropdown").toggleClass("disabled", disableDropdown);

    // Skip handling the case for 52 week high or 52 week low if a dropdown item is clicked
    const dropdownItemClicked = $(".dropdown-content li").hasClass("active");
    if (!dropdownItemClicked && (dataName === "high" || dataName === "low")) {
      secureCode =
        exValue === "nse" ? "017023929.00026005004" : "017023928.00026005005";
      const dropdownText = exValue === "nse" ? "Nifty 500" : "BSE 500";
      $(".dropdown-btn .textD").text(dropdownText);
      $("#stockW-dropdown ul li").removeClass("active");
      $(`#stockW-dropdown ul li:contains('${dropdownText}')`).addClass(
        "active"
      );
    }
    // else if (!dropdownItemClicked && (dataName === "gainer" || dataName === "loser")) {
    //   const dropdownText = (exValue === "nse") ? "Nifty 50" : "BSE Sensex";
    //   $(".dropdown-btn .text").text(dropdownText);
    //   $("#stockW-dropdown ul li").removeClass("active");
    //   $(`#stockW-dropdown ul li:contains('${dropdownText}')`).addClass("active");
    // }

    switch (dataName) {
      case "indices":
        apiUrl = `${stockWidget.apiEndPoint}/${dataName}/day/5/${getValueXChange}`;
        break;
      case "gainer":
      case "loser":
        apiUrl = `${stockWidget.apiEndPoint}/gainnerlaggards/${getValueXChange}/${dataName}/indices/${secureCode}/5/day?page=widget`;
        break;
      case "buyers":
      case "sellers":
        apiUrl = `${stockWidget.apiEndPoint}/buyersellers/${getValueXChange}/${dataName}/5`;
        break;
      case "high":
      case "low":
        apiUrl = `${stockWidget.apiEndPoint}/fiftytwoweekhighlow/${getValueXChange}/${dataName}/indices/${secureCode}/5?page=widget`;
        break;
      case "price":
      case "volume":
        apiUrl = `${stockWidget.apiEndPoint}/pricevolumeshockers/${getValueXChange}/${dataName}/5`;
        break;
      default:
        // Handle other cases if needed
        break;
    }

    stockWidget.tableRenderData("stock-table-render", apiUrl);
  },
  getNavDataName: () => {
    const activeItem = document.querySelector(".widget-menu li a.active");
    if (activeItem) {
      return activeItem.getAttribute("data-name");
    }
    return null;
  },
  getDataPrefix: () => {
    var activeLink = document.querySelector(".widget-menu a.active");
    if (activeLink) {
      return activeLink.getAttribute("data-prefix");
    }
    return null;
  },
  toggleExchange: () => {
    $(".stock-button").click(function () {
      let apiUrl;
      $(".stock-button").removeClass("active");
      $(this).toggleClass("active");
      const prefixVal = stockWidget.getDataPrefix();
      const xchgVal = stockWidget.exchangeValue();
      const activeMenu = stockWidget.getNavDataName();
      
      if ($(this).hasClass("active")) {
        stockWidget.renderIndicesList(
          "stockW-dropdown",
          `${stockWidget.apiEndPoint}/indices/day/100/${xchgVal}`
        );
      }
      setTimeout(() => {
        const secCode = stockWidget.securityCode();
        if (activeMenu === "indices") {
          apiUrl = `${stockWidget.apiEndPoint}/indices/day/5/${xchgVal}`;
        } else if (activeMenu === "high" || activeMenu === "low") {
          apiUrl = `${stockWidget.apiEndPoint}/${prefixVal}/${xchgVal}/${activeMenu}/indices/${secCode}/5?page=widget`;
        } else {
          apiUrl = `${stockWidget.apiEndPoint}/${prefixVal}/${xchgVal}/${activeMenu}/indices/${secCode}/5/day?page=widget`;
        }
        stockWidget.tableRenderData("stock-table-render", apiUrl);
      }, 1000)
      

      
      setTimeout(() => {
        stockWidget.ddTextUpdate(activeMenu);
      }, 500);
    });
  },
  ddTextUpdate: (activeMenu) => {
    const activeStockBtn = document.querySelector(".stock-button.active");
    const stockBtnText = activeStockBtn
      .querySelector(".txt")
      .textContent.toLowerCase();

    if (
      (activeMenu === "high" || activeMenu === "low") &&
      (stockBtnText === "nse" || stockBtnText === "bse")
    ) {
      // console.log(`high low active with ${stockBtnText}`);
      const dropdownValue = stockBtnText === "nse" ? "Nifty 500" : "BSE 500";
      $("#stockW-dropdown ul li.active").removeClass("active");
      $(`#stockW-dropdown ul li:contains('${dropdownValue}')`).addClass(
        "active"
      );
      $(".dropdown-btn .textD").text(dropdownValue);
    } else if (
      (activeMenu === "loser" || activeMenu === "gainer") &&
      (stockBtnText === "nse" || stockBtnText === "bse")
    ) {
      // console.log(`loser gainer active with ${stockBtnText}`);
      $("#stockW-dropdown ul li.active").removeClass("active");
      $("#stockW-dropdown ul li:first-child").addClass("active");
      const dropdownValue = stockBtnText === "nse" ? "Nifty 50" : "BSE Sensex";
      $(".dropdown-btn .textD").text(dropdownValue);
    }
  },
  toggleDD: () => {
    $(".widget-dropdown .dropdown-btn").click(function () {
      $(".dropdown-content").toggle();
      stockWidget.setDDList();
    });
  },
  setDDList: () => {
    $("#stockW-dropdown ul li")
      .off("click")
      .on("click", function () {
        var selectedValue = $(this).data("code");
        var selectedText = $(this).text();
        $(".textD").text(selectedText);
        $(".dropdown-content").hide();
        $("#stockW-dropdown ul li.active").removeClass("active");
        $(this).addClass("active");
        const dataName = stockWidget.getNavDataName();
        if (dataName) {
          stockWidget.apiHandler(dataName);
        }
      });

    $("#stockW-dropdown").click((event) => {
      event.stopPropagation();
      $(".dropdown-content").hide();
    });
  },
  widgetMenuActive: () => {
    const links = document.querySelectorAll(".widget-menu ul li a");
    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        links.forEach((link) => link.classList.remove("active"));
        this.classList.add("active");
        const dataName = this.getAttribute("data-name");
        return dataName;
      });
    });
  },
  securityCode: () => {
    const dataCode = document.querySelector("#stockW-dropdown ul li.active");
    return dataCode.getAttribute("data-code");
  },
  reRenderTableOnOrientationChange: () => {
    $(window).on("orientationchange", function () {
      // Destroy the DataTable instance
      $("#your-table").DataTable().destroy();

      // Reinitialize the DataTable with your desired options
      $("#your-table").DataTable({
        // your options here
      });
    });
  },
  tradingOffDays: () => {
    return {
      2023: [
        [26],
        [],
        [7, 30],
        [4, 7, 14],
        [1],
        [28],
        [],
        [15],
        [19],
        [2, 24],
        [14, 27],
        [25],
      ],
    };
  },
  isTradingOn: () => {
    var offDays = stockWidget.tradingOffDays();
    var currentTime = new Date();
    var currentOffset = currentTime.getTimezoneOffset();
    var ISTOffset = 330;
    var ISTTime = new Date(
      currentTime.getTime() + (ISTOffset + currentOffset) * 60000
    );
    var year = ISTTime.getFullYear();
    var month = ISTTime.getMonth();
    var date = ISTTime.getDate();
    if (offDays.hasOwnProperty(year))
      if (offDays[year][month].indexOf(date) != -1) return false;
    const currentDayOfWeek = ISTTime.getDay();
    if (currentDayOfWeek == 0 || currentDayOfWeek == 6) return false;
    const hours = ISTTime.getHours();
    //if((hours<9) || (hours>15))return false;
    const minutes = ISTTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 538 || totalMinutes > 930) return false;
    return true;
  },
  isTradingOnToday: () => {
    var offDays = stockWidget.tradingOffDays();
    var currentTime = new Date();
    var currentOffset = currentTime.getTimezoneOffset();
    var ISTOffset = 330;
    var ISTTime = new Date(
      currentTime.getTime() + (ISTOffset + currentOffset) * 60000
    );
    var year = ISTTime.getFullYear();
    var month = ISTTime.getMonth();
    var date = ISTTime.getDate();
    if (offDays.hasOwnProperty(year))
      if (offDays[year][month].indexOf(date) != -1) return false;
    return true;
  },
  updateLinkHref: () => {
    const activeMenuItem = document.querySelector(".widget-menu a.active");
    const activeStockButton = document.querySelector(".stock-button.active");
    const dataName = activeMenuItem.getAttribute("data-name");
    const dataPrefix = activeMenuItem.getAttribute("data-prefix");
    const stockButtonContent = activeStockButton
      .querySelector(".txt")
      .textContent.toLowerCase();
    let url = "https://www.financialexpress.com/market/";

    if (stockButtonContent === "nse" || stockButtonContent === "bse") {
      if (dataName === "gainer") {
        url +=
          stockButtonContent === "nse"
            ? "nse-top-gainers/"
            : "bse-top-gainers/";
      } else if (dataName === "loser") {
        url +=
          stockButtonContent === "nse" ? "nse-top-losers/" : "bse-top-losers/";
      } else if (dataName === "buyers" || dataName === "sellers") {
        url += "top-" + dataName + "/";
      } else if (dataName === "high" || dataName === "low") {
        url += "52-week-" + dataName + "-" + stockButtonContent + "/";
      } else if (dataName === "indices") {
        url += "stock-market-stats/";
      } else if (dataName === "price" || dataName === "volume") {
        url += dataName + "-shockers/";
      }
    }

    return url;
  },
  generateURL: () => {
    const viewAllLink = document.getElementById("view-all-link");
    viewAllLink.href = stockWidget.updateLinkHref();
  },
  isMobileDevice : () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  deviceRhsHandler: () => {
    const stockWidgetMain = document.querySelector('.stock-widget-main')
    const deviceSize = $(window).width() < 415;
    if (stockWidget.isMobileDevice() && deviceSize) {
      stockWidgetMain.classList.add('mobileDevice');
    } else if($('.stock-widget-main').parents('.ie-network-grid__rhs').length > 0){
      stockWidgetMain.classList.add('mobileDevice');
    } else {
      stockWidgetMain.classList.remove('mobileDevice');
    }
  },
  navClickHandler: () => {
    $(".widget-menu ul li a").on("click", stockWidget.handleWidgetMenuClick);
  },
  checkTradingStatus: async () => {
    let interval;
    const exchangeSelect = stockWidget.exchgeActiveHandler();
    const dataName = stockWidget.navActiveHandler();

    if (stockWidget.isTradingOn()) {
      console.log("==> trading on");
      if(exchangeSelect){
        stockWidget.apiHandler(dataName)
      }
    } else {
      console.log("==> trading off");
      clearInterval(interval); // Clear the interval if trading status is false
    }
  },
  navActiveHandler: () => {
    const activeItem = document.querySelector(".widget-menu li a.active");
    if (activeItem) {
      return activeItem.getAttribute("data-name");
    }
    return null;
  },
  exchgeActiveHandler: () => {
    const activeElement = document.querySelector(".stock-button.active");
    if (activeElement) {
      if (activeElement.querySelector(".txt").innerText == "NSE") {
        return "nse";
      } else {
        return "bse";
      }
    } else {
      return null;
    }
  },
};

initStockWidget = ({ stockWidgetPlHod, stockWidgetAdId }) => {
    if (typeof jQuery !== 'undefined') if (typeof $ === 'undefined') window['$'] = jQuery;
  const htmlCode = `<div class="widget-placeholder-main">
            <div class="widget-head">
                <h2><strong>Stock Action</strong></h2>
                <div class="widget-head-rgt">
                    <div class="toggle-btns">
                        <div class="stock-button active">
                            <div class="txt">nse</div>
                        </div>
                        <div class="stock-button">
                            <div class="txt">bse</div>
                        </div>
                    </div>
                    <div class="widget-dropdown">
                        <div class="dropdown-btn">
                            <div class="textD">Nifty 50</div>
                            <div class="icon arc-d"></div>
                        </div>
                        <div id="stockW-dropdown" class="dropdown-content">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="widget-menu">
                <ul>
                    <li><a href="#" data-name="indices" class="active">Top Performing Indices</a></li>
                    <li><a href="#" data-name="gainer" data-prefix="gainnerlaggards">Top Gainers</a></li>
                    <li><a href="#" data-name="loser" data-prefix="gainnerlaggards">Top loser</a></li>
                    <!-- <li><a href="#" data-name="buyers" data-prefix="buyersellers">Only Buyers</a></li>
                    <li><a href="#" data-name="sellers" data-prefix="buyersellers">Only Sellers</a></li> -->
                    <li><a href="#" data-name="high" data-prefix="fiftytwoweekhighlow">52 Week High</a></li>
                    <li><a href="#" data-name="low" data-prefix="fiftytwoweekhighlow">52 Week Low</a></li>
                    <!-- <li><a href="#" data-name="price" data-prefix="pricevolumeshockers">Price Shockers</a></li>
                    <li><a href="#" data-name="volume" data-prefix="pricevolumeshockers">Volume Shockers</a></li> -->
                </ul>
            </div>
            <div class="widget-container">
                <table id="stock-table-render" class="display" style="width:100%"></table>
                <div class="widget-footer">
                    <a id="view-all-link" href="#">
                        view all
                    </a>
                </div>
            </div>
        </div>`;
  $(stockWidgetPlHod).html(htmlCode);
  $(document).ready(async function () {
    stockWidget.deviceRhsHandler();
    //stockWidget.orentationDetect();
    try {
      const endPoint = stockWidget.getApiEndPoint();
      const exchangeName = stockWidget.exchangeValue();
      stockWidget.toggleExchange();

      await stockWidget.renderIndicesList(
        "stockW-dropdown",
        `${endPoint}/indices/day/100/${exchangeName}`
      );
      stockWidget.toggleDD();

      const apiUrl = `${stockWidget.apiEndPoint}/indices/day/5/${exchangeName}`;
      await stockWidget.tableRenderData("stock-table-render", apiUrl);
      $(".widget-dropdown").addClass("disabled");
    } catch (error) {
      console.error(error);
    }
    stockWidget.navClickHandler();
    //stockWidget.adWidget(stockWidgetAdId)

    // Function to check trading status and update data
    stockWidget.checkTradingStatus();

    // Set interval to check trading status every 8 seconds
    interval = setInterval(stockWidget.checkTradingStatus, 120 * 1000);

    $(document).on("click", function (event) {
      if (
        !$(event.target).closest(".widget-dropdown").length &&
        $(".dropdown-content").is(":visible")
      ) {
        $(".dropdown-content").hide();
      }
    });
    
  });
};
import fs from "fs";

export const getTransfer = (req, res) => {
  console.time("test");

  const jsonFile = fs.readFileSync("data/order.json", "utf8");
  const jsonData = JSON.parse(jsonFile);

  const key = Object.keys(jsonData);
  const logs = jsonData[key];

  let resLog = [];

  //log types
  const dateRegex = new RegExp(/\[[0-9-: ]*\]/g);
  const startOrderMsg = new RegExp("Start Order");
  const insertOrderProductArrMsg = new RegExp("Insert orderProduct Arr.");
  const changeOrderStatusMsg = new RegExp("Change orderProduct deliveryStatus");
  const cancelMsg = new RegExp("Change orderProduct status to cancelled.");
  const terminateMsg = new RegExp("Change order status to terminate");
  const settlePriceMsg = new RegExp("settlePrice is considered");
  const completePurchaseMsg = new RegExp("complete purchase");
  const paidMsg = new RegExp("Paid");

  const getProductId = (log) => {
    return log.match(/orderProductId\([0-9, ]*\)/)[0].match(/\d+/g);
  };

  const makeJson = (basicJson, type, status, productId) => {
    const json = { ...basicJson, type, status, productId };
    return json;
  };

  for (const { id, orderLog } of logs) {
    let log = orderLog.split("\n").filter((log) => log.length !== 0);

    log = log.map((log) => {
      let json = {
        id,
        date: log.match(dateRegex)[0].replace(/\[|\]/g, ""),
      };

      if (startOrderMsg.test(log)) {
        json = makeJson(json, "Start");

        return json;
      } else if (insertOrderProductArrMsg.test(log)) {
        const productIds = getProductId(log);

        let jsonArr = [];

        for (const productId of productIds) {
          jsonArr = jsonArr.concat(
            makeJson(
              json,
              "Insert Into Order List",
              "Delivery Start",
              productId
            )
          );
        }

        return jsonArr;
      } else if (changeOrderStatusMsg.test(log)) {
        const productId = getProductId(log);

        const status = log.match(/[A-Z][0-9]/g)[0];

        json = makeJson(json, "Change OrderStatus", status, productId);

        return json;
      } else if (cancelMsg.test(log)) {
        const productIds = getProductId(log);

        let jsonArr = [];

        for (const productId of productIds) {
          jsonArr = jsonArr.concat(
            makeJson(json, "Cancel", "Cancelled", productId)
          );
        }

        return jsonArr;
      } else if (terminateMsg.test(log)) {
        json = makeJson(json, "Terminate", "Terminated");

        return json;
      } else if (settlePriceMsg.test(log)) {
        json = makeJson(json, "SettlePrice");

        return json;
      } else if (completePurchaseMsg.test(log)) {
        json = makeJson(json, "Complete Purchase", "Purchased");

        return json;
      } else if (paidMsg.test(log)) {
        json = makeJson(json, "Paid");

        return json;
      } else {
        json = makeJson(json, "Exception");
        console.log(log);
        // return json;
        return null;
      }
    });

    // resLog = [...resLog, ...log];
    resLog = resLog.concat(log);
  }

  resLog = resLog.flat();

  console.timeEnd("test");

  res.render("transfer", {
    logs: resLog,
  });
};

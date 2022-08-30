import fs from "fs";

export const getTransfer = (req, res) => {
  console.time("test");
  const jsonFile = fs.readFileSync("data/order.json", "utf8");
  const jsonData = JSON.parse(jsonFile);

  const key = Object.keys(jsonData);
  const logs = jsonData[key];

  let logArr = [];

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

  for (const { id, orderLog } of logs) {
    let log = orderLog.split("\n").filter((log) => log.length !== 0);

    log = log.map((log) => {
      let json = {
        id,
        date: log.match(dateRegex)[0].replace(/\[|\]/g, ""),
      };

      if (startOrderMsg.test(log)) {
        json = { type: "Start", ...json };

        return json;
      } else if (insertOrderProductArrMsg.test(log)) {
        const productIds = log
          .match(/orderProductId\([0-9,]*\)/)[0]
          .match(/\d+/g);

        let jsonArr = [];

        for (const productId of productIds) {
          //   jsonArr = [
          //     ...jsonArr,
          //     {
          //       type: "Insert Into Order List",
          //       ...json,
          //       productId,
          //       status: "Delivery Start",
          //     },
          //   ];
          jsonArr = jsonArr.concat({
            type: "Insert Into Order List",
            ...json,
            productId,
            status: "Delivery Start",
          });
        }

        return jsonArr;
      } else if (changeOrderStatusMsg.test(log)) {
        const productId = log
          .match(/orderProductId\([0-9,]*\)/)[0]
          .match(/\d+/g);

        const status = log.match(/[A-Z][0-9]/g)[0];

        json = {
          type: "Change OrderStatus",
          productId,
          status,
          ...json,
        };

        return json;
      } else if (cancelMsg.test(log)) {
        const productId = log
          .match(/orderProductId\([0-9, ]*\)/)[0]
          .match(/\d+/g);

        json = {
          type: "Cancelled",
          productId,
          ...json,
          status: "Cancelled",
        };

        return json;
      } else if (terminateMsg.test(log)) {
        json = {
          type: "Terminate",
          ...json,
          status: "Terminate",
        };

        return json;
      } else if (settlePriceMsg.test(log)) {
        json = {
          type: "SettlePrice",
          ...json,
        };

        return json;
      } else if (completePurchaseMsg.test(log)) {
        json = {
          type: "Complete Purchase",
          ...json,
          status: "Complete Purchase",
        };

        return json;
      } else if (paidMsg.test(log)) {
        json = {
          type: "Paid",
          ...json,
        };

        return json;
      } else {
        const json = { type: "Error" };
        console.log(log);
        // return json;
        return null;
      }
    });

    // logArr = [...logArr, ...log];
    logArr = logArr.concat(log);
  }

  logArr = logArr.flat();

  console.timeEnd("test");

  res.render("transfer", {
    logs: logArr,
  });
};

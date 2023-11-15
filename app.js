const { Network, Alchemy } = require("alchemy-sdk");
require("dotenv").config();

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const contractAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
//set what royalty fees are supposed to be
const royalties = 0.025;

const getSalesWithFees = async () => {
  const startTime = new Date();
  let totalWithFees = 0;
  totalSales = 0;
  let whitelisted = new Set();
  let blacklisted = new Set();
  let pageKey = null; // initialize the pageKey to null
  let sales = null; // initialize the sales object to null

  do {
    const queryParams = {
      contractAddress: contractAddress,
      pageKey: pageKey, // pass the pageKey to the queryParams
      order: "desc",
    };
    sales = await alchemy.nft.getNftSales(queryParams); // get the sales data for the current page

    for (const txn of sales.nftSales) {
      console.log(txn.sellerAddress);
      let totalFee =
        parseInt(txn.sellerFee.amount) + parseInt(txn.royaltyFee.amount);
      if (typeof txn.protocolFee.amount !== "undefined") {
        totalFee += parseInt(txn.protocolFee.amount);
      }
      console.log(totalFee);
      // console.log(
      //   "seller: " +
      //     txn.sellerFee.amount +
      //     " royalty: " +
      //     txn.royaltyFee.amount +
      //     " protocol: " +
      //     txn.protocolFee.amount
      // );

      if (txn.royaltyFee.amount / totalFee >= royalties) {
        totalWithFees++;
        console.log("sold w/ fees");
        if (!blacklisted.has(txn.sellerAddress)) {
          whitelisted.add(txn.sellerAddress);
        }
      } else {
        blacklisted.add(txn.sellerAddress);
      }
    }
    totalSales += sales.nftSales.length;
    pageKey = sales.pageKey; // update the pageKey to the next page key
  } while (pageKey != null); // repeat until there is no more page

  console.log(
    "There has been " + totalSales + " total sales in this collection"
  );
  console.log(
    "Persentage of people paying proper royalties = " +
      (totalWithFees / totalSales) * 100 +
      "%"
  );
  const endTime = new Date();
  const elapsedTime = endTime - startTime;
  console.log(
    "A total of " + blacklisted.size + " wallets did not pay their fees"
  );
  console.log(`The program ran for ${elapsedTime} milliseconds.`);
};

getSalesWithFees();

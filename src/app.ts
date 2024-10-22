// Ignore SSL error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const range = (start: number, stop: number, step = 1) =>
  Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step
  );

const serverNumbers = range(1, 31); // 1 ~ 30

const prepareRequests = (tries: number = 1) => {
  const tryRange = range(1, tries + 1);
  let results: Promise<Response>[] = [];

  tryRange.forEach(() => {
    const fetchPromises = serverNumbers.map((serverNumber, _) => {
      const url = `<<url with ${serverNumber}>>`;
      const name = `<<name value>>`;

      return fetch(`${url}?name=${name}`, {
        method: "GET",
        headers: {
          ["cache-control"]: "no-cache",
        },
      });
    });

    results = [...results, ...fetchPromises];
  });

  return results;
};

const requests = prepareRequests(50);
const timeMeasureScopeName = "Request";

console.time(timeMeasureScopeName);

let subset = requests.splice(0, 10);
do {
  delay(200)
    .then(() => {
      return Promise.all(subset);
    })
    .then((results) => {
      results.forEach(async (result) => {
        console.info("result=", await result.json());
      });
    })
    .finally(() => {});

  subset = requests.splice(0, 30);
} while (subset.length > 0);

console.timeEnd(timeMeasureScopeName);
console.info("Done");

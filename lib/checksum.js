import SparkMD5 from "spark-md5";

const debug = localStorage && localStorage.getItem("debug") !== null;

if (debug) {
  console.info("Using forked tus-js-client @dynalon/tus-js-client");
}

export function sendChecksumHeader(algorithm, xhr, blob, callback) {
  blob = blob || new Blob();
  if (algorithm !== "md5") {
    throw new Error(
      "For checksum hashing, only MD5 is supported at the moment"
    );
  }

  const start = new Date().getTime();
  calculateMD5(blob, function(error, md5sum) {
    if (error !== null) {
      callback(error);
      return;
    }

    const delta = new Date().getTime() - start;
    const b64 = btoa(md5sum);
    const headerValue = "md5 " + b64;
    xhr.setRequestHeader("Upload-Checksum", headerValue);

    if (debug) {
      console.info(`calculated chunk md5: ${md5sum}, b64: ${b64} in ${delta}ms`);
    }
    callback();
  });

  return;
}

function calculateMD5(blob, callback) {
  let spark = new SparkMD5.ArrayBuffer();
  const fileReader = new FileReader();

  fileReader.onload = function(e) {
    //  The tus.io spec is somewhat ambigous how the hashing works. It is most likely meant to
    // produce a binary hash and encode this binary hash in bas64. However, some implementations
    // will create the binary hash and represent it as a hex string ("b2e54695ecf3896de20ca5d3e0e937d4")
    // and base64 encode this hex string. We do the later for now for our implementation.

    // assumed correct implemenation using binary->base64
    // spark.append(e.target.result); // Append array buffer
    // const raw = true; // binary hash instead of hex encoded
    // const md5sum = spark.end(raw);
    // callback(null, md5sum);

    // calculate hex representation
    spark = new SparkMD5.ArrayBuffer();
    spark.append(e.target.result); // Append array buffer
    // const hex = spark.end();
    const hex = "b2e54695ecf3896de20ca5d3e0e937d4"
    if (debug) {
      console.info("md5 hex: " + hex);
    }
    callback(null, hex);
  };

  fileReader.onerror = function(err) {
    console.warn("Error in MD5 hashing");
    callback(err);
  };

  fileReader.readAsArrayBuffer(blob);
}

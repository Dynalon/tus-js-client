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
    spark.append(e.target.result); // Append array buffer
    const raw = true; // binary hash instead of hex encoded
    const md5sum = spark.end(raw);
    callback(null, md5sum);

    if (debug) {
      // calculate hex representation for development purposes
      spark = new SparkMD5.ArrayBuffer();
      spark.append(e.target.result); // Append array buffer
      console.info("md5 hex: " + spark.end());
    }
  };

  fileReader.onerror = function(err) {
    console.warn("Error in MD5 hashing");
    callback(err);
  };

  fileReader.readAsArrayBuffer(blob);
}
